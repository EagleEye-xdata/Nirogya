from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.models.user import User, UserUpdate, UserRole
from app.core.dependencies import (
    get_current_active_user, 
    require_admin_role,
    get_user_service
)
from app.services.user_service import UserService

router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=User)
async def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """Update current user information"""
    try:
        updated_user = await user_service.update_user(current_user.id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user"
            )
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.get("/", response_model=List[User])
async def get_users(
    role: Optional[UserRole] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(require_admin_role),
    user_service: UserService = Depends(get_user_service)
):
    """Get all users (admin only)"""
    try:
        if role:
            users = await user_service.get_users_by_role(role, limit, skip)
        else:
            # Get all users (implement this method in UserService)
            users = []
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    user_service: UserService = Depends(get_user_service)
):
    """Get user by ID"""
    try:
        # Check if user can access this information
        if current_user.role != "admin" and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        user = await user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )


@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: User = Depends(require_admin_role),
    user_service: UserService = Depends(get_user_service)
):
    """Update user (admin only)"""
    try:
        updated_user = await user_service.update_user(user_id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
