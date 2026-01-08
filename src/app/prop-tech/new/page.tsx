"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faEye, faTimes } from "@fortawesome/free-solid-svg-icons";
import { uploadFileToS3, validateImageFile } from "@/lib/uploadUtils";

export default function NewPropTechPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: "",
    active: true,
    icon: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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

  const handleFileUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadFileToS3(file, 'images/tech-tools');
      
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, icon: result.url! }));
        setShowUploadArea(false);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, icon: "" }));
    setShowUploadArea(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.category.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        url: formData.url || undefined,
        category: formData.category,
        active: formData.active,
        icon: formData.icon || undefined,
      };

      const response = await fetch('/api/tool-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create tool resource');
      }

      toast.success('Prop Tech item created successfully');
      router.push('/prop-tech');
    } catch (error) {
      console.error('Error creating Prop Tech item:', error);
      toast.error('Failed to create Prop Tech item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/prop-tech');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Prop Tech</h1>
        <p className="text-gray-600">Create a new Prop Tech item for the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Prop Tech name"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter Prop Tech description"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="Business Tool">Business Tool</option>
              <option value="Learnings">Learnings</option>
              <option value="External Tools">External Tools</option>
              <option value="Compass Tools">Compass Tools</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Active (Display this item)
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon/Logo Image</label>
            
            {formData.icon ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={formData.icon}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer bg-gray-100"
                    onClick={() => setShowLightbox(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                      title="View image"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
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
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadArea(!showUploadArea)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                    disabled={isUploading}
                  >
                    {showUploadArea ? "Cancel" : "Change image"}
                  </button>
                </div>
              </div>
            ) : null}

            {(!formData.icon || showUploadArea) && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="text-gray-600">Uploading...</div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop an image here, or click to select
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Browse files
                    </button>
                  </>
                )}
              </div>
            )}

            {showLightbox && formData.icon && (
              <div
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                onClick={() => setShowLightbox(false)}
              >
                <div className="relative max-w-4xl max-h-full p-4">
                  <button
                    onClick={() => setShowLightbox(false)}
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                  </button>
                  <img
                    src={formData.icon}
                    alt="Preview"
                    className="max-w-full max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Prop Tech'}
          </button>
        </div>
      </form>
    </div>
  );
}
