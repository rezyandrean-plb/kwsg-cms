"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faFilePdf, faSpinner, faCheck, faPen } from "@fortawesome/free-solid-svg-icons";
import { uploadFilesToS3 } from "@/lib/uploadUtils";

interface NewsletterFormProps {
  initialData?: {
    id: number;
    date: string;
    url: string;
    active: boolean;
  };
  newsletterId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewsletterForm({
  initialData,
  newsletterId,
  onSuccess,
  onCancel,
}: NewsletterFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(initialData?.date || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showFileUpload, setShowFileUpload] = useState<boolean>(!initialData?.url);
  
  // Date picker states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Parse existing date format on mount
  useEffect(() => {
    if (initialData?.date) {
      const dateMatch = initialData.date.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*–\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        // Convert DD/MM/YYYY to YYYY-MM-DD for date inputs
        const startParts = dateMatch[1].split('/');
        const endParts = dateMatch[2].split('/');
        setStartDate(`${startParts[2]}-${startParts[1].padStart(2, '0')}-${startParts[0].padStart(2, '0')}`);
        setEndDate(`${endParts[2]}-${endParts[1].padStart(2, '0')}-${endParts[0].padStart(2, '0')}`);
      }
    }
  }, [initialData]);

  // Update date string when start/end dates change
  useEffect(() => {
    if (startDate && endDate) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      setDate(`${formatDate(startDate)} – ${formatDate(endDate)}`);
    } else if (!startDate && !endDate && !initialData) {
      // Reset date if both are cleared (only for new newsletters)
      setDate("");
    }
  }, [startDate, endDate, initialData]);

  // Automatically show upload area again if URL is cleared
  useEffect(() => {
    if (!url) {
      setShowFileUpload(true);
    }
  }, [url]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      setUploadProgress("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress("Uploading PDF...");

    try {
      const result = await uploadFilesToS3([selectedFile], "newsletter");
      
      if (result.success && result.results.length > 0 && result.results[0].url) {
        setUrl(result.results[0].url);
        setUploadProgress("Upload successful!");
        toast.success("PDF uploaded successfully");
        setSelectedFile(null);
        setTimeout(() => setUploadProgress(""), 2000);
      } else {
        const error = result.results[0]?.error || "Upload failed";
        toast.error(error);
        setUploadProgress("");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload PDF");
      setUploadProgress("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    // Format the date string if not already formatted
    let formattedDate = date;
    if (!formattedDate || !formattedDate.includes('–')) {
      const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };
      formattedDate = `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }

    if (!url.trim()) {
      toast.error("Please provide a PDF URL or upload a file");
      return;
    }

    setSaving(true);

    try {
      const method = initialData ? "PUT" : "POST";
      const apiUrl = initialData
        ? `/api/newsletters/${newsletterId}`
        : "/api/newsletters";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate.trim(),
          url: url.trim(),
          active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || "Failed to save newsletter");
      }

      toast.success(
        initialData ? "Newsletter updated successfully" : "Newsletter created successfully"
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/newsletters");
      }
    } catch (error: any) {
      console.error("Error saving newsletter:", error);
      toast.error(error.message || "Failed to save newsletter");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        {date && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Formatted:</span> {date}
            </p>
          </div>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Select the start and end dates for this newsletter. The date range will be formatted automatically.
        </p>
      </div>

      {/* PDF Upload Section */}
      {showFileUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File <span className="text-red-500">*</span>
          </label>
          
          <div className="space-y-4">
            {/* File Input */}
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <FontAwesomeIcon icon={faFilePdf} className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : "Choose PDF file"}
                  </span>
                </div>
              </label>
              
              {selectedFile && !uploading && (
                <button
                  type="button"
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  <span>Upload</span>
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}

            {uploadProgress && uploadProgress.includes("successful") && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                <span>{uploadProgress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          PDF URL <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://kwsingapore.s3.ap-southeast-1.amazonaws.com/newsletter/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {url && (
            <button
              type="button"
              onClick={() => setShowFileUpload(true)}
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
              title="Change PDF file"
              aria-label="Change PDF file"
            >
              <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Enter the S3 URL for the PDF file, or upload a file above to generate the URL automatically
        </p>
        {url && (
          <div className="mt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faFilePdf} className="w-3 h-3" />
              <span>Preview PDF</span>
            </a>
          </div>
        )}
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Only active newsletters will be displayed on the frontend
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
          <span>{saving ? "Saving..." : initialData ? "Update Newsletter" : "Create Newsletter"}</span>
        </button>
      </div>
    </form>
  );
}
