"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faEye, faTimes } from "@fortawesome/free-solid-svg-icons";
import { uploadFileToS3, validateImageFile } from "@/lib/uploadUtils";

export interface NewLaunchFormValues {
  title: string;
  summary: string;
  image: string;
  location: string;
  district: string;
  status: string;
  visibility: string;
  type: string;
  bedrooms: string;
  price: string;
  url: string;
  launchDate?: string;
  developer?: string;
  units?: number | "";
  views?: number | "";
}

interface NewLaunchFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<NewLaunchFormValues>;
  id?: number;
}

const defaultValues: NewLaunchFormValues = {
  title: "",
  summary: "",
  image: "",
  location: "",
  district: "",
  status: "Registration Open",
  visibility: "Show",
  type: "Condo",
  bedrooms: "",
  price: "",
  url: "",
  launchDate: "",
  developer: "",
  units: "",
  views: "",
};

export default function NewLaunchForm({ mode, initialValues, id }: NewLaunchFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<NewLaunchFormValues>({ ...defaultValues, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(v => ({ ...v, ...initialValues }));
  }, [initialValues]);

  const isEdit = mode === "edit";

  const canSubmit = useMemo(() => {
    return (
      values.title.trim().length > 0 &&
      values.location.trim().length > 0 &&
      values.status.trim().length > 0 &&
      values.visibility.trim().length > 0 &&
      values.type.trim().length > 0
    );
  }, [values]);

  const handleChange = (field: keyof NewLaunchFormValues, val: string) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  const handleNumberChange = (field: keyof NewLaunchFormValues, val: string) => {
    if (val === "") {
      setValues(prev => ({ ...prev, [field]: "" }));
      return;
    }
    const n = Number(val);
    if (!Number.isNaN(n)) setValues(prev => ({ ...prev, [field]: n }));
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
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to S3 with the specified folder
      const result = await uploadFileToS3(file, 'images/new-launch-collection');
      
      if (result.success && result.url) {
        setValues(prev => ({ ...prev, image: result.url! }));
        setShowUploadArea(false); // Hide upload area after successful upload
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
    setValues(prev => ({ ...prev, image: "" }));
    setShowUploadArea(false); // Hide upload area when image is removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...values,
        units: values.units === "" ? undefined : values.units,
        views: values.views === "" ? undefined : values.views,
      };
      const endpoint = isEdit ? `/api/new-launch-collection/${id}` : "/api/new-launch-collection";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to ${isEdit ? "update" : "create"} new launch`);
      toast.success(`New launch ${isEdit ? "updated" : "created"} successfully`);
      router.push("/new-launch-collection");
      // Ensure list reflects the latest data
      if (typeof (router as any).refresh === 'function') {
        (router as any).refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border rounded-lg p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{isEdit ? "Edit New Launch" : "Create New Launch"}</h1>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className={`px-4 py-2 rounded text-white ${!canSubmit || saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            value={values.title}
            onChange={e => handleChange("title", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Project title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Developer</label>
          <input
            value={values.developer ?? ""}
            onChange={e => handleChange("developer", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Developer name"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Summary</label>
          <textarea
            value={values.summary}
            onChange={e => handleChange("summary", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Short description"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
          
          {values.image ? (
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={values.image}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer bg-gray-100"
                  onClick={() => setShowLightbox(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'w-full h-64 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm';
                    errorDiv.innerHTML = 'Image not available';
                    target.parentNode?.appendChild(errorDiv);
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

              {/* Upload area shown below current image when "Change image" is clicked */}
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Choose Image'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : (
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Landing URL</label>
          <input
            value={values.url}
            onChange={e => handleChange("url", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="/my-project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location *</label>
          <input
            value={values.location}
            onChange={e => handleChange("location", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Neighborhood or area"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input
            value={values.district}
            onChange={e => handleChange("district", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="District number/name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status *</label>
          <select
            value={values.status}
            onChange={e => handleChange("status", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          >
            {[
              "Registration Open",
              "Preview Available",
              "Coming Soon",
              "Ongoing",
              "Completed",
              "Upcoming",
              "Launched",
              "Sold Out",
            ].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Visibility *</label>
          <select
            value={values.visibility}
            onChange={e => handleChange("visibility", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          >
            {["Show", "Hidden"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type *</label>
          <select
            value={values.type}
            onChange={e => handleChange("type", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          >
            {["Condo", "Landed", "Mixed", "Executive Condo", "Other"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <input
            value={values.bedrooms}
            onChange={e => handleChange("bedrooms", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="e.g. 1-4, 3-5, 2-5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            value={values.price}
            onChange={e => handleChange("price", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="From $1,495,000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Launch Date</label>
          <input
            value={values.launchDate ?? ""}
            onChange={e => handleChange("launchDate", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="e.g. April 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Units</label>
          <input
            type="number"
            inputMode="numeric"
            value={values.units === "" ? "" : String(values.units)}
            onChange={e => handleNumberChange("units", e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="e.g. 200"
          />
        </div>

        
      </div>

      {/* Lightbox */}
      {showLightbox && values.image && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 z-10"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
            <img
              src={values.image}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </form>
  );
}


