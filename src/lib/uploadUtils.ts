export interface UploadResult {
  success: boolean;
  fileName?: string;
  url?: string;
  key?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  results: UploadResult[];
}

/**
 * Upload files to S3 via API route
 */
export async function uploadFilesToS3(
  files: File[],
  folder: string = 'projects'
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    
    // Add files to form data
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add folder parameter
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading files:', error);
    return {
      success: false,
      results: files.map(file => ({
        success: false,
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Upload failed',
      })),
    };
  }
}

/**
 * Upload a single file to S3
 */
export async function uploadFileToS3(
  file: File,
  folder: string = 'projects'
): Promise<UploadResult> {
  const response = await uploadFilesToS3([file], folder);
  return response.results[0] || {
    success: false,
    fileName: file.name,
    error: 'Upload failed',
  };
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

/**
 * Validate multiple files
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  files.forEach(file => {
    const validation = validateImageFile(file);
    if (!validation.valid && validation.error) {
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
} 