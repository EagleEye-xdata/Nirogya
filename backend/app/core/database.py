from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.database = db.client[settings.MONGODB_URL.split("/")[-1]]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("role")
        
        # Medical records collection indexes
        await db.database.medical_records.create_index("patient_id")
        await db.database.medical_records.create_index("doctor_id")
        await db.database.medical_records.create_index("created_at")
        await db.database.medical_records.create_index("status")
        
        # Appointments collection indexes
        await db.database.appointments.create_index("patient_id")
        await db.database.appointments.create_index("doctor_id")
        await db.database.appointments.create_index("appointment_date")
        await db.database.appointments.create_index("status")
        
        # Notifications collection indexes
        await db.database.notifications.create_index("user_id")
        await db.database.notifications.create_index("created_at")
        await db.database.notifications.create_index("is_read")
        
        # Audit logs collection indexes
        await db.database.audit_logs.create_index("user_id")
        await db.database.audit_logs.create_index("action")
        await db.database.audit_logs.create_index("created_at")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.database
