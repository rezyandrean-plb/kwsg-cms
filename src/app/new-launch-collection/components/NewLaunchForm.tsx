"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faEye, faTimes, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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

const DISTRICT_OPTIONS = [
  "District 1 - Marina Bay, Raffles Place, Cecil",
  "District 2 - Chinatown, Tanjong Pagar",
  "District 3 - Queenstown, Tiong Bahru",
  "District 4 - Telok Blangah, Harbourfront",
  "District 5 - Pasir Panjang, West Coast, Clementi New Town",
  "District 6 - City Hall, Clarke Quay",
  "District 7 - Beach Road, Bugis, Rochor",
  "District 8 - Farrer Park, Serangoon Road",
  "District 9 - Orchard, Cairnhill, River Valley",
  "District 10 - Tanglin, Holland, Bukit Timah",
  "District 11 - Novena, Thomson, Newton",
  "District 12 - Balestier, Toa Payoh, Serangoon",
  "District 13 - Macpherson, Braddell",
  "District 14 - Geylang, Paya Lebar, Eunos",
  "District 15 - Katong, Joo Chiat, Amber Road",
  "District 16 - Bedok, Upper East Coast",
  "District 17 - Loyang, Changi",
  "District 18 - Tampines, Pasir Ris",
  "District 19 - Serangoon Garden, Hougang, Punggol",
  "District 20 - Bishan, Ang Mo Kio",
  "District 21 - Upper Bukit Timah, Clementi Park",
  "District 22 - Jurong",
  "District 23 - Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang",
  "District 24 - Lim Chu Kang, Tengah",
  "District 25 - Woodlands, Kranji",
  "District 26 - Upper Thomson, Springleaf",
  "District 27 - Yishun, Sembawang",
  "District 28 - Seletar",
];

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
      values.summary.trim().length > 0 &&
      values.image.trim().length > 0 &&
      values.location.trim().length > 0 &&
      values.district.trim().length > 0 &&
      values.bedrooms.trim().length > 0 &&
      values.price.trim().length > 0 &&
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
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFileToS3(file, "new-launch-collection");
      if (result.success && result.url) {
        setValues(prev => ({ ...prev, image: result.url! }));
        toast.success("Image uploaded successfully");
        setShowUploadArea(false);
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      setValues(prev => ({ ...prev, image: "" }));
      setShowUploadArea(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? "Edit New Launch" : "Create New Launch"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {isEdit ? "Update the new launch information" : "Add a new property launch to the collection"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={values.title}
                onChange={e => handleChange("title", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Project title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer
              </label>
              <input
                value={values.developer ?? ""}
                onChange={e => handleChange("developer", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Developer name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={values.summary}
                onChange={e => handleChange("summary", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                rows={4}
                placeholder="Short description of the property launch"
                required
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Thumbnail Image <span className="text-red-500">*</span>
          </h2>
          
          {values.image ? (
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={values.image}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 cursor-pointer bg-gray-100 transition-transform group-hover:scale-[1.02]"
                  onClick={() => setShowLightbox(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'w-full h-64 bg-gray-100 border-2 border-gray-300 rounded-xl flex items-center justify-center text-gray-600 text-sm';
                    errorDiv.innerHTML = 'Image not available';
                    target.parentNode?.appendChild(errorDiv);
                  }}
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowLightbox(true)}
                    className="bg-white text-gray-700 p-2.5 rounded-lg hover:bg-gray-100 shadow-lg transition-colors"
                    title="View image"
                  >
                    <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white p-2.5 rounded-lg hover:bg-red-600 shadow-lg transition-colors"
                    title="Remove image"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadArea(!showUploadArea)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                disabled={isUploading}
              >
                {showUploadArea ? "Cancel" : "Change image"}
              </button>

              {showUploadArea && (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FontAwesomeIcon 
                    icon={isUploading ? faSpinner : faUpload} 
                    className={`w-10 h-10 text-gray-400 mb-4 ${isUploading ? 'animate-spin' : ''}`}
                  />
                  <p className="text-base font-medium text-gray-700 mb-2">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
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
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FontAwesomeIcon 
                icon={isUploading ? faSpinner : faUpload} 
                className={`w-12 h-12 text-gray-400 mb-4 ${isUploading ? 'animate-spin' : ''}`}
              />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop an image here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Supports JPG, PNG, GIF, WebP (max 10MB)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
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

        {/* Property Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            Property Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                value={values.location}
                onChange={e => handleChange("location", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Neighborhood or area"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={values.district}
                onChange={e => handleChange("district", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                required
              >
                <option value="">Select district</option>
                {DISTRICT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={values.status}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility <span className="text-red-500">*</span>
              </label>
              <select
                value={values.visibility}
                onChange={e => handleChange("visibility", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                required
              >
                {["Show", "Hidden"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={values.type}
                onChange={e => handleChange("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                required
              >
                {["Condo", "Landed", "Mixed", "Executive Condo", "Other"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms Total <span className="text-red-500">*</span>
              </label>
              <input
                value={values.bedrooms}
                onChange={e => handleChange("bedrooms", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. 1-4, 3-5, 2-5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Price <span className="text-red-500">*</span>
              </label>
              <input
                value={values.price}
                onChange={e => handleChange("price", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="$1,495,000"
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Enter only the numeric price (Example: 1,000,000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Launch Date
              </label>
              <input
                value={values.launchDate ?? ""}
                onChange={e => handleChange("launchDate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. April 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={values.units === "" ? "" : String(values.units)}
                onChange={e => handleNumberChange("units", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. 200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landing URL
              </label>
              <input
                value={values.url}
                onChange={e => handleChange("url", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="/my-project"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
                !canSubmit || saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                isEdit ? "Save Changes" : "Create Launch"
              )}
            </button>
          </div>
        </div>

        {/* Lightbox */}
        {showLightbox && values.image && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLightbox(false)}
          >
            <div className="relative max-w-5xl max-h-full">
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute -top-12 right-0 bg-white text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
              <img
                src={values.image}
                alt="Full size preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
