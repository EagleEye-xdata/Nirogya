from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime

from app.models.medical_record import (
    MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate,
    ReportStatus, ShareRequest, DoctorFeedback
)
from app.models.user import User
from app.core.dependencies import (
    get_current_active_user, 
    require_patient_role, 
    require_doctor_role,
    get_medical_record_service
)
from app.services.medical_record_service import MedicalRecordService
from app.core.exceptions import NotFoundError, ValidationError, AuthorizationError

router = APIRouter()


@router.post("/upload", response_model=MedicalRecord)
async def upload_medical_record(
    file: UploadFile = File(...),
    report_type: str = Form(...),
    additional_notes: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    lab_name: Optional[str] = Form(None),
    test_date: Optional[str] = Form(None),
    current_user: User = Depends(require_patient_role),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Upload a new medical record"""
    try:
        # Validate file
        if file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 10MB limit"
            )
        
        # Validate file type
        allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/tiff"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not supported"
            )
        
        # Create medical record
        record_data = MedicalRecordCreate(
            patient_id=current_user.id,
            name=file.filename,
            report_type=report_type,
            file_url="",  # Will be set after upload
            file_type=file.content_type,
            file_size=file.size,
            additional_notes=additional_notes
        )
        
        # Upload file and create record
        record = await medical_record_service.create_medical_record(
            record_data, current_user.id
        )
        
        return record
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/", response_model=List[MedicalRecord])
async def get_my_medical_records(
    status: Optional[ReportStatus] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(get_current_active_user),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Get current user's medical records"""
    try:
        if current_user.role == "patient":
            records = await medical_record_service.get_patient_records(
                current_user.id, limit, skip, status
            )
        elif current_user.role == "doctor":
            records = await medical_record_service.get_doctor_records(
                current_user.id, limit, skip
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch records: {str(e)}"
        )


@router.get("/{record_id}", response_model=MedicalRecord)
async def get_medical_record(
    record_id: str,
    current_user: User = Depends(get_current_active_user),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Get a specific medical record"""
    try:
        record = await medical_record_service.get_medical_record_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
        
        # Check access permissions
        if current_user.role == "patient" and record.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "doctor" and record.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch record: {str(e)}"
        )


@router.put("/{record_id}", response_model=MedicalRecord)
async def update_medical_record(
    record_id: str,
    update_data: MedicalRecordUpdate,
    current_user: User = Depends(get_current_active_user),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Update a medical record"""
    try:
        # Check if record exists
        record = await medical_record_service.get_medical_record_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
        
        # Check permissions
        if current_user.role == "patient" and record.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        updated_record = await medical_record_service.update_medical_record(
            record_id, update_data
        )
        
        if not updated_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update record"
            )
        
        return updated_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update record: {str(e)}"
        )


@router.post("/{record_id}/send-to-doctor")
async def send_to_doctor(
    record_id: str,
    doctor_id: str,
    current_user: User = Depends(require_patient_role),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Send medical record to a doctor"""
    try:
        # Check if record exists and belongs to patient
        record = await medical_record_service.get_medical_record_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
        
        if record.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Send to doctor
        success = await medical_record_service.send_to_doctor(record_id, doctor_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send record to doctor"
            )
        
        return {"message": "Record sent to doctor successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send record: {str(e)}"
        )


@router.post("/{record_id}/feedback")
async def add_doctor_feedback(
    record_id: str,
    feedback: DoctorFeedback,
    current_user: User = Depends(require_doctor_role),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Add doctor feedback to a medical record"""
    try:
        # Check if record exists
        record = await medical_record_service.get_medical_record_by_id(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
        
        # Check if doctor has access to this record
        if record.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Add feedback
        success = await medical_record_service.add_doctor_feedback(record_id, feedback)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add feedback"
            )
        
        return {"message": "Feedback added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add feedback: {str(e)}"
        )


@router.post("/share")
async def create_share_token(
    share_request: ShareRequest,
    current_user: User = Depends(require_patient_role),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Create a share token for doctor access"""
    try:
        # Check if record exists and belongs to patient
        record = await medical_record_service.get_medical_record_by_id(share_request.report_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )
        
        if record.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Create share token
        share_token = await medical_record_service.create_share_token(share_request)
        
        return {
            "share_token": share_token.token,
            "expires_at": share_token.expires_at,
            "access_type": share_token.access_type
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create share token: {str(e)}"
        )


@router.get("/shared/{token}")
async def get_shared_record(
    token: str,
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Get medical record using share token"""
    try:
        record = await medical_record_service.get_shared_record(token)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired share token"
            )
        
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get shared record: {str(e)}"
        )


@router.delete("/{record_id}")
async def delete_medical_record(
    record_id: str,
    current_user: User = Depends(require_patient_role),
    medical_record_service: MedicalRecordService = Depends(get_medical_record_service)
):
    """Delete a medical record"""
    try:
        success = await medical_record_service.delete_medical_record(
            record_id, current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete record"
            )
        
        return {"message": "Record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete record: {str(e)}"
        )
