from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.medical_record import (
    MedicalRecord, MedicalRecordCreate, MedicalRecordUpdate,
    MedicalRecordInDB, ReportStatus, AIAnalysis, DoctorFeedback,
    ShareRequest, ShareToken
)
from app.core.exceptions import NotFoundError, ValidationError, AuthorizationError
from app.services.cloud_storage_service import CloudStorageService
from app.services.ai_service import AIService


class MedicalRecordService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.medical_records
        self.share_tokens_collection = database.share_tokens
        self.cloud_storage = CloudStorageService()
        self.ai_service = AIService()
    
    async def create_medical_record(
        self, 
        record_data: MedicalRecordCreate, 
        patient_id: str
    ) -> MedicalRecord:
        """Create a new medical record"""
        try:
            # Upload file to cloud storage
            file_url = await self.cloud_storage.upload_file(
                record_data.file_url,  # Assuming file is already uploaded
                f"medical_records/{patient_id}/{record_data.name}"
            )
            
            # Create record document
            record_doc = {
                "patient_id": patient_id,
                "name": record_data.name,
                "report_type": record_data.report_type,
                "status": record_data.status,
                "file_url": file_url,
                "file_type": record_data.file_type,
                "file_size": record_data.file_size,
                "additional_notes": record_data.additional_notes,
                "metadata": record_data.metadata.dict() if record_data.metadata else None,
                "uploaded_at": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert record
            result = await self.collection.insert_one(record_doc)
            record_id = str(result.inserted_id)
            
            # Start AI analysis in background
            await self._start_ai_analysis(record_id)
            
            return await self.get_medical_record_by_id(record_id)
            
        except Exception as e:
            raise ValidationError(f"Failed to create medical record: {str(e)}")
    
    async def get_medical_record_by_id(self, record_id: str) -> Optional[MedicalRecord]:
        """Get medical record by ID"""
        try:
            record_doc = await self.collection.find_one({"_id": ObjectId(record_id)})
            if not record_doc:
                return None
            
            return self._doc_to_medical_record(record_doc)
        except Exception:
            return None
    
    async def get_patient_records(
        self, 
        patient_id: str, 
        limit: int = 100, 
        skip: int = 0,
        status: Optional[ReportStatus] = None
    ) -> List[MedicalRecord]:
        """Get all medical records for a patient"""
        try:
            query = {"patient_id": patient_id}
            if status:
                query["status"] = status
            
            cursor = self.collection.find(query).sort("uploaded_at", -1).skip(skip).limit(limit)
            records = []
            async for record_doc in cursor:
                records.append(self._doc_to_medical_record(record_doc))
            return records
        except Exception:
            return []
    
    async def get_doctor_records(
        self, 
        doctor_id: str, 
        limit: int = 100, 
        skip: int = 0
    ) -> List[MedicalRecord]:
        """Get all medical records shared with a doctor"""
        try:
            cursor = self.collection.find({
                "doctor_id": doctor_id,
                "status": {"$in": ["Sent to Doctor", "Reviewed"]}
            }).sort("uploaded_at", -1).skip(skip).limit(limit)
            
            records = []
            async for record_doc in cursor:
                records.append(self._doc_to_medical_record(record_doc))
            return records
        except Exception:
            return []
    
    async def update_medical_record(
        self, 
        record_id: str, 
        update_data: MedicalRecordUpdate
    ) -> Optional[MedicalRecord]:
        """Update medical record"""
        try:
            update_dict = {}
            
            if update_data.name is not None:
                update_dict["name"] = update_data.name
            if update_data.status is not None:
                update_dict["status"] = update_data.status
            if update_data.additional_notes is not None:
                update_dict["additional_notes"] = update_data.additional_notes
            if update_data.analysis is not None:
                update_dict["analysis"] = update_data.analysis.dict()
            if update_data.doctor_feedback is not None:
                update_dict["doctor_feedback"] = update_data.doctor_feedback.dict()
            if update_data.doctor_id is not None:
                update_dict["doctor_id"] = update_data.doctor_id
            if update_data.doctor_name is not None:
                update_dict["doctor_name"] = update_data.doctor_name
            
            update_dict["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count == 0:
                return None
            
            return await self.get_medical_record_by_id(record_id)
        except Exception:
            return None
    
    async def send_to_doctor(self, record_id: str, doctor_id: str) -> bool:
        """Send medical record to doctor"""
        try:
            # Update record status
            result = await self.collection.update_one(
                {"_id": ObjectId(record_id)},
                {
                    "$set": {
                        "status": "Sent to Doctor",
                        "doctor_id": doctor_id,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def add_doctor_feedback(
        self, 
        record_id: str, 
        feedback: DoctorFeedback
    ) -> bool:
        """Add doctor feedback to medical record"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(record_id)},
                {
                    "$set": {
                        "doctor_feedback": feedback.dict(),
                        "status": "Reviewed",
                        "reviewed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def create_share_token(self, share_request: ShareRequest) -> ShareToken:
        """Create a share token for doctor access"""
        try:
            from app.core.security import generate_secure_token
            
            token = generate_secure_token()
            expires_at = share_request.expires_at or datetime.utcnow().replace(
                hour=23, minute=59, second=59, microsecond=999999
            )  # End of day by default
            
            share_token_doc = {
                "token": token,
                "report_id": share_request.report_id,
                "doctor_id": share_request.doctor_id,
                "access_type": share_request.access_type,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
                "is_used": False
            }
            
            await self.share_tokens_collection.insert_one(share_token_doc)
            
            return ShareToken(**share_token_doc)
        except Exception as e:
            raise ValidationError(f"Failed to create share token: {str(e)}")
    
    async def get_shared_record(self, token: str) -> Optional[MedicalRecord]:
        """Get medical record using share token"""
        try:
            # Find valid share token
            share_doc = await self.share_tokens_collection.find_one({
                "token": token,
                "expires_at": {"$gt": datetime.utcnow()},
                "is_used": False
            })
            
            if not share_doc:
                return None
            
            # Mark token as used
            await self.share_tokens_collection.update_one(
                {"_id": share_doc["_id"]},
                {"$set": {"is_used": True}}
            )
            
            # Get the medical record
            return await self.get_medical_record_by_id(share_doc["report_id"])
        except Exception:
            return None
    
    async def delete_medical_record(self, record_id: str, user_id: str) -> bool:
        """Delete medical record (only by patient or admin)"""
        try:
            # Check if user has permission
            record = await self.get_medical_record_by_id(record_id)
            if not record:
                return False
            
            if record.patient_id != user_id:
                raise AuthorizationError("Not authorized to delete this record")
            
            # Delete from cloud storage
            await self.cloud_storage.delete_file(record.file_url)
            
            # Delete from database
            result = await self.collection.delete_one({"_id": ObjectId(record_id)})
            return result.deleted_count > 0
        except Exception:
            return False
    
    async def _start_ai_analysis(self, record_id: str):
        """Start AI analysis for medical record"""
        try:
            # Update status to analyzing
            await self.collection.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": {"status": "Analyzing"}}
            )
            
            # Get record for analysis
            record = await self.get_medical_record_by_id(record_id)
            if not record:
                return
            
            # Perform AI analysis
            analysis = await self.ai_service.analyze_medical_report(record)
            
            if analysis:
                # Update record with analysis
                await self.collection.update_one(
                    {"_id": ObjectId(record_id)},
                    {
                        "$set": {
                            "analysis": analysis.dict(),
                            "status": "Analyzed",
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
        except Exception:
            # If AI analysis fails, mark as analyzed with basic info
            await self.collection.update_one(
                {"_id": ObjectId(record_id)},
                {
                    "$set": {
                        "status": "Analyzed",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    def _doc_to_medical_record(self, record_doc: dict) -> MedicalRecord:
        """Convert database document to MedicalRecord model"""
        return MedicalRecord(
            id=str(record_doc["_id"]),
            patient_id=record_doc["patient_id"],
            name=record_doc["name"],
            report_type=record_doc["report_type"],
            status=record_doc["status"],
            file_url=record_doc["file_url"],
            file_type=record_doc["file_type"],
            file_size=record_doc["file_size"],
            uploaded_at=record_doc["uploaded_at"],
            analysis=AIAnalysis(**record_doc["analysis"]) if record_doc.get("analysis") else None,
            doctor_feedback=DoctorFeedback(**record_doc["doctor_feedback"]) if record_doc.get("doctor_feedback") else None,
            doctor_id=record_doc.get("doctor_id"),
            doctor_name=record_doc.get("doctor_name"),
            reviewed_at=record_doc.get("reviewed_at")
        )
