import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Client configuration (server-side)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'projects';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!BUCKET_NAME) {
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      );
    }

    const uploadResults = [];

    for (const file of files) {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (file.size > maxSize) {
        uploadResults.push({
          success: false,
          fileName: file.name,
          error: 'File size must be less than 10MB',
        });
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        uploadResults.push({
          success: false,
          fileName: file.name,
          error: 'Only JPG, PNG, GIF, and WebP files are allowed',
        });
        continue;
      }

      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
          // Removed ACL since bucket has Object Ownership set to "Bucket owner enforced"
        });

        await s3Client.send(uploadCommand);

        // Generate public URL
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

        uploadResults.push({
          success: true,
          fileName: file.name,
          url: publicUrl,
          key: fileName,
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        uploadResults.push({
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: uploadResults,
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 