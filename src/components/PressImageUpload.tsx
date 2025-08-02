"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faEye, faTimes, faImage, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadFileToS3, validateImageFile } from "@/lib/uploadUtils";

interface PressImageUploadProps {
  currentImageUrl: string;
  onImageChange: (imageUrl: string) => void;
  onRemoveImage: () => void;
  onFileSelect?: (file: File | null) => void;
  label?: string;
}

export default function PressImageUpload({
  currentImageUrl,
  onImageChange,
  onRemoveImage,
  onFileSelect,
  label = "Press Article Image"
}: PressImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(!currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      toast.error("Please drop an image file");
      return;
    }

    await handleFileUpload(imageFile);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFile = files[0];
    
    if (imageFile) {
      await handleFileUpload(imageFile);
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Store the file locally instead of uploading immediately
      setSelectedFile(file);
      onFileSelect?.(file); // Notify parent component about selected file
      setShowUploadArea(false); // Hide upload area after selecting file
      toast.success("Image selected successfully!");
    } catch (error) {
      console.error('File processing error:', error);
      toast.error("Failed to process image");
      setImagePreview("");
    } finally {
      setIsUploading(false);
    }
  };

  const openLightbox = (imageUrl: string) => {
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const handleEditImage = () => {
    setShowUploadArea(true);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");
    onFileSelect?.(null); // Notify parent component that file is removed
    onRemoveImage();
  };

  const displayImage = currentImageUrl || imagePreview;
  
  // Update upload area visibility when currentImageUrl changes
  useEffect(() => {
    setShowUploadArea(!currentImageUrl);
  }, [currentImageUrl]);


  


  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FontAwesomeIcon icon={faImage} className="w-4 h-4 text-gray-500" />
          <span>{label}</span>
        </h3>
      </div>

      {/* Drag & Drop Upload Area */}
      {showUploadArea && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FontAwesomeIcon 
            icon={faUpload} 
            className="w-8 h-8 text-gray-400 mb-4" 
          />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop an image here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports JPG, PNG, GIF, WebP (max 10MB)
          </p>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-gray-50"
              disabled={isUploading}
            >
              <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            {displayImage && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUploadArea(false)}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Current/Uploaded Image Preview */}
      {displayImage ? (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Article Image
          </Label>
          <div className="relative group bg-white rounded-lg">
            <img
              src={displayImage}
              alt="Article image"
              className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer bg-white"
              onClick={() => openLightbox(displayImage)}
              onError={(e) => {
                console.error('Image failed to load:', displayImage);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Show error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'w-full h-48 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm';
                errorDiv.innerHTML = 'Image not available';
                target.parentNode?.appendChild(errorDiv);
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
              <button
                type="button"
                onClick={() => openLightbox(displayImage)}
                className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                title="View image"
              >
                <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleEditImage}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shadow-lg"
                title="Edit image"
              >
                <FontAwesomeIcon icon={faPencilAlt} className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                title="Remove image"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        // Show upload area if no image is present
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            {label}
          </Label>
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faImage} className="w-12 h-12 mb-4 text-gray-300" />
            <p>No image uploaded yet</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadArea(true)}
              className="mt-2 bg-white hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 z-10"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
            <img
              src={displayImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-sm text-blue-600">
          <p>Uploading image...</p>
        </div>
      )}
    </div>
  );
} 