from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    APPOINTMENT = "appointment"
    AI_ANALYSIS = "ai_analysis"
    REPORT = "report"
    PRESCRIPTION = "prescription"
    REMINDER = "reminder"
    SYSTEM = "system"
    EMERGENCY = "emergency"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class NotificationBase(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    status: NotificationStatus = NotificationStatus.UNREAD
    data: Optional[Dict[str, Any]] = None
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    read_at: Optional[datetime] = None


class NotificationInDB(NotificationBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None


class Notification(NotificationBase):
    id: str
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationPreferences(BaseModel):
    user_id: str
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    appointment_reminders: bool = True
    report_updates: bool = True
    ai_analysis_complete: bool = True
    prescription_reminders: bool = True
