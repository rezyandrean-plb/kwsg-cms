"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomImageUpload from "@/components/CustomImageUpload";

interface PropTech {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category: string;
  url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function NewPropTechPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    category: "",
    active: true,
  });

  // Image state for CustomImageUpload
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle image file selection
  const handleImageChange = (files: File[]) => {
    setNewImages(prev => [...prev, ...files]);
  };

  // Remove current image
  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert new images to URLs (in real app, these would be uploaded to server)
      const newImageUrls = newImages.map(file => URL.createObjectURL(file));
      const allImageUrls = [...currentImages, ...newImageUrls];

      // In a real app, this would be sent to the API
      const newPropTech: PropTech = {
        id: Date.now(), // Generate a unique ID
        name: formData.name,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        active: formData.active,
        icon: allImageUrls[0] || undefined, // Use first image as icon
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in localStorage for demo purposes (in real app, this would be handled by API)
      const existingPropTech = JSON.parse(localStorage.getItem('mockPropTech') || '[]');
      existingPropTech.push(newPropTech);
      localStorage.setItem('mockPropTech', JSON.stringify(existingPropTech));

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
              <option value="Internal Tool">Internal Tool</option>
              <option value="Command Tools">Command Tools</option>
              <option value="External Tools">External Tools</option>
              <option value="Compass Tools">Compass Tools</option>
              <option value="Research Tools">Research Tools</option>
              <option value="Training Resource">Training Resource</option>
              <option value="Other">Other</option>
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

          {/* Custom Image Upload */}
          <div className="md:col-span-2">
            <CustomImageUpload
              currentImages={currentImages}
              newImages={newImages}
              onImageChange={handleImageChange}
              onRemoveCurrentImage={removeCurrentImage}
              onRemoveNewImage={removeNewImage}
              label="Icon/Logo Image"
              maxFiles={1}
            />
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
