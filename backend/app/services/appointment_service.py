from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.appointment import (
    Appointment, AppointmentCreate, AppointmentUpdate,
    AppointmentInDB, AppointmentStatus, AppointmentType,
    AppointmentSlot, AppointmentRequest
)
from app.core.exceptions import NotFoundError, ValidationError, ConflictError


class AppointmentService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.appointments
    
    async def create_appointment(self, appointment_data: AppointmentCreate) -> Appointment:
        """Create a new appointment"""
        try:
            # Check for conflicts
            existing_appointment = await self.collection.find_one({
                "doctor_id": appointment_data.doctor_id,
                "appointment_date": appointment_data.appointment_date,
                "status": {"$in": ["scheduled", "confirmed"]}
            })
            
            if existing_appointment:
                raise ConflictError("Doctor has a conflicting appointment at this time")
            
            # Create appointment document
            appointment_doc = {
                "patient_id": appointment_data.patient_id,
                "doctor_id": appointment_data.doctor_id,
                "appointment_type": appointment_data.appointment_type,
                "appointment_date": appointment_data.appointment_date,
                "duration_minutes": appointment_data.duration_minutes,
                "status": appointment_data.status,
                "notes": appointment_data.notes,
                "symptoms": appointment_data.symptoms,
                "is_telemedicine": appointment_data.is_telemedicine,
                "meeting_link": appointment_data.meeting_link,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert appointment
            result = await self.collection.insert_one(appointment_doc)
            appointment_id = str(result.inserted_id)
            
            return await self.get_appointment_by_id(appointment_id)
            
        except Exception as e:
            if isinstance(e, (ConflictError, ValidationError)):
                raise
            raise ValidationError(f"Failed to create appointment: {str(e)}")
    
    async def get_appointment_by_id(self, appointment_id: str) -> Optional[Appointment]:
        """Get appointment by ID"""
        try:
            appointment_doc = await self.collection.find_one({"_id": ObjectId(appointment_id)})
            if not appointment_doc:
                return None
            
            return self._doc_to_appointment(appointment_doc)
        except Exception:
            return None
    
    async def get_patient_appointments(
        self, 
        patient_id: str, 
        limit: int = 100, 
        skip: int = 0,
        status: Optional[AppointmentStatus] = None
    ) -> List[Appointment]:
        """Get all appointments for a patient"""
        try:
            query = {"patient_id": patient_id}
            if status:
                query["status"] = status
            
            cursor = self.collection.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
            appointments = []
            async for appointment_doc in cursor:
                appointments.append(self._doc_to_appointment(appointment_doc))
            return appointments
        except Exception:
            return []
    
    async def get_doctor_appointments(
        self, 
        doctor_id: str, 
        limit: int = 100, 
        skip: int = 0,
        status: Optional[AppointmentStatus] = None
    ) -> List[Appointment]:
        """Get all appointments for a doctor"""
        try:
            query = {"doctor_id": doctor_id}
            if status:
                query["status"] = status
            
            cursor = self.collection.find(query).sort("appointment_date", -1).skip(skip).limit(limit)
            appointments = []
            async for appointment_doc in cursor:
                appointments.append(self._doc_to_appointment(appointment_doc))
            return appointments
        except Exception:
            return []
    
    async def get_appointments_by_date_range(
        self,
        doctor_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Appointment]:
        """Get appointments for a doctor within a date range"""
        try:
            cursor = self.collection.find({
                "doctor_id": doctor_id,
                "appointment_date": {
                    "$gte": start_date,
                    "$lte": end_date
                }
            }).sort("appointment_date", 1)
            
            appointments = []
            async for appointment_doc in cursor:
                appointments.append(self._doc_to_appointment(appointment_doc))
            return appointments
        except Exception:
            return []
    
    async def update_appointment(
        self, 
        appointment_id: str, 
        update_data: AppointmentUpdate
    ) -> Optional[Appointment]:
        """Update appointment"""
        try:
            update_dict = {}
            
            if update_data.appointment_type is not None:
                update_dict["appointment_type"] = update_data.appointment_type
            if update_data.appointment_date is not None:
                update_dict["appointment_date"] = update_data.appointment_date
            if update_data.duration_minutes is not None:
                update_dict["duration_minutes"] = update_data.duration_minutes
            if update_data.status is not None:
                update_dict["status"] = update_data.status
            if update_data.notes is not None:
                update_dict["notes"] = update_data.notes
            if update_data.symptoms is not None:
                update_dict["symptoms"] = update_data.symptoms
            if update_data.is_telemedicine is not None:
                update_dict["is_telemedicine"] = update_data.is_telemedicine
            if update_data.meeting_link is not None:
                update_dict["meeting_link"] = update_data.meeting_link
            
            # Handle status-specific updates
            if update_data.status == "cancelled":
                update_dict["cancelled_at"] = datetime.utcnow()
            elif update_data.status == "completed":
                update_dict["completed_at"] = datetime.utcnow()
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"_id": ObjectId(appointment_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count == 0:
                return None
            
            return await self.get_appointment_by_id(appointment_id)
        except Exception:
            return None
    
    async def cancel_appointment(self, appointment_id: str, user_id: str) -> bool:
        """Cancel an appointment"""
        try:
            # Check if appointment exists and user has permission
            appointment = await self.get_appointment_by_id(appointment_id)
            if not appointment:
                return False
            
            if appointment.patient_id != user_id and appointment.doctor_id != user_id:
                return False
            
            # Update appointment status
            result = await self.collection.update_one(
                {"_id": ObjectId(appointment_id)},
                {
                    "$set": {
                        "status": "cancelled",
                        "cancelled_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def get_available_slots(
        self, 
        doctor_id: str, 
        date: datetime
    ) -> List[AppointmentSlot]:
        """Get available appointment slots for a doctor on a specific date"""
        try:
            start_of_day = date.replace(hour=9, minute=0, second=0, microsecond=0)
            end_of_day = date.replace(hour=17, minute=0, second=0, microsecond=0)
            
            # Get existing appointments for the day
            existing_appointments = await self.get_appointments_by_date_range(
                doctor_id, start_of_day, end_of_day
            )
            
            # Generate time slots (30-minute intervals)
            slots = []
            current_time = start_of_day
            
            while current_time < end_of_day:
                # Check if slot is available
                is_available = True
                appointment_id = None
                
                for appointment in existing_appointments:
                    if (appointment.appointment_date <= current_time < 
                        appointment.appointment_date + timedelta(minutes=appointment.duration_minutes)):
                        is_available = False
                        appointment_id = appointment.id
                        break
                
                slots.append(AppointmentSlot(
                    doctor_id=doctor_id,
                    date=date,
                    start_time=current_time.strftime("%H:%M"),
                    end_time=(current_time + timedelta(minutes=30)).strftime("%H:%M"),
                    is_available=is_available,
                    appointment_id=appointment_id
                ))
                
                current_time += timedelta(minutes=30)
            
            return slots
        except Exception:
            return []
    
    async def request_appointment(self, request_data: AppointmentRequest) -> Appointment:
        """Request an appointment (creates with pending status)"""
        try:
            appointment_data = AppointmentCreate(
                patient_id=request_data.patient_id,
                doctor_id=request_data.doctor_id,
                appointment_type=request_data.appointment_type,
                appointment_date=request_data.preferred_date,
                status="scheduled",  # Will be confirmed by doctor
                notes=request_data.notes,
                symptoms=request_data.symptoms
            )
            
            return await self.create_appointment(appointment_data)
        except Exception as e:
            raise ValidationError(f"Failed to request appointment: {str(e)}")
    
    def _doc_to_appointment(self, appointment_doc: dict) -> Appointment:
        """Convert database document to Appointment model"""
        return Appointment(
            id=str(appointment_doc["_id"]),
            patient_id=appointment_doc["patient_id"],
            doctor_id=appointment_doc["doctor_id"],
            appointment_type=appointment_doc["appointment_type"],
            appointment_date=appointment_doc["appointment_date"],
            duration_minutes=appointment_doc["duration_minutes"],
            status=appointment_doc["status"],
            notes=appointment_doc.get("notes"),
            symptoms=appointment_doc.get("symptoms"),
            is_telemedicine=appointment_doc.get("is_telemedicine", False),
            meeting_link=appointment_doc.get("meeting_link"),
            created_at=appointment_doc["created_at"],
            updated_at=appointment_doc["updated_at"],
            cancelled_at=appointment_doc.get("cancelled_at"),
            completed_at=appointment_doc.get("completed_at")
        )
