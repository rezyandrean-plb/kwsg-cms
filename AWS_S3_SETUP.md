# AWS S3 Setup Guide

This guide will help you configure AWS S3 for image uploads in the KWSG Projects CMS.

## Prerequisites

1. AWS Account
2. S3 Bucket created
3. IAM User with S3 permissions

## Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select your preferred region
5. Configure bucket settings:
   - **Block Public Access**: Uncheck "Block all public access" (since we need public read access for images)
   - **Bucket Versioning**: Optional
   - **Default Encryption**: Enable server-side encryption
6. Click "Create bucket"

## Step 2: Configure Bucket Policy

Add the following bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name.

## Step 3: Create IAM User

1. Go to AWS IAM Console
2. Click "Users" → "Create user"
3. Enter a username (e.g., `kwsg-s3-upload`)
4. Select "Programmatic access"
5. Click "Next: Permissions"

### Attach S3 Policy

Create a custom policy with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        }
    ]
}
```

6. Complete the user creation
7. **Important**: Save the Access Key ID and Secret Access Key

## Step 4: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Optional: Public environment variables (if needed for client-side)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

Replace the values with your actual AWS configuration:
- `AWS_REGION`: Your S3 bucket region (e.g., us-east-1, eu-west-1)
- `AWS_ACCESS_KEY_ID`: The access key from your IAM user
- `AWS_SECRET_ACCESS_KEY`: The secret key from your IAM user
- `AWS_S3_BUCKET_NAME`: Your S3 bucket name

## Step 5: Test Configuration

1. Start your development server: `bun dev`
2. Navigate to a project edit page
3. Try uploading an image
4. Check the browser console and server logs for any errors

## Security Notes

- Never commit your `.env.local` file to version control
- Use IAM roles instead of access keys in production
- Consider using AWS CloudFront for better performance
- Regularly rotate your access keys

## Troubleshooting

### Common Issues

1. **"S3 bucket not configured" error**
   - Check that `AWS_S3_BUCKET_NAME` is set correctly
   - Ensure the bucket exists in the specified region

2. **"Access denied" error**
   - Verify your IAM user has the correct permissions
   - Check that the bucket policy allows public read access
   - Ensure the access keys are correct

3. **"Region mismatch" error**
   - Make sure `AWS_REGION` matches your bucket's region

4. **Images not displaying**
   - Check that the bucket policy allows public read access
   - Verify the S3 URLs are correct in the database

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
DEBUG=true
```

This will log S3 operations to the console for troubleshooting.

## Production Considerations

1. **Use IAM Roles**: Instead of access keys, use IAM roles for EC2 instances or ECS tasks
2. **CloudFront**: Set up CloudFront distribution for better performance and caching
3. **CORS**: Configure CORS on your S3 bucket if uploading directly from browser
4. **Monitoring**: Set up CloudWatch alarms for S3 operations
5. **Backup**: Consider cross-region replication for important images 