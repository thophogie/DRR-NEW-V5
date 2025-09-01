import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const s3Config = {
  endpoint: import.meta.env.VITE_S3_ENDPOINT,
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: import.meta.env.VITE_S3_FORCE_PATH_STYLE === 'true',
};

const bucketName = import.meta.env.VITE_S3_BUCKET || '';

// Validate S3 configuration
const validateS3Config = () => {
  const requiredVars = [
    'VITE_S3_ENDPOINT',
    'VITE_S3_BUCKET',
    'VITE_S3_ACCESS_KEY_ID',
    'VITE_S3_SECRET_ACCESS_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing S3 environment variables:', missing);
    return false;
  }
  
  return true;
};

// Create S3 client
export const createS3Client = () => {
  if (!validateS3Config()) {
    throw new Error('S3 configuration is incomplete. Please check your environment variables.');
  }
  
  return new S3Client(s3Config);
};

// S3 Service Class
export class S3Service {
  private client: S3Client;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = validateS3Config();
    if (this.isConfigured) {
      this.client = createS3Client();
    }
  }

  // Check if S3 is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }

  // Test S3 connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'S3 not configured' };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 1
      });
      
      await this.client.send(command);
      return { success: true };
    } catch (error) {
      console.error('S3 connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Upload file to S3
  async uploadFile(
    file: File, 
    key: string, 
    options: {
      contentType?: string;
      metadata?: Record<string, string>;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'S3 not configured' };
    }

    try {
      const { contentType = file.type, metadata = {} } = options;
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      await this.client.send(command);
      
      // Generate public URL
      const url = `${s3Config.endpoint}/${bucketName}/${key}`;
      
      return { success: true, url };
    } catch (error) {
      console.error('S3 upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'S3 not configured' };
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      await this.client.send(command);
      return { success: true };
    } catch (error) {
      console.error('S3 delete failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  // Get signed URL for private files
  async getSignedUrl(
    key: string, 
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'S3 not configured' };
    }

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return { success: true, url };
    } catch (error) {
      console.error('S3 signed URL generation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'URL generation failed' 
      };
    }
  }

  // List files in bucket
  async listFiles(
    prefix?: string,
    maxKeys: number = 100
  ): Promise<{ success: boolean; files?: any[]; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'S3 not configured' };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await this.client.send(command);
      const files = response.Contents?.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        etag: obj.ETag
      })) || [];

      return { success: true, files };
    } catch (error) {
      console.error('S3 list files failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'List files failed' 
      };
    }
  }

  // Generate file key with proper structure
  generateFileKey(
    category: 'gallery' | 'resources' | 'incidents' | 'avatars' | 'temp',
    filename: string,
    userId?: string
  ): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = filename.split('.').pop();
    const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    
    const keyParts = [category];
    
    if (userId) {
      keyParts.push(userId);
    }
    
    keyParts.push(`${timestamp}_${randomId}_${baseName}.${extension}`);
    
    return keyParts.join('/');
  }

  // Get file URL (public or signed)
  getFileUrl(key: string, isPrivate: boolean = false): string {
    if (isPrivate) {
      // For private files, you would need to generate signed URLs
      // This is a placeholder - implement signed URL logic as needed
      return `${s3Config.endpoint}/${bucketName}/${key}`;
    }
    
    return `${s3Config.endpoint}/${bucketName}/${key}`;
  }
}

// Create singleton instance
export const s3Service = new S3Service();

// Helper functions
export const uploadToS3 = async (
  file: File,
  category: 'gallery' | 'resources' | 'incidents' | 'avatars' | 'temp',
  userId?: string,
  onProgress?: (progress: number) => void
) => {
  const key = s3Service.generateFileKey(category, file.name, userId);
  return await s3Service.uploadFile(file, key, { onProgress });
};

export const deleteFromS3 = async (key: string) => {
  return await s3Service.deleteFile(key);
};

export const getS3FileUrl = (key: string, isPrivate: boolean = false) => {
  return s3Service.getFileUrl(key, isPrivate);
};

// Connection status
export const getS3Connecti