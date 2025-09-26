"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomImageUpload from "@/components/CustomImageUpload";

interface Event {
  id: number;
  title: string;
  description: string;
  images?: string[];
  url?: string;
  category: string;
  date_time: string;
  created_at?: string;
  updated_at?: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    date_time: "",
  });

  // Image state for CustomImageUpload
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const newEvent: Event = {
        id: Date.now(), // Generate a unique ID
        title: formData.title,
        description: formData.description,
        url: formData.url,
        category: formData.category,
        date_time: formData.date_time,
        images: allImageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in localStorage for demo purposes (in real app, this would be handled by API)
      const existingEvents = JSON.parse(localStorage.getItem('mockEvents') || '[]');
      existingEvents.push(newEvent);
      localStorage.setItem('mockEvents', JSON.stringify(existingEvents));

      toast.success('Event created successfully');
      router.push('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Event</h1>
        <p className="text-gray-600">Create a new event for the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event title"
            />
          </div>

          {/* Event Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event description"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Event URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/event"
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
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Networking">Networking</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Training">Training</option>
              <option value="Webinar">Webinar</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="md:col-span-2">
            <label htmlFor="date_time" className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date_time"
              name="date_time"
              value={formData.date_time}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Custom Image Upload */}
          <div className="md:col-span-2">
            <CustomImageUpload
              currentImages={currentImages}
              newImages={newImages}
              onImageChange={handleImageChange}
              onRemoveCurrentImage={removeCurrentImage}
              onRemoveNewImage={removeNewImage}
              label="Event Images"
              maxFiles={10}
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
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
