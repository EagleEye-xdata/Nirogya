from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ReportStatus(str, Enum):
    UPLOADED = "Uploaded"
    ANALYZING = "Analyzing"
    ANALYZED = "Analyzed"
    SENT_TO_DOCTOR = "Sent to Doctor"
    REVIEWED = "Reviewed"
    ARCHIVED = "Archived"


class ReportType(str, Enum):
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    IMAGING = "imaging"
    CONSULTATION = "consultation"
    VACCINATION = "vaccination"
    OTHER = "other"


class SeverityLevel(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class Finding(BaseModel):
    key: str
    value: str
    severity: Optional[SeverityLevel] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None


class AIAnalysis(BaseModel):
    summary: str
    findings: List[Finding]
    recommendations: List[str]
    confidence: float = Field(ge=0, le=1)
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    model_version: Optional[str] = None


class Prescription(BaseModel):
    medicine: str
    dosage: str
    duration: str
    frequency: Optional[str] = None
    notes: Optional[str] = None


class DoctorFeedback(BaseModel):
    comment: str
    recommendations: List[str]
    prescriptions: List[Prescription] = []
    follow_up_date: Optional[datetime] = None
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)
    doctor_id: str
    doctor_name: str


class ReportMetadata(BaseModel):
    hospital_name: Optional[str] = None
    lab_name: Optional[str] = None
    test_date: Optional[datetime] = None
    report_category: Optional[str] = None
    referring_doctor: Optional[str] = None
    test_id: Optional[str] = None
    technician_notes: Optional[str] = None


class MedicalRecordBase(BaseModel):
    patient_id: str
    name: str
    report_type: ReportType
    status: ReportStatus = ReportStatus.UPLOADED
    additional_notes: Optional[str] = None
    metadata: Optional[ReportMetadata] = None


class MedicalRecordCreate(MedicalRecordBase):
    file_url: str
    file_type: str
    file_size: int


class MedicalRecordUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ReportStatus] = None
    additional_notes: Optional[str] = None
    analysis: Optional[AIAnalysis] = None
    doctor_feedback: Optional[DoctorFeedback] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None


class MedicalRecordInDB(MedicalRecordBase):
    id: str
    file_url: str
    file_type: str
    file_size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    analysis: Optional[AIAnalysis] = None
    doctor_feedback: Optional[DoctorFeedback] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class MedicalRecord(MedicalRecordBase):
    id: str
    file_url: str
    file_type: str
    file_size: int
    uploaded_at: datetime
    analysis: Optional[AIAnalysis] = None
    doctor_feedback: Optional[DoctorFeedback] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None


class ShareRequest(BaseModel):
    report_id: str
    doctor_id: str
    access_type: str = "view"  # view, download, comment
    expires_at: Optional[datetime] = None
    message: Optional[str] = None


class ShareToken(BaseModel):
    token: str
    report_id: str
    doctor_id: str
    access_type: str
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_used: bool = False
