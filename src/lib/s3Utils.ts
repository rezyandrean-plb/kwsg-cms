import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || '';

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface S3DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFileToS3(
  file: File,
  folder: string = 'projects'
): Promise<S3UploadResult> {
  try {
    if (!BUCKET_NAME) {
      throw new Error('S3 bucket name not configured');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read', // Make the file publicly accessible
    });

    await s3Client.send(uploadCommand);

    // Return the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      key: fileName,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleFilesToS3(
  files: File[],
  folder: string = 'projects'
): Promise<S3UploadResult[]> {
  const uploadPromises = files.map(file => uploadFileToS3(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<S3DeleteResult> {
  try {
    if (!BUCKET_NAME) {
      throw new Error('S3 bucket name not configured');
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extract S3 key from URL
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove the first empty element and get the rest
    return pathParts.slice(1).join('/');
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPG, PNG, GIF, and WebP files are allowed',
    };
  }

  return { valid: true };
} 