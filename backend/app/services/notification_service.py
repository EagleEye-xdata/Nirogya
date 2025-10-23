from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.notification import (
    Notification, NotificationCreate, NotificationUpdate,
    NotificationInDB, NotificationType, NotificationPriority,
    NotificationStatus, NotificationPreferences
)
from app.core.exceptions import NotFoundError, ValidationError


class NotificationService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database
        self.collection = database.notifications
        self.preferences_collection = database.notification_preferences
    
    async def create_notification(self, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        try:
            # Check user preferences
            preferences = await self.get_notification_preferences(notification_data.user_id)
            if not self._should_send_notification(notification_data, preferences):
                return None
            
            # Create notification document
            notification_doc = {
                "user_id": notification_data.user_id,
                "title": notification_data.title,
                "message": notification_data.message,
                "notification_type": notification_data.notification_type,
                "priority": notification_data.priority,
                "status": notification_data.status,
                "data": notification_data.data,
                "action_url": notification_data.action_url,
                "expires_at": notification_data.expires_at,
                "created_at": datetime.utcnow(),
                "read_at": None
            }
            
            # Insert notification
            result = await self.collection.insert_one(notification_doc)
            notification_id = str(result.inserted_id)
            
            return await self.get_notification_by_id(notification_id)
            
        except Exception as e:
            raise ValidationError(f"Failed to create notification: {str(e)}")
    
    async def get_notification_by_id(self, notification_id: str) -> Optional[Notification]:
        """Get notification by ID"""
        try:
            notification_doc = await self.collection.find_one({"_id": ObjectId(notification_id)})
            if not notification_doc:
                return None
            
            return self._doc_to_notification(notification_doc)
        except Exception:
            return None
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        limit: int = 100, 
        skip: int = 0,
        status: Optional[NotificationStatus] = None,
        notification_type: Optional[NotificationType] = None
    ) -> List[Notification]:
        """Get all notifications for a user"""
        try:
            query = {"user_id": user_id}
            if status:
                query["status"] = status
            if notification_type:
                query["notification_type"] = notification_type
            
            cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
            notifications = []
            async for notification_doc in cursor:
                notifications.append(self._doc_to_notification(notification_doc))
            return notifications
        except Exception:
            return []
    
    async def get_unread_notifications(
        self, 
        user_id: str, 
        limit: int = 50
    ) -> List[Notification]:
        """Get unread notifications for a user"""
        try:
            cursor = self.collection.find({
                "user_id": user_id,
                "status": "unread",
                "$or": [
                    {"expires_at": {"$exists": False}},
                    {"expires_at": {"$gt": datetime.utcnow()}}
                ]
            }).sort("created_at", -1).limit(limit)
            
            notifications = []
            async for notification_doc in cursor:
                notifications.append(self._doc_to_notification(notification_doc))
            return notifications
        except Exception:
            return []
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            result = await self.collection.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "user_id": user_id
                },
                {
                    "$set": {
                        "status": "read",
                        "read_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user"""
        try:
            result = await self.collection.update_many(
                {
                    "user_id": user_id,
                    "status": "unread"
                },
                {
                    "$set": {
                        "status": "read",
                        "read_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(notification_id),
                "user_id": user_id
            })
            
            return result.deleted_count > 0
        except Exception:
            return False
    
    async def get_notification_count(self, user_id: str) -> dict:
        """Get notification counts for a user"""
        try:
            total_count = await self.collection.count_documents({"user_id": user_id})
            unread_count = await self.collection.count_documents({
                "user_id": user_id,
                "status": "unread"
            })
            
            return {
                "total": total_count,
                "unread": unread_count
            }
        except Exception:
            return {"total": 0, "unread": 0}
    
    async def create_appointment_notification(
        self, 
        user_id: str, 
        appointment_data: dict
    ) -> Optional[Notification]:
        """Create appointment-related notification"""
        try:
            notification_data = NotificationCreate(
                user_id=user_id,
                title="Appointment Scheduled",
                message=f"Your appointment with {appointment_data.get('doctor_name')} is scheduled for {appointment_data.get('date')}",
                notification_type=NotificationType.APPOINTMENT,
                priority=NotificationPriority.MEDIUM,
                data=appointment_data,
                action_url=f"/appointments/{appointment_data.get('appointment_id')}"
            )
            
            return await self.create_notification(notification_data)
        except Exception:
            return None
    
    async def create_report_notification(
        self, 
        user_id: str, 
        report_data: dict
    ) -> Optional[Notification]:
        """Create report-related notification"""
        try:
            notification_data = NotificationCreate(
                user_id=user_id,
                title="New Medical Report",
                message=f"Your {report_data.get('report_type')} report is ready for review",
                notification_type=NotificationType.REPORT,
                priority=NotificationPriority.MEDIUM,
                data=report_data,
                action_url=f"/medical-records/{report_data.get('report_id')}"
            )
            
            return await self.create_notification(notification_data)
        except Exception:
            return None
    
    async def create_ai_analysis_notification(
        self, 
        user_id: str, 
        analysis_data: dict
    ) -> Optional[Notification]:
        """Create AI analysis notification"""
        try:
            notification_data = NotificationCreate(
                user_id=user_id,
                title="AI Analysis Complete",
                message=f"AI analysis of your {analysis_data.get('report_name')} is complete",
                notification_type=NotificationType.AI_ANALYSIS,
                priority=NotificationPriority.HIGH,
                data=analysis_data,
                action_url=f"/medical-records/{analysis_data.get('report_id')}"
            )
            
            return await self.create_notification(notification_data)
        except Exception:
            return None
    
    async def get_notification_preferences(self, user_id: str) -> Optional[NotificationPreferences]:
        """Get notification preferences for a user"""
        try:
            prefs_doc = await self.preferences_collection.find_one({"user_id": user_id})
            if not prefs_doc:
                # Return default preferences
                return NotificationPreferences(user_id=user_id)
            
            return NotificationPreferences(**prefs_doc)
        except Exception:
            return NotificationPreferences(user_id=user_id)
    
    async def update_notification_preferences(
        self, 
        user_id: str, 
        preferences: NotificationPreferences
    ) -> bool:
        """Update notification preferences"""
        try:
            result = await self.preferences_collection.update_one(
                {"user_id": user_id},
                {"$set": preferences.dict()},
                upsert=True
            )
            
            return result.modified_count > 0 or result.upserted_id is not None
        except Exception:
            return False
    
    def _should_send_notification(
        self, 
        notification_data: NotificationCreate, 
        preferences: Optional[NotificationPreferences]
    ) -> bool:
        """Check if notification should be sent based on user preferences"""
        if not preferences:
            return True
        
        # Check email notifications
        if notification_data.notification_type == NotificationType.APPOINTMENT:
            return preferences.appointment_reminders
        elif notification_data.notification_type == NotificationType.REPORT:
            return preferences.report_updates
        elif notification_data.notification_type == NotificationType.AI_ANALYSIS:
            return preferences.ai_analysis_complete
        elif notification_data.notification_type == NotificationType.PRESCRIPTION:
            return preferences.prescription_reminders
        
        return True
    
    def _doc_to_notification(self, notification_doc: dict) -> Notification:
        """Convert database document to Notification model"""
        return Notification(
            id=str(notification_doc["_id"]),
            user_id=notification_doc["user_id"],
            title=notification_doc["title"],
            message=notification_doc["message"],
            notification_type=notification_doc["notification_type"],
            priority=notification_doc["priority"],
            status=notification_doc["status"],
            data=notification_doc.get("data"),
            action_url=notification_doc.get("action_url"),
            expires_at=notification_doc.get("expires_at"),
            created_at=notification_doc["created_at"],
            read_at=notification_doc.get("read_at")
        )
