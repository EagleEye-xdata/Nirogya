from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from app.models.notification import (
    Notification, NotificationCreate, NotificationUpdate,
    NotificationPreferences, NotificationStatus, NotificationType
)
from app.models.user import User
from app.core.dependencies import get_current_active_user, get_notification_service
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=List[Notification])
async def get_my_notifications(
    status: Optional[NotificationStatus] = None,
    notification_type: Optional[NotificationType] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Get current user's notifications"""
    try:
        notifications = await notification_service.get_user_notifications(
            current_user.id, limit, skip, status, notification_type
        )
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.get("/unread", response_model=List[Notification])
async def get_unread_notifications(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Get unread notifications"""
    try:
        notifications = await notification_service.get_unread_notifications(
            current_user.id, limit
        )
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unread notifications: {str(e)}"
        )


@router.get("/count")
async def get_notification_count(
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Get notification counts"""
    try:
        counts = await notification_service.get_notification_count(current_user.id)
        return counts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification counts: {str(e)}"
        )


@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Get a specific notification"""
    try:
        notification = await notification_service.get_notification_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        # Check if notification belongs to user
        if notification.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return notification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification: {str(e)}"
        )


@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Mark notification as read"""
    try:
        success = await notification_service.mark_as_read(notification_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to mark notification as read"
            )
        
        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )


@router.put("/read-all")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Mark all notifications as read"""
    try:
        success = await notification_service.mark_all_as_read(current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to mark all notifications as read"
            )
        
        return {"message": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Delete a notification"""
    try:
        success = await notification_service.delete_notification(notification_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete notification"
            )
        
        return {"message": "Notification deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )


@router.get("/preferences/me", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Get notification preferences"""
    try:
        preferences = await notification_service.get_notification_preferences(current_user.id)
        return preferences
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notification preferences: {str(e)}"
        )


@router.put("/preferences/me", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_active_user),
    notification_service: NotificationService = Depends(get_notification_service)
):
    """Update notification preferences"""
    try:
        # Ensure user_id matches current user
        preferences.user_id = current_user.id
        
        success = await notification_service.update_notification_preferences(
            current_user.id, preferences
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update notification preferences"
            )
        
        return preferences
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification preferences: {str(e)}"
        )
