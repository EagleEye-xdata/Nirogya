from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from jose import JWTError

from app.core.security import verify_token
from app.core.database import get_database
from app.models.user import User, UserRole
from app.services.user_service import UserService
from app.services.medical_record_service import MedicalRecordService
from app.services.appointment_service import AppointmentService
from app.services.notification_service import NotificationService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(token, "access")
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if current_user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_role(required_roles: list[UserRole]):
    """Dependency to require specific user roles"""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker


def require_doctor_role(current_user: User = Depends(require_role([UserRole.DOCTOR, UserRole.ADMIN]))) -> User:
    """Require doctor or admin role"""
    return current_user


def require_patient_role(current_user: User = Depends(require_role([UserRole.PATIENT, UserRole.ADMIN]))) -> User:
    """Require patient or admin role"""
    return current_user


def require_admin_role(current_user: User = Depends(require_role([UserRole.ADMIN]))) -> User:
    """Require admin role"""
    return current_user


# Service dependencies
def get_user_service() -> UserService:
    """Get user service instance"""
    return UserService(get_database())


def get_medical_record_service() -> MedicalRecordService:
    """Get medical record service instance"""
    return MedicalRecordService(get_database())


def get_appointment_service() -> AppointmentService:
    """Get appointment service instance"""
    return AppointmentService(get_database())


def get_notification_service() -> NotificationService:
    """Get notification service instance"""
    return NotificationService(get_database())
