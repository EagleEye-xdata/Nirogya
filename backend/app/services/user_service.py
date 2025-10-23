from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import (
    User, UserCreate, UserUpdate, UserInDB, UserRole, 
    PatientProfile, DoctorProfile
)
from app.core.security import (
    get_password_hash, 
    verify_password, 
    generate_secure_token,
    encrypt_sensitive_data,
    decrypt_sensitive_data
)
from app.core.exceptions import NotFoundError, ConflictError, ValidationError
from app.services.email_service import EmailService


class UserService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.users
        self.email_service = EmailService()
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        try:
            # Hash password
            hashed_password = get_password_hash(user_data.password)
            
            # Generate verification token
            verification_token = generate_secure_token()
            
            # Encrypt sensitive profile data
            encrypted_profile = None
            if user_data.profile:
                profile_dict = user_data.profile.dict()
                encrypted_profile = encrypt_sensitive_data(str(profile_dict))
            
            # Create user document
            user_doc = {
                "email": user_data.email,
                "role": user_data.role,
                "status": "pending_verification",
                "is_verified": False,
                "hashed_password": hashed_password,
                "verification_token": verification_token,
                "profile": encrypted_profile,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_login": None
            }
            
            # Insert user
            result = await self.collection.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            # Send verification email
            await self.email_service.send_verification_email(
                user_data.email, verification_token
            )
            
            # Return user without sensitive data
            return User(
                id=user_id,
                email=user_data.email,
                role=user_data.role,
                status="pending_verification",
                is_verified=False,
                profile=user_data.profile,
                created_at=user_doc["created_at"],
                updated_at=user_doc["updated_at"],
                last_login=None
            )
            
        except Exception as e:
            if "duplicate key" in str(e).lower():
                raise ConflictError("Email already registered")
            raise ValidationError(f"Failed to create user: {str(e)}")
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            user_doc = await self.collection.find_one({"_id": ObjectId(user_id)})
            if not user_doc:
                return None
            
            return self._doc_to_user(user_doc)
        except Exception:
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            user_doc = await self.collection.find_one({"email": email})
            if not user_doc:
                return None
            
            return self._doc_to_user(user_doc)
        except Exception:
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        try:
            user_doc = await self.collection.find_one({"email": email})
            if not user_doc:
                return None
            
            # Verify password
            if not verify_password(password, user_doc["hashed_password"]):
                return None
            
            return self._doc_to_user(user_doc)
        except Exception:
            return None
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        try:
            update_data = {}
            
            if user_data.email is not None:
                update_data["email"] = user_data.email
            if user_data.status is not None:
                update_data["status"] = user_data.status
            if user_data.is_verified is not None:
                update_data["is_verified"] = user_data.is_verified
            if user_data.last_login is not None:
                update_data["last_login"] = user_data.last_login
            
            # Handle profile updates
            if user_data.profile is not None:
                encrypted_profile = encrypt_sensitive_data(str(user_data.profile.dict()))
                update_data["profile"] = encrypted_profile
            
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                return None
            
            return await self.get_user_by_id(user_id)
        except Exception:
            return None
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login time"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False
    
    async def verify_email(self, token: str) -> bool:
        """Verify user email with token"""
        try:
            user_doc = await self.collection.find_one({"verification_token": token})
            if not user_doc:
                return False
            
            # Update user status
            result = await self.collection.update_one(
                {"_id": user_doc["_id"]},
                {
                    "$set": {
                        "is_verified": True,
                        "status": "active",
                        "verification_token": None,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def send_password_reset_email(self, email: str) -> bool:
        """Send password reset email"""
        try:
            user_doc = await self.collection.find_one({"email": email})
            if not user_doc:
                return False  # Don't reveal if email exists
            
            # Generate reset token
            reset_token = generate_secure_token()
            reset_expires = datetime.utcnow() + timedelta(hours=1)
            
            # Update user with reset token
            await self.collection.update_one(
                {"_id": user_doc["_id"]},
                {
                    "$set": {
                        "password_reset_token": reset_token,
                        "password_reset_expires": reset_expires
                    }
                }
            )
            
            # Send reset email
            await self.email_service.send_password_reset_email(email, reset_token)
            return True
        except Exception:
            return False
    
    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password with token"""
        try:
            user_doc = await self.collection.find_one({
                "password_reset_token": token,
                "password_reset_expires": {"$gt": datetime.utcnow()}
            })
            
            if not user_doc:
                return False
            
            # Hash new password
            hashed_password = get_password_hash(new_password)
            
            # Update password and clear reset token
            result = await self.collection.update_one(
                {"_id": user_doc["_id"]},
                {
                    "$set": {
                        "hashed_password": hashed_password,
                        "updated_at": datetime.utcnow()
                    },
                    "$unset": {
                        "password_reset_token": "",
                        "password_reset_expires": ""
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def get_users_by_role(self, role: UserRole, limit: int = 100, skip: int = 0) -> List[User]:
        """Get users by role"""
        try:
            cursor = self.collection.find({"role": role}).skip(skip).limit(limit)
            users = []
            async for user_doc in cursor:
                users.append(self._doc_to_user(user_doc))
            return users
        except Exception:
            return []
    
    def _doc_to_user(self, user_doc: dict) -> User:
        """Convert database document to User model"""
        # Decrypt profile if exists
        profile = None
        if user_doc.get("profile"):
            try:
                decrypted_profile = decrypt_sensitive_data(user_doc["profile"])
                # Parse profile based on role
                if user_doc["role"] == "patient":
                    profile = PatientProfile.parse_raw(decrypted_profile)
                elif user_doc["role"] == "doctor":
                    profile = DoctorProfile.parse_raw(decrypted_profile)
            except Exception:
                profile = None
        
        return User(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            role=user_doc["role"],
            status=user_doc["status"],
            is_verified=user_doc["is_verified"],
            profile=profile,
            created_at=user_doc["created_at"],
            updated_at=user_doc["updated_at"],
            last_login=user_doc.get("last_login")
        )
