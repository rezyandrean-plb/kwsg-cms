# Image Functionality Documentation

## Overview
The project now includes comprehensive image upload and display functionality for projects with AWS S3 integration. This allows users to upload multiple images for each project, store them securely in the cloud, and view them in an organized gallery format.

## Features Added

### 1. AWS S3 Image Upload
- **Location**: `src/lib/s3Utils.ts`, `src/lib/uploadUtils.ts`, `src/app/api/upload/route.ts`
- **Features**:
  - Secure server-side upload to AWS S3
  - File validation (size, type)
  - Unique filename generation
  - Public read access for images
  - Error handling and retry logic
  - Support for multiple file uploads

### 2. Enhanced Image Upload in Project Form
- **Location**: `src/components/ProjectForm.tsx`
- **Features**:
  - Multiple image upload support
  - Image preview before upload
  - Remove individual images
  - Support for JPG, PNG, GIF, and WebP formats
  - File validation before upload
  - Progress indicators during upload
  - S3 URL storage in database

### 3. Current Images Display on Edit Page
- **Location**: `src/app/projects/[id]/edit/page.tsx`
- **Features**:
  - Displays existing project images in a gallery format
  - Click to view full-size images
  - Images are shown before the edit form

### 4. Image Gallery Component
- **Location**: `src/components/ProjectImageGallery.tsx`
- **Features**:
  - Responsive grid layout (2 columns on mobile, 4 on desktop)
  - Lightbox functionality with keyboard navigation
  - Image counter display
  - Hover effects and transitions
  - ESC key to close, arrow keys to navigate

### 5. Image Placeholder Component
- **Location**: `src/components/ImagePlaceholder.tsx`
- **Features**:
  - Consistent placeholder for missing images
  - Multiple size options (sm, md, lg)
  - FontAwesome icon integration

### 6. Projects List with Image Thumbnails
- **Location**: `src/app/projects/page.tsx`
- **Features**:
  - Image column in the projects table
  - Thumbnail display of first project image
  - Placeholder for projects without images

## AWS S3 Integration

### Setup Requirements
1. AWS Account with S3 access
2. S3 Bucket configured for public read access
3. IAM User with S3 permissions
4. Environment variables configured

### Environment Variables
Create a `.env.local` file with:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### Upload Process
1. **Validation**: Files are validated for size (max 10MB) and type
2. **Upload**: Images are uploaded to S3 via secure API route
3. **URL Generation**: Public S3 URLs are generated
4. **Database Storage**: S3 URLs are stored in the project record

## API Integration

### Backend Requirements
The backend API should support:
- **GET** `/api/projects/:id` - Should return project data including `images` array with S3 URLs
- **POST** `/api/projects` - Should accept JSON data with image URLs
- **PUT** `/api/projects/:id` - Should accept JSON data for updates

### Expected Data Structure
```typescript
interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string; // S3 URL
  alt_text?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  is_primary?: boolean;
  caption?: string;
}

interface Project {
  id: number;
  name: string;
  // ... other fields
  images?: ProjectImage[]; // Array of image objects with S3 URLs
}
```

## Usage

### Uploading Images
1. Navigate to a project's edit page or create a new project
2. Scroll to the "Project Images" section
3. Click "Choose Files" to select images
4. Preview uploaded images
5. Remove unwanted images using the trash icon
6. Save the project (images will be uploaded to S3 automatically)

### Viewing Images
1. **In Edit Mode**: Images are displayed in a gallery above the form
2. **In Projects List**: First image appears as a thumbnail in the table
3. **Full View**: Click any image to open it in a lightbox

### Keyboard Navigation (Lightbox)
- **ESC**: Close lightbox
- **Left Arrow**: Previous image
- **Right Arrow**: Next image

## Technical Implementation

### Utility Functions
- **Location**: `src/lib/imageUtils.ts`
- **Functions**:
  - `extractImageUrls(images)`: Extracts image URLs from image objects
  - `getPrimaryImage(images)`: Gets the primary image URL (or first image)
  - `getImageById(images, imageUrl)`: Finds image object by URL

### S3 Upload Functions
- **Location**: `src/lib/uploadUtils.ts`
- **Functions**:
  - `uploadFilesToS3(files, folder)`: Upload multiple files to S3
  - `uploadFileToS3(file, folder)`: Upload single file to S3
  - `validateImageFile(file)`: Validate file before upload
  - `validateImageFiles(files)`: Validate multiple files

### State Management
```typescript
// Image-related state in ProjectForm
const [currentImages, setCurrentImages] = useState<string[]>(initialData?.images || []);
const [newImages, setNewImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
const [uploading, setUploading] = useState(false);
```

### Upload Flow
```typescript
// 1. Validate files
const validation = validateImageFiles(newImages);

// 2. Upload to S3
const uploadResponse = await uploadFilesToS3(newImages, 'projects');

// 3. Extract S3 URLs
const uploadedImageUrls = uploadResponse.results
  .filter(result => result.success && result.url)
  .map(result => result.url!);

// 4. Save to database
const projectData = {
  ...form,
  images: [...currentImages, ...uploadedImageUrls]
};
```

## Security Features

### File Validation
- **Size Limit**: Maximum 10MB per file
- **Type Restriction**: Only JPG, PNG, GIF, WebP allowed
- **Server-side Validation**: All uploads validated on server

### S3 Security
- **Public Read Access**: Images are publicly readable via bucket policy
- **Private Upload**: Uploads go through secure API route
- **Unique Filenames**: Prevents filename conflicts
- **Bucket Policy Control**: Public access controlled by bucket policy (ACLs disabled)

## Styling
- Uses Tailwind CSS for responsive design
- Consistent with existing UI components
- Hover effects and transitions for better UX
- Mobile-friendly grid layouts
- Progress indicators during upload

## Browser Support
- Modern browsers with FileReader API support
- Responsive design works on mobile and desktop
- Keyboard navigation for accessibility

## Error Handling
- File validation errors with user feedback
- Upload failure handling with retry options
- Network error recovery
- Graceful degradation for unsupported browsers

## Performance Optimizations
- Client-side file validation before upload
- Parallel upload processing
- Image preview generation
- Lazy loading for image galleries

## Future Enhancements
- Image compression before upload
- Drag and drop file upload
- Image cropping functionality
- Bulk image operations
- Image alt text support
- Image sorting/reordering
- CDN integration for better performance
- Image optimization and resizing
- Backup and versioning 