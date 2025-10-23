// Initialize Nirogya database
db = db.getSiblingDB('nirogya');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role', 'hashed_password'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        role: { enum: ['patient', 'doctor', 'admin'] },
        status: { enum: ['active', 'inactive', 'suspended', 'pending_verification'] },
        hashed_password: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('medical_records', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patient_id', 'name', 'report_type', 'file_url'],
      properties: {
        patient_id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        report_type: { enum: ['lab_report', 'prescription', 'imaging', 'consultation', 'vaccination', 'other'] },
        status: { enum: ['Uploaded', 'Analyzing', 'Analyzed', 'Sent to Doctor', 'Reviewed', 'Archived'] },
        file_url: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('appointments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patient_id', 'doctor_id', 'appointment_date'],
      properties: {
        patient_id: { bsonType: 'string' },
        doctor_id: { bsonType: 'string' },
        appointment_date: { bsonType: 'date' },
        status: { enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'] }
      }
    }
  }
});

db.createCollection('notifications');
db.createCollection('share_tokens');
db.createCollection('audit_logs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "status": 1 });

db.medical_records.createIndex({ "patient_id": 1 });
db.medical_records.createIndex({ "doctor_id": 1 });
db.medical_records.createIndex({ "created_at": -1 });
db.medical_records.createIndex({ "status": 1 });

db.appointments.createIndex({ "patient_id": 1 });
db.appointments.createIndex({ "doctor_id": 1 });
db.appointments.createIndex({ "appointment_date": 1 });
db.appointments.createIndex({ "status": 1 });

db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "created_at": -1 });
db.notifications.createIndex({ "is_read": 1 });

db.audit_logs.createIndex({ "user_id": 1 });
db.audit_logs.createIndex({ "action": 1 });
db.audit_logs.createIndex({ "created_at": -1 });

print('Nirogya database initialized successfully');
