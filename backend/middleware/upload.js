const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'doc', 'docx'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: `File size must be less than ${parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024} bytes`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: 'Unexpected file field',
            message: `Expected field name: ${fieldName}`,
          });
        }
        return res.status(400).json({
          error: 'File upload error',
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message,
        });
      }
      next();
    });
  };
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: `File size must be less than ${parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024} bytes`,
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            error: 'Too many files',
            message: `Maximum ${maxCount} files allowed`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: 'Unexpected file field',
            message: `Expected field name: ${fieldName}`,
          });
        }
        return res.status(400).json({
          error: 'File upload error',
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: 'File upload error',
          message: err.message,
        });
      }
      next();
    });
  };
};

// Clean up uploaded files
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
};

// Clean up multiple files
const cleanupFiles = (files) => {
  if (Array.isArray(files)) {
    files.forEach(file => cleanupFile(file.path));
  } else if (files && files.path) {
    cleanupFile(files.path);
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  cleanupFile,
  cleanupFiles,
};
