from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date

from app.models.appointment import (
    Appointment, AppointmentCreate, AppointmentUpdate,
    AppointmentRequest, AppointmentSlot, AppointmentStatus
)
from app.models.user import User
from app.core.dependencies import (
    get_current_active_user, 
    require_patient_role, 
    require_doctor_role,
    get_appointment_service
)
from app.services.appointment_service import AppointmentService

router = APIRouter()


@router.post("/", response_model=Appointment)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(require_patient_role),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Create a new appointment"""
    try:
        # Ensure patient_id matches current user
        if appointment_data.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot create appointment for another patient"
            )
        
        appointment = await appointment_service.create_appointment(appointment_data)
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create appointment: {str(e)}"
        )


@router.post("/request", response_model=Appointment)
async def request_appointment(
    request_data: AppointmentRequest,
    current_user: User = Depends(require_patient_role),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Request an appointment"""
    try:
        # Ensure patient_id matches current user
        if request_data.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot request appointment for another patient"
            )
        
        appointment = await appointment_service.request_appointment(request_data)
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request appointment: {str(e)}"
        )


@router.get("/", response_model=List[Appointment])
async def get_my_appointments(
    status: Optional[AppointmentStatus] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(get_current_active_user),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Get current user's appointments"""
    try:
        if current_user.role == "patient":
            appointments = await appointment_service.get_patient_appointments(
                current_user.id, limit, skip, status
            )
        elif current_user.role == "doctor":
            appointments = await appointment_service.get_doctor_appointments(
                current_user.id, limit, skip, status
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return appointments
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointments: {str(e)}"
        )


@router.get("/{appointment_id}", response_model=Appointment)
async def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Get a specific appointment"""
    try:
        appointment = await appointment_service.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        # Check access permissions
        if current_user.role == "patient" and appointment.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "doctor" and appointment.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointment: {str(e)}"
        )


@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_active_user),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Update an appointment"""
    try:
        # Check if appointment exists
        appointment = await appointment_service.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        # Check permissions
        if current_user.role == "patient" and appointment.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        elif current_user.role == "doctor" and appointment.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        updated_appointment = await appointment_service.update_appointment(
            appointment_id, update_data
        )
        
        if not updated_appointment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update appointment"
            )
        
        return updated_appointment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )


@router.post("/{appointment_id}/cancel")
async def cancel_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_active_user),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Cancel an appointment"""
    try:
        success = await appointment_service.cancel_appointment(appointment_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to cancel appointment"
            )
        
        return {"message": "Appointment cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel appointment: {str(e)}"
        )


@router.get("/doctor/{doctor_id}/slots")
async def get_available_slots(
    doctor_id: str,
    date: date = Query(...),
    current_user: User = Depends(get_current_active_user),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Get available appointment slots for a doctor"""
    try:
        # Convert date to datetime
        appointment_date = datetime.combine(date, datetime.min.time())
        
        slots = await appointment_service.get_available_slots(doctor_id, appointment_date)
        return slots
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available slots: {str(e)}"
        )


@router.get("/doctor/{doctor_id}/schedule")
async def get_doctor_schedule(
    doctor_id: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: User = Depends(require_doctor_role),
    appointment_service: AppointmentService = Depends(get_appointment_service)
):
    """Get doctor's schedule for a date range"""
    try:
        # Convert dates to datetime
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        appointments = await appointment_service.get_appointments_by_date_range(
            doctor_id, start_datetime, end_datetime
        )
        
        return appointments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch doctor schedule: {str(e)}"
        )
