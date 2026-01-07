const AWS = require('aws-sdk');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');
const config = require('../config/env');

class S3Service {
  constructor() {
    AWS.config.update({
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      region: config.AWS_REGION
    });

    this.s3 = new AWS.S3();
    this.bucketName = config.AWS_BUCKET_NAME;
  }

  // Upload file to S3
  async uploadFile(filePath, key, contentType = 'application/octet-stream') {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileStats = await fs.stat(filePath);

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ContentLength: fileStats.size,
        Metadata: {
          uploadedAt: new Date().toISOString(),
          checksum: this.calculateChecksum(fileContent)
        }
      };

      const result = await this.s3.upload(params).promise();
      
      logger.info(`File uploaded to S3: ${key} (${fileStats.size} bytes)`);
      return result.Location;

    } catch (error) {
      logger.error('Failed to upload file to S3:', error);
      throw error;
    }
  }

  // Upload payment proof
  async uploadPaymentProof(file, orderId) {
    const fileExtension = path.extname(file.originalname);
    const key = `payments/${orderId}/${Date.now()}${fileExtension}`;
    
    // Save file temporarily
    const tempPath = path.join('/tmp', file.originalname);
    await fs.writeFile(tempPath, file.buffer);
    
    // Upload to S3
    const contentType = this.getContentType(fileExtension);
    const url = await this.uploadFile(tempPath, key, contentType);
    
    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {});
    
    return url;
  }

  // Generate signed URL for download
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
        ResponseContentDisposition: `attachment; filename="${path.basename(key)}"`
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;

    } catch (error) {
      logger.error('Failed to generate signed URL:', error);
      throw error;
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      logger.info(`File deleted from S3: ${key}`);

    } catch (error) {
      logger.error('Failed to delete file from S3:', error);
      throw error;
    }
  }

  // Calculate file checksum
  calculateChecksum(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  // Get content type from file extension
  getContentType(extension) {
    const types = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.json': 'application/json'
    };

    return types[extension.toLowerCase()] || 'application/octet-stream';
  }

  // List files in directory
  async listFiles(prefix) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents || [];

    } catch (error) {
      logger.error('Failed to list files from S3:', error);
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await this.s3.headObject(params).promise();
      return result.Metadata;

    } catch (error) {
      logger.error('Failed to get file metadata:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();
