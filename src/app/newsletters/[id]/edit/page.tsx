"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NewsletterForm from "../../components/NewsletterForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Newsletter {
  id: number;
  date: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditNewsletterPage() {
  const router = useRouter();
  const params = useParams();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    if (id) {
      fetch(`/api/newsletters/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch newsletter");
          return res.json();
        })
        .then((data) => {
          setNewsletter(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleSuccess = () => {
    router.push("/newsletters");
  };

  const handleCancel = () => {
    router.push("/newsletters");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading newsletter details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-medium">Error loading newsletter</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-medium">Newsletter not found</p>
            <p className="text-sm mt-1">The newsletter you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <button
                onClick={() => router.push("/newsletters")}
                className="hover:text-gray-700 transition-colors flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Newsletters</span>
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit Newsletter</span>
            </nav>
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faEdit} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Newsletter</h1>
                  <p className="text-gray-600 mt-1">
                    Update information for "{newsletter.date}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Newsletter Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Make changes to the newsletter information below
            </p>
          </div>
          <div className="p-6">
            <NewsletterForm
              initialData={newsletter}
              newsletterId={Array.isArray(params.id) ? params.id[0] : params.id}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
