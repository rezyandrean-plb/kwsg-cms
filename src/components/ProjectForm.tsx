"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faBuilding, faMapMarkerAlt, faCalendarAlt, faHome, faDollarSign, faLink, faUserTie, faImage, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { extractImageUrls, getImageById, ProjectImage } from "@/lib/imageUtils";
import { uploadFilesToS3, validateImageFiles } from "@/lib/uploadUtils";

type ProjectFormProps = {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
};

// Function to generate slug from text
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export default function ProjectForm({ initialData, onSuccess, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    location: initialData?.location || "",
    address: initialData?.address || "",
    developer: initialData?.developer || "",
    property_type: initialData?.property_type || "",
    tenure: initialData?.tenure || "",
    completion: initialData?.completion || "",
    units: initialData?.units || "",
    price_from: initialData?.price_from || "",
    price: initialData?.price || "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [developersLoading, setDevelopersLoading] = useState(true);
  
  // Image state
  const [currentImages, setCurrentImages] = useState<string[]>(
    extractImageUrls(initialData?.images)
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch developers on component mount
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/developers/");
        setDevelopers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching developers:", error);
        toast.error("Failed to load developers");
      } finally {
        setDevelopersLoading(false);
      }
    };

    fetchDevelopers();
  }, []);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(prev => [...prev, ...files]);
    
    // Create previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove current image
  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      // Auto-generate slug from name
      if (name === 'name') {
        newForm.slug = generateSlug(value);
      }
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate new images before upload
      if (newImages.length > 0) {
        const validation = validateImageFiles(newImages);
        if (!validation.valid) {
          toast.error(`Validation errors: ${validation.errors.join(', ')}`);
          setLoading(false);
          return;
        }
      }

      // Upload new images to S3 first
      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        setUploading(true);
        toast.info("Uploading images to cloud storage...");
        const uploadResponse = await uploadFilesToS3(newImages, 'projects');
        setUploading(false);
        
        if (!uploadResponse.success) {
          const failedUploads = uploadResponse.results.filter(result => !result.success);
          const errorMessages = failedUploads.map(result => `${result.fileName}: ${result.error}`).join(', ');
          toast.error(`Failed to upload some images: ${errorMessages}`);
          setLoading(false);
          return;
        }

        // Extract successful upload URLs
        uploadedImageUrls = uploadResponse.results
          .filter(result => result.success && result.url)
          .map(result => result.url!);

        if (uploadedImageUrls.length !== newImages.length) {
          toast.warning("Some images failed to upload");
        }
      }

      // Prepare project data for database
      const projectData = {
        ...form,
        // Combine current images (URLs) with newly uploaded images (URLs)
        images: [
          ...currentImages,
          ...uploadedImageUrls
        ]
      };

      // Send project data to backend (without files, just URLs)
      if (initialData) {
        await axios.put(`http://localhost:1337/api/projects/${initialData.id}`, projectData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success("Project updated successfully!");
      } else {
        await axios.post("http://localhost:1337/api/projects", projectData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success("Project created successfully!");
      }
      
      onSuccess?.();
    } catch (err) {
      console.error('Error saving project:', err);
      toast.error("Error saving project");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faBuilding} className="w-3 h-3 text-gray-500" />
              <span>Name</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faLink} className="w-3 h-3 text-gray-500" />
              <span>Slug</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="slug" 
              name="slug" 
              value={form.slug} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="project-slug"
            />
            <p className="text-xs text-gray-500">URL-friendly identifier for the project</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-500" />
              <span>Location</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="location" 
              name="location" 
              value={form.location} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter project location"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-500" />
              <span>Address</span>
            </Label>
            <Input 
              id="address" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter full project address"
            />
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faImage} className="w-4 h-4 text-gray-500" />
            <span>Project Images</span>
          </h3>
        </div>

        {/* Current Images */}
        {currentImages.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Current Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeCurrentImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images Preview */}
        {imagePreviews.length > 0 && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">New Images</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`New image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="images" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-gray-500" />
            <span>Add Images</span>
          </Label>
          <Input 
            id="images" 
            name="images" 
            type="file" 
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">Upload multiple images (JPG, PNG, GIF)</p>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="developer" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faUserTie} className="w-3 h-3 text-gray-500" />
              <span>Developer</span>
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="developer"
              name="developer"
              value={form.developer}
              onChange={handleChange}
              required
              disabled={developersLoading}
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {developersLoading ? "Loading developers..." : "Select developer"}
              </option>
              {developers.map((developer: any) => (
                <option key={developer.id} value={developer.attributes?.name || developer.name}>
                  {developer.attributes?.name || developer.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="property_type" className="text-sm font-medium text-gray-700">
              Property Type
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="property_type"
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              required
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select property type</option>
              <option value="Apartment">Apartment</option>
              <option value="Condominium">Condominium</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Semi-detached">Semi-detached</option>
              <option value="Detached">Detached</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
              <option value="Industrial">Industrial</option>
              <option value="Mixed-use">Mixed-use</option>
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenure" className="text-sm font-medium text-gray-700">
              Tenure Type
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="tenure" 
              name="tenure" 
              value={form.tenure} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Freehold, Leasehold"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="completion" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 text-gray-500" />
              <span>Completion Date</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="completion" 
              name="completion" 
              value={form.completion} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Q4 2024"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="units" className="text-sm font-medium text-gray-700">
              Number of Units
              <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="units" 
              name="units" 
              value={form.units} 
              onChange={handleChange} 
              required 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 150"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price_from" className="text-sm font-medium text-gray-700">
              Starting Price (M)
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input 
                id="price_from" 
                name="price_from" 
                value={form.price_from} 
                onChange={handleChange} 
                required 
                className="h-11 pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700">
              Maximum Price (M)
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input 
                id="price" 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                required 
                className="h-11 pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
          {uploading ? "Uploading Images..." : 
           loading ? "Saving..." : 
           (initialData ? "Update Project" : "Create Project")}
        </Button>
      </div>
    </form>
  );
} 