"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faEye, faTimes, faImage } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CustomImageUploadProps {
  currentImages: string[];
  newImages: File[];
  onImageChange: (files: File[]) => void;
  onRemoveCurrentImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  label?: string;
  maxFiles?: number;
}

export default function CustomImageUpload({
  currentImages,
  newImages,
  onImageChange,
  onRemoveCurrentImage,
  onRemoveNewImage,
  label = "Project Images",
  maxFiles = 10
}: CustomImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync imagePreviews when newImages change (when images are removed)
  useEffect(() => {
    if (newImages.length < imagePreviews.length) {
      // Some images were removed, sync the previews
      setImagePreviews(prev => prev.slice(0, newImages.length));
    }
  }, [newImages.length, imagePreviews.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error("Please drop only image files");
      return;
    }

    if (newImages.length + imageFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    // Create previews for new images
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onImageChange([...newImages, ...imageFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (newImages.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    // Create previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onImageChange([...newImages, ...files]);
  };

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setLightboxImage("");
  };

  const totalImages = currentImages.length + newImages.length;

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FontAwesomeIcon icon={faImage} className="w-4 h-4 text-gray-500" />
          <span>{label}</span>
          <span className="text-sm text-gray-500 font-normal">
            ({totalImages}/{maxFiles})
          </span>
        </h3>
      </div>



      {/* Drag & Drop Upload Area */}
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
          Drop images here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports JPG, PNG, GIF, WebP (max 10MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="bg-white hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            Current Images ({currentImages.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentImages.map((image, index) => (
              <div key={`current-${index}`} className="relative group">
                <img
                  src={image}
                  alt={`Current image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
                  onClick={() => openLightbox(image)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                    <button
                      type="button"
                      onClick={() => openLightbox(image)}
                      className="bg-white text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      title="View image"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCurrentImage(index)}
                      className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      title="Remove image"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {imagePreviews.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            New Images ({imagePreviews.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={preview}
                  alt={`New image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
                  onClick={() => openLightbox(preview)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                    <button
                      type="button"
                      onClick={() => openLightbox(preview)}
                      className="bg-white text-gray-700 p-1 rounded-full hover:bg-gray-100"
                      title="View image"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveNewImage(index)}
                      className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      title="Remove image"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              src={lightboxImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Progress Info */}
      {totalImages > 0 && (
        <div className="text-sm text-gray-600">
          <p>Total images: {totalImages}/{maxFiles}</p>
          {totalImages >= maxFiles && (
            <p className="text-orange-600">Maximum number of images reached</p>
          )}
        </div>
      )}
    </div>
  );
}
