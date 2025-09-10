"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faBuilding, faMapMarkerAlt, faCalendarAlt, faHome, faDollarSign, faLink, faUserTie, faImage, faTrash, faPlus, faBed, faBath, faRulerCombined, faLayerGroup, faGlobe, faTag, faInfoCircle, faSwimmingPool, faDumbbell, faCar, faTree, faWifi, faUtensils, faConciergeBell } from "@fortawesome/free-solid-svg-icons";
import { extractImageUrls, getImageById, ProjectImage } from "@/lib/imageUtils";
import { uploadFilesToS3, validateImageFiles } from "@/lib/uploadUtils";
import { getDeveloperFormValue } from "@/lib/developerUtils";
import CustomImageUpload from "./CustomImageUpload";

type ProjectFormProps = {
  initialData?: any;
  projectId?: string | number;
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

export default function ProjectForm({ initialData, projectId, onSuccess, onCancel }: ProjectFormProps) {
  console.log('ProjectForm received initialData:', initialData);
  console.log('initialData.id type:', typeof initialData?.id, 'Value:', initialData?.id);
  
  // Normalize API response data to avoid nulls in controlled inputs
  const normalizeFormData = (data: any) => {
    const fields = [
      'name', 'slug', 'title', 'overview_quote', 'location', 'type', 'tenure', 'completion',
      'units', 'total_units', 'price_from', 'price', 'price_per_sqft', 'bedrooms', 'bathrooms',
      'size', 'total_floors', 'site_area', 'district', 'status', 'description', 'latitude', 'longitude'
    ];
    const normalized: any = {};
    for (const key of fields) {
      const value = data?.[key];
      normalized[key] = value == null ? '' : value;
    }
    // Developer can come back as object or string
    if (typeof data?.developer === 'string') {
      normalized.developer = data.developer;
    } else if (data?.developer?.name) {
      normalized.developer = data.developer.name;
    } else if (data?.developer?.attributes?.name) {
      normalized.developer = data.developer.attributes.name;
    }
    return normalized;
  };

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    title: initialData?.title || "",
    overview_quote: initialData?.overview_quote || "",
    location: initialData?.location || "",
    developer: getDeveloperFormValue(initialData?.developer),
    type: initialData?.type || "",
    tenure: initialData?.tenure || "",
    completion: initialData?.completion || "",
    units: initialData?.units || "",
    total_units: initialData?.total_units || "",
    price_from: initialData?.price_from || "",
    price: initialData?.price || "",
    price_per_sqft: initialData?.price_per_sqft || "",
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    size: initialData?.size || "",
    total_floors: initialData?.total_floors || "",
    site_area: initialData?.site_area || "",
    district: initialData?.district || "",
    status: initialData?.status || "",
    description: initialData?.description || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
  });

  const [step, setStep] = useState<1 | 2>(1);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingOverview, setSavingOverview] = useState(false);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [developersLoading, setDevelopersLoading] = useState(true);
  const [createdProjectId, setCreatedProjectId] = useState<string | number | null>(null);
  const [facilities, setFacilities] = useState<string[]>(() => {
    const initialFacilities = initialData?.facilities || [];
    // Remove duplicates from initial facilities
    return [...new Set(initialFacilities)] as string[];
  });
  
  // Image state
  const [currentImages, setCurrentImages] = useState<string[]>(
    extractImageUrls(initialData?.images)
  );
  const [newImages, setNewImages] = useState<File[]>([]);

  // Facilities data
  const facilitiesOptions = [
    { value: "Swimming Pool", label: "Swimming Pool", icon: faSwimmingPool },
    { value: "Gym", label: "Gym", icon: faDumbbell },
    { value: "Car Park", label: "Car Park", icon: faCar },
    { value: "Garden", label: "Garden", icon: faTree },
    { value: "WiFi", label: "WiFi", icon: faWifi },
    { value: "Restaurant", label: "Restaurant", icon: faUtensils },
    { value: "Concierge", label: "Concierge", icon: faConciergeBell },
    { value: "BBQ Area", label: "BBQ Area", icon: faUtensils },
    { value: "Playground", label: "Playground", icon: faTree },
    { value: "Tennis Court", label: "Tennis Court", icon: faDumbbell },
    { value: "Basketball Court", label: "Basketball Court", icon: faDumbbell },
    { value: "Spa", label: "Spa", icon: faConciergeBell },
    { value: "Sauna", label: "Sauna", icon: faConciergeBell },
    { value: "Function Room", label: "Function Room", icon: faBuilding },
    { value: "Security", label: "Security", icon: faConciergeBell },
    { value: "Lift", label: "Lift", icon: faBuilding },
    { value: "Balcony", label: "Balcony", icon: faHome },
    { value: "Air Conditioning", label: "Air Conditioning", icon: faHome },
    { value: "Storage", label: "Storage", icon: faBuilding },
    { value: "Pet Friendly", label: "Pet Friendly", icon: faHome },
  ];

  // Facilities handlers
  const handleFacilityToggle = (facility: string) => {
    setFacilities(prev => {
      if (prev.includes(facility)) {
        // Remove the facility if it exists
        return prev.filter(f => f !== facility);
      } else {
        // Add the facility if it doesn't exist (prevent duplicates)
        return [...prev, facility];
      }
    });
  };


  // Fetch developers when entering Step 2
  useEffect(() => {
    if (step !== 2) return;

    const fetchDevelopers = async () => {
      try {
        const response = await axios.get("https://striking-hug-052e89dfad.strapiapp.com/api/developers/");
        setDevelopers(response.data.data || []);
      } catch (error: any) {
        // Handle 403 specifically - developers endpoint might not be publicly accessible
        if (error.response?.status === 403) {
          console.warn("Developers endpoint is not publicly accessible. Using fallback.");
          // Set a fallback developer option
          setDevelopers([{ id: 'manual', name: 'Manual Entry' }]);
        } else {
          console.error("Error fetching developers:", error);
          toast.error("Failed to load developers");
        }
      } finally {
        setDevelopersLoading(false);
      }
    };

    setDevelopersLoading(true);
    fetchDevelopers();
  }, [step]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    setUploading(true);
    
    try {
      // Validate new images before upload
      if (newImages.length > 0) {
        const validation = validateImageFiles(newImages);
        if (!validation.valid) {
          toast.error(`Validation errors: ${validation.errors.join(', ')}`);
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Upload new images to S3
      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        const uploadResponse = await uploadFilesToS3(newImages, 'projects');
        
        if (!uploadResponse.success) {
          const errors = uploadResponse.results
            .filter(result => !result.success)
            .map(result => `${result.fileName}: ${result.error}`)
            .join(', ');
          toast.error(`Image upload failed: ${errors}`);
          setLoading(false);
          setUploading(false);
          return;
        }

        // Extract successful upload URLs
        uploadedImageUrls = uploadResponse.results
          .filter(result => result.success && result.url)
          .map(result => result.url!);
      }

      // Combine current images with newly uploaded images
      const allImageUrls = [...currentImages, ...uploadedImageUrls];

      // Prepare project data for database with Strapi format
      const projectData = {
        data: {
          name: form.name,
          slug: form.slug,
          title: form.title,
          overview_quote: form.overview_quote,
          location: form.location,
          developer: { name: form.developer },
          type: form.type,
          tenure: form.tenure,
          completion: form.completion,
          units: form.units,
          total_units: form.total_units,
          price_from: form.price_from,
          price: form.price,
          price_per_sqft: form.price_per_sqft,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          size: form.size,
          total_floors: form.total_floors,
          site_area: form.site_area,
          description: form.description,
          status: form.status,
          image_url_banner: allImageUrls[0] || null, // Use first image as banner
          images: allImageUrls, // Include all image URLs in the project data
          facilities: facilities // Include facilities array
        }
      };

      // Send project data to backend
      if (initialData) {
        // Update existing project - complete data
        const finalProjectId = projectId || (() => {
          let id = initialData.id;
          if (typeof id === 'object' && id !== null) {
            id = id.id;
          }
          if (typeof id === 'string') {
            id = parseInt(id, 10);
          }
          return id;
        })();
        
        console.log('Final Project ID:', finalProjectId, 'Type:', typeof finalProjectId);
        
        console.log('=== PROJECT UPDATE DEBUG ===');
        console.log('Final Project ID:', finalProjectId);
        console.log('Update URL:', `https://striking-hug-052e89dfad.strapiapp.com/api/projects/${finalProjectId}`);
        console.log('Request payload:', JSON.stringify(projectData, null, 2));
        
        const response = await axios.put(`https://striking-hug-052e89dfad.strapiapp.com/api/projects/${finalProjectId}`, projectData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Update form state with response data if available
        if (response.data?.data) {
          setForm(prev => ({
            ...prev,
            ...normalizeFormData(response.data.data),
            developer: normalizeFormData(response.data.data).developer ?? prev.developer,
          }));
        }
        
        toast.success("Project updated successfully!");
      } else {
        // For new projects, use the created project ID from Step 1
        if (createdProjectId) {
          // Update the existing project created in Step 1
          const response = await axios.put(`https://striking-hug-052e89dfad.strapiapp.com/api/projects/${createdProjectId}`, projectData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Update form state with response data if available
          if (response.data?.data) {
            setForm(prev => ({
              ...prev,
              ...normalizeFormData(response.data.data),
              developer: normalizeFormData(response.data.data).developer ?? prev.developer,
            }));
          }
          
          toast.success("Project completed successfully!");
        } else {
          // Fallback: create new project with complete data
          const response = await axios.post("https://striking-hug-052e89dfad.strapiapp.com/api/projects", projectData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Update form state with created project data
          if (response.data?.data) {
            setForm(prev => ({
              ...prev,
              ...normalizeFormData(response.data.data),
              developer: normalizeFormData(response.data.data).developer ?? prev.developer,
            }));
          }
          
          toast.success("Project created successfully!");
        }
      }
      
      onSuccess?.();
    } catch (err: any) {
      console.error('=== PROJECT SAVE ERROR ===');
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Handle specific error cases
      if (err.response?.data?.error?.message) {
        console.error('Strapi error message:', err.response.data.error.message);
        toast.error(`Error: ${err.response.data.error.message}`);
      } else if (err.response?.data?.message) {
        console.error('API error message:', err.response.data.message);
        toast.error(`Error: ${err.response.data.message}`);
      } else if (err.response?.status === 400) {
        console.error('400 Bad Request - Validation error');
        toast.error('Validation error. Please check your input fields.');
      } else if (err.response?.status === 401) {
        console.error('401 Unauthorized - Authentication required');
        toast.error('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        console.error('403 Forbidden - Permission denied');
        toast.error('Permission denied. You may not have access to update this project.');
      } else if (err.response?.status === 404) {
        console.error('404 Not Found');
        toast.error('Project not found. Please refresh and try again.');
      } else if (err.response?.status === 500) {
        console.error('500 Server Error');
        toast.error('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR') {
        console.error('Network Error');
        toast.error('Network error. Please check your connection.');
      } else {
        console.error('Unknown error');
        toast.error("Error saving project. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleSubmitOverview = async () => {
    setSavingOverview(true);
    try {
      // Try both formats - Strapi v4 format and direct format
      const overviewDataStrapi = {
        data: {
          title: form.title,
          description: form.description,
          overview_quote: form.overview_quote,
        }
      };
      
      const overviewDataDirect = {
        title: form.title,
        description: form.description,
        overview_quote: form.overview_quote,
      };
      
      // Use Strapi format by default, but we can switch if needed
      const overviewData = overviewDataStrapi;

      console.log('=== OVERVIEW SAVE DEBUG ===');
      console.log('Form data:', { title: form.title, description: form.description, overview_quote: form.overview_quote });
      console.log('Request payload:', JSON.stringify(overviewData, null, 2));
      console.log('Has initialData:', !!initialData);
      console.log('ProjectId prop:', projectId);
      
      // Validate required fields
      if (!form.title || !form.description) {
        toast.error('Title and description are required fields.');
        setSavingOverview(false);
        return;
      }

      if (initialData) {
        // Update existing project - only overview fields
        const finalProjectId = projectId || (() => {
          let id = initialData.id;
          if (typeof id === 'object' && id !== null) {
            // In case Strapi returns nested id
            id = id.id;
          }
          if (typeof id === 'string') {
            id = parseInt(id, 10);
          }
          return id;
        })();

        console.log('Final Project ID for update:', finalProjectId);
        console.log('Update URL:', `https://striking-hug-052e89dfad.strapiapp.com/api/projects/${finalProjectId}`);

        let response;
        try {
          response = await axios.put(`https://striking-hug-052e89dfad.strapiapp.com/api/projects/${finalProjectId}`, overviewData, {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (firstError: any) {
          if (firstError.response?.status === 400) {
            console.log('Strapi format failed, trying direct format...');
            response = await axios.put(`https://striking-hug-052e89dfad.strapiapp.com/api/projects/${finalProjectId}`, overviewDataDirect, {
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw firstError;
          }
        }
        
        // Update the initialData with the response to maintain state
        if (response.data?.data) {
          setForm(prev => ({
            ...prev,
            title: response.data.data.title || prev.title,
            description: response.data.data.description || prev.description,
            overview_quote: response.data.data.overview_quote || prev.overview_quote,
          }));
        }
        
        toast.success('Overview saved successfully');
      } else {
        // Create minimal project with overview fields
        console.log('Creating new project with overview data');
        console.log('Create URL:', 'https://striking-hug-052e89dfad.strapiapp.com/api/projects');
        
        let response;
        try {
          response = await axios.post('https://striking-hug-052e89dfad.strapiapp.com/api/projects', overviewData, {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (firstError: any) {
          if (firstError.response?.status === 400) {
            console.log('Strapi format failed, trying direct format...');
            response = await axios.post('https://striking-hug-052e89dfad.strapiapp.com/api/projects', overviewDataDirect, {
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            throw firstError;
          }
        }
        
        // Store the created project ID for Step 2
        if (response.data?.data?.id) {
          const newProjectId = response.data.data.id;
          setCreatedProjectId(newProjectId);
          
          toast.success('Overview created successfully. You can now proceed to Step 2.');
        } else {
          toast.error('Overview created but could not retrieve project ID');
        }
      }
    } catch (err: any) {
      console.error('=== OVERVIEW SAVE ERROR ===');
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      console.error('Error response headers:', err.response?.headers);
      
      // Handle specific error cases
      if (err.response?.data?.error?.message) {
        console.error('Strapi error message:', err.response.data.error.message);
        toast.error(`Error: ${err.response.data.error.message}`);
      } else if (err.response?.data?.message) {
        console.error('API error message:', err.response.data.message);
        toast.error(`Error: ${err.response.data.message}`);
      } else if (err.response?.status === 400) {
        console.error('400 Bad Request - Validation error');
        toast.error('Validation error. Please check your input.');
      } else if (err.response?.status === 404) {
        console.error('404 Not Found');
        toast.error('Project not found. Please refresh and try again.');
      } else {
        console.error('Unknown error');
        toast.error('Error saving overview. Please try again.');
      }
    } finally {
      setSavingOverview(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 1: Overview</span>
          <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 2: Details</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Project Overview</h3>
            <p className="text-sm text-gray-600 mt-1">Content used at the top of the project page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Project Title
              </Label>
              <Input 
                id="title" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter project title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="Enter detailed project description..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overview_quote" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3 text-gray-500" />
              <span>Signature Quote</span>
            </Label>
            <textarea
              id="overview_quote"
              name="overview_quote"
              value={form.overview_quote}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none resize-none"
              placeholder="e.g., Where modern architecture meets timeless elegance..."
            />
            <p className="text-xs text-gray-500">Shown below the description in a highlighted callout.</p>
          </div>
        </div>
      )}
      {/* Basic Information Section (Step 2 only) */}
      {step === 2 && (
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
          
          
        </div>
      </div>
      )}

      {step === 2 && (
      <>
      {/* Custom Image Upload Section */}
      <CustomImageUpload
        currentImages={currentImages}
        newImages={newImages}
        onImageChange={handleImageChange}
        onRemoveCurrentImage={removeCurrentImage}
        onRemoveNewImage={removeNewImage}
        label="Project Images"
        maxFiles={15}
      />

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
            {developers.length > 0 && developers[0]?.id !== 'manual' ? (
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
                {developers.map((developer: any) => {
                  const developerName = developer.attributes?.name || developer.name || 'Unknown Developer';
                  return (
                    <option key={developer.id} value={developerName}>
                      {developerName}
                    </option>
                  );
                })}
              </select>
            ) : (
              <Input
                id="developer"
                name="developer"
                value={form.developer}
                onChange={handleChange}
                required
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter developer name"
              />
            )}
            {developers.length > 0 && developers[0]?.id === 'manual' && (
              <p className="text-xs text-amber-600">
                Developer list unavailable. Please enter the developer name manually.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Property Type
              <span className="text-red-500">*</span>
            </Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select property type</option>
              <option value="Apartment">Apartment</option>
              <option value="Condominium">Condominium</option>
              <option value="Luxury Condominium">Luxury Condominium</option>
              <option value="Mixed Development">Mixed Development</option>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <div className="space-y-2">
            <Label htmlFor="total_units" className="text-sm font-medium text-gray-700">
              Total Units
            </Label>
            <Input 
              id="total_units" 
              name="total_units" 
              value={form.total_units} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 142"
            />
          </div>
        </div>
      </div>

      {/* Unit Details Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-blue-600" />
            <span>Unit Details</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faBed} className="w-3 h-3 text-gray-500" />
              <span>Bedrooms</span>
            </Label>
            <Input 
              id="bedrooms" 
              name="bedrooms" 
              value={form.bedrooms} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 2-4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faBath} className="w-3 h-3 text-gray-500" />
              <span>Bathrooms</span>
            </Label>
            <Input 
              id="bathrooms" 
              name="bathrooms" 
              value={form.bathrooms} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 2-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="size" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faRulerCombined} className="w-3 h-3 text-gray-500" />
              <span>Size Range</span>
            </Label>
            <Input 
              id="size" 
              name="size" 
              value={form.size} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 732-1410 sq ft"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_per_sqft" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3 text-gray-500" />
              <span>Price per sq ft</span>
            </Label>
            <Input 
              id="price_per_sqft" 
              name="price_per_sqft" 
              value={form.price_per_sqft} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., $2,500"
            />
          </div>
        </div>
      </div>

      {/* Project Specifications Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-blue-600" />
            <span>Project Specifications</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="total_floors" className="text-sm font-medium text-gray-700">
              Total Floors
            </Label>
            <Input 
              id="total_floors" 
              name="total_floors" 
              value={form.total_floors} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 25"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_area" className="text-sm font-medium text-gray-700">
              Site Area
            </Label>
            <Input 
              id="site_area" 
              name="site_area" 
              value={form.site_area} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 50,000 sq ft"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Project Type
            </Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select project type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed Use">Mixed Use</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location & Status Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-blue-600" />
            <span>Location & Status</span>
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium text-gray-700">
              District
            </Label>
            <select
              id="district"
              name="district"
              value={form.district}
              onChange={handleChange}
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select district</option>
              <option value="D01">D01 - Raffles Place, Marina, Cecil</option>
              <option value="D02">D02 - Tanjong Pagar, Chinatown</option>
              <option value="D03">D03 - Queenstown, Tiong Bahru</option>
              <option value="D04">D04 - Telok Blangah, Harbourfront</option>
              <option value="D05">D05 - Buona Vista, West Coast, Clementi</option>
              <option value="D06">D06 - City Hall, Clarke Quay</option>
              <option value="D07">D07 - Bugis, Rochor, Golden Mile</option>
              <option value="D08">D08 - Little India, Farrer Park</option>
              <option value="D09">D09 - Orchard, River Valley</option>
              <option value="D10">D10 - Tanglin, Holland, Bukit Timah</option>
              <option value="D11">D11 - Novena, Thomson, Toa Payoh</option>
              <option value="D12">D12 - Balestier, Toa Payoh, Serangoon</option>
              <option value="D13">D13 - Macpherson, Braddell</option>
              <option value="D14">D14 - Geylang, Eunos, Paya Lebar</option>
              <option value="D15">D15 - Katong, Joo Chiat, Amber Road</option>
              <option value="D16">D16 - Bedok, Upper East Coast</option>
              <option value="D17">D17 - Changi, Loyang, Pasir Ris</option>
              <option value="D18">D18 - Tampines, Pasir Ris</option>
              <option value="D19">D19 - Hougang, Punggol, Sengkang</option>
              <option value="D20">D20 - Ang Mo Kio, Bishan, Thomson</option>
              <option value="D21">D21 - Upper Bukit Timah, Clementi Park</option>
              <option value="D22">D22 - Jurong, Boon Lay</option>
              <option value="D23">D23 - Bukit Batok, Choa Chu Kang</option>
              <option value="D24">D24 - Lim Chu Kang, Tengah</option>
              <option value="D25">D25 - Kranji, Woodgrove</option>
              <option value="D26">D26 - Upper Thomson, Springleaf</option>
              <option value="D27">D27 - Yishun, Sembawang</option>
              <option value="D28">D28 - Seletar, Yio Chu Kang</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Project Status
            </Label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="h-11 w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select status</option>
              <option value="Launching Soon">Launching Soon</option>
              <option value="New Launch">New Launch</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Ready for Move-in">Ready for Move-in</option>
              <option value="Completed">Completed</option>
              <option value="Sold Out">Sold Out</option>
            </select>
          </div>
          
          
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">
              Latitude
            </Label>
            <Input 
              id="latitude" 
              name="latitude" 
              value={form.latitude} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 1.3521"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">
              Longitude
            </Label>
            <Input 
              id="longitude" 
              name="longitude" 
              value={form.longitude} 
              onChange={handleChange} 
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 103.8198"
            />
          </div>
        </div>
      </div>

      {/* Description Section moved to Step 1; hidden in Step 2 */}

      {/* Facilities Section */}
      <div className="space-y-6">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FontAwesomeIcon icon={faConciergeBell} className="w-4 h-4 text-blue-600" />
            <span>Facilities & Amenities</span>
          </h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the facilities and amenities available in this project
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {facilitiesOptions.map((facility) => (
              <div
                key={facility.value}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  facilities.includes(facility.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onClick={() => handleFacilityToggle(facility.value)}
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(facility.value)}
                  onChange={() => handleFacilityToggle(facility.value)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-2 w-full">
                  <FontAwesomeIcon 
                    icon={facility.icon} 
                    className={`w-4 h-4 ${
                      facilities.includes(facility.value) ? 'text-blue-600' : 'text-gray-500'
                    }`} 
                  />
                  <span className="text-sm font-medium">{facility.label}</span>
                </div>
                {facilities.includes(facility.value) && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {facilities.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Facilities ({facilities.length}):</p>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility, index) => (
                  <span
                    key={`${facility}-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => handleFacilityToggle(facility)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
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
      </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between space-x-4 pt-6 border-t border-gray-200">
        <div>
          {step === 2 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(1)}
              className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {step === 1 ? (
            <>
              <Button 
                type="button" 
                onClick={handleSubmitOverview}
                disabled={savingOverview}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {savingOverview ? 'Saving Overview...' : 'Save Overview'}
              </Button>
              <Button 
                type="button" 
                onClick={() => setStep(2)}
                className="h-11 px-6 bg-gray-800 hover:bg-gray-900 text-white"
              >
                Next
              </Button>
            </>
          ) : (
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
          )}
        </div>
      </div>
    </form>
  );
} 