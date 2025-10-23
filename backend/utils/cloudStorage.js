const cloudinary = require('cloudinary').v2;
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Configure AWS S3
if (process.env.AWS_ACCESS_KEY_ID) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

const s3 = new AWS.S3();

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<string>} Public URL
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'nirogya/medical-records',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });

    console.log('File uploaded to Cloudinary:', result.public_id);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Upload file to AWS S3
 * @param {string} filePath - Local file path
 * @param {string} key - S3 object key
 * @param {object} options - Upload options
 * @returns {Promise<string>} Public URL
 */
const uploadToS3 = async (filePath, key, options = {}) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileExtension = path.extname(filePath);
    const mimeType = getMimeType(fileExtension);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: mimeType,
      ACL: 'private', // Make files private by default
      ...options,
    };

    const result = await s3.upload(params).promise();
    console.log('File uploaded to S3:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>} Success status
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('File deleted from Cloudinary:', publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Delete file from AWS S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>} Success status
 */
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log('File deleted from S3:', key);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
};

/**
 * Generate signed URL for private S3 objects
 * @param {string} key - S3 object key
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<string>} Signed URL
 */
const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('S3 signed URL generation error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} MIME type
 */
const getMimeType = (extension) => {
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.tiff': 'image/tiff',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Human readable size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type
 * @param {string} filename - File name
 * @param {Array} allowedTypes - Allowed file extensions
 * @returns {boolean} Is valid file type
 */
const validateFileType = (filename, allowedTypes = []) => {
  if (allowedTypes.length === 0) {
    const defaultTypes = ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'doc', 'docx'];
    allowedTypes = defaultTypes;
  }

  const extension = path.extname(filename).toLowerCase().substring(1);
  return allowedTypes.includes(extension);
};

/**
 * Get file info
 * @param {string} filePath - File path
 * @returns {object} File information
 */
const getFileInfo = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    const extension = path.extname(filePath);
    const basename = path.basename(filePath, extension);

    return {
      name: basename,
      extension: extension.substring(1),
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      mimeType: getMimeType(extension),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    console.error('Get file info error:', error);
    return null;
  }
};

/**
 * Clean up temporary files
 * @param {string} filePath - File path to clean up
 */
const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Temporary file cleaned up:', filePath);
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Directory created:', dirPath);
    }
  } catch (error) {
    console.error('Directory creation error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadToS3,
  deleteFromCloudinary,
  deleteFromS3,
  generateSignedUrl,
  getMimeType,
  formatFileSize,
  validateFileType,
  getFileInfo,
  cleanupFile,
  ensureDirectoryExists,
};
