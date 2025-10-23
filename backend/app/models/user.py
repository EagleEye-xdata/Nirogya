from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class PatientProfile(BaseModel):
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    allergies: List[str] = []
    emergency_contact: Optional[str] = None
    blood_type: Optional[str] = None
    address: Optional[str] = None
    medical_history: List[str] = []
    current_medications: List[str] = []


class DoctorProfile(BaseModel):
    full_name: str
    phone: Optional[str] = None
    degree: Optional[str] = None
    license_number: Optional[str] = None
    specialization: Optional[str] = None
    clinic: Optional[str] = None
    years_experience: Optional[int] = None
    accepting_new_patients: bool = True
    consultation_fee: Optional[float] = None
    available_times: List[str] = []


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole
    status: UserStatus = UserStatus.PENDING_VERIFICATION
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None


class UserCreate(UserBase):
    password: str
    profile: Optional[PatientProfile | DoctorProfile] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    status: Optional[UserStatus] = None
    is_verified: Optional[bool] = None
    profile: Optional[PatientProfile | DoctorProfile] = None
    last_login: Optional[datetime] = None


class UserInDB(UserBase):
    id: str
    hashed_password: str
    profile: Optional[PatientProfile | DoctorProfile] = None
    verification_token: Optional[str] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None


class User(UserBase):
    id: str
    profile: Optional[PatientProfile | DoctorProfile] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
