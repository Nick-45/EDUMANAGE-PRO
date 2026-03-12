const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

createUploadsDir();

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let folder = 'temp';
    
    // Determine folder based on file fieldname
    if (file.fieldname === 'schoolLogo') {
      folder = 'temp/logos';
    } else if (file.fieldname === 'paymentProof') {
      folder = 'temp/payments';
    } else if (file.fieldname === 'appIcon') {
      folder = 'temp/app-icons';
    } else if (file.fieldname === 'document') {
      folder = 'temp/documents';
    } else if (file.fieldname === 'bulkImport') {
      folder = 'temp/imports';
    }
    
    const uploadPath = path.join(__dirname, `../../uploads/${folder}`);
    
    // Create folder if it doesn't exist
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/\.[^/.]+$/, '');
    
    cb(null, `${file.fieldname}-${cleanName}-${uniqueSuffix}${extension}`);
  }
});

// File filter with expanded allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'schoolLogo': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    'appIcon': ['image/png', 'image/jpeg', 'image/webp'],
    'paymentProof': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    'bulkImport': ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'general': ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv']
  };

  const allowedMimeTypes = allowedTypes[file.fieldname] || allowedTypes['general'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Configure multer with increased limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 5 // Allow up to 5 files per upload
  }
});

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'uploads',
      public_id: options.publicId,
      resource_type: options.resourceType || 'auto',
      transformation: options.transformation || []
    });
    
    // Delete local file after upload
    await fs.unlink(filePath).catch(err => 
      console.error('Error deleting local file:', err)
    );
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files, options = {}) => {
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.path, options)
  );
  
  return Promise.all(uploadPromises);
};

// Clean up old temp files (run this periodically)
const cleanupTempFiles = async () => {
  const tempDir = path.join(__dirname, '../../uploads/temp');
  
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 24 hours
      if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
        await fs.unlink(filePath);
        console.log(`Deleted old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Middleware to handle upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 20MB'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: `Too many files. Maximum is ${err.field} files`
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected field: ${err.field}`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload failed'
    });
  }
  
  next();
};

// Get file info
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      name: path.basename(filePath),
      extension: path.extname(filePath)
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

// Validate file before upload
const validateFile = (file, options = {}) => {
  const errors = [];
  
  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File too large. Max size: ${options.maxSize / 1024 / 1024}MB`);
  }
  
  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed: ${options.allowedTypes.join(', ')}`);
  }
  
  // Check filename length
  if (file.originalname.length > 255) {
    errors.push('Filename too long');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = { 
  upload, 
  handleUploadErrors,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  getFileInfo,
  validateFile
};
