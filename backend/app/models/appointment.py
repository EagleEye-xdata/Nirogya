from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    RESCHEDULED = "rescheduled"


class AppointmentType(str, Enum):
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"
    ROUTINE_CHECKUP = "routine_checkup"
    SPECIALIST = "specialist"
    TELEMEDICINE = "telemedicine"


class AppointmentBase(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_type: AppointmentType
    appointment_date: datetime
    duration_minutes: int = 30
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    notes: Optional[str] = None
    symptoms: Optional[List[str]] = None
    is_telemedicine: bool = False
    meeting_link: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_type: Optional[AppointmentType] = None
    appointment_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    symptoms: Optional[List[str]] = None
    is_telemedicine: Optional[bool] = None
    meeting_link: Optional[str] = None


class AppointmentInDB(AppointmentBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cancelled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class Appointment(AppointmentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    cancelled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class AppointmentSlot(BaseModel):
    doctor_id: str
    date: datetime
    start_time: str
    end_time: str
    is_available: bool = True
    appointment_id: Optional[str] = None


class AppointmentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    preferred_date: datetime
    preferred_time: Optional[str] = None
    appointment_type: AppointmentType
    notes: Optional[str] = None
    symptoms: Optional[List[str]] = None
