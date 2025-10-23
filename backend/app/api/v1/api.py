from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, medical_records, appointments, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(medical_records.router, prefix="/medical-records", tags=["medical-records"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
