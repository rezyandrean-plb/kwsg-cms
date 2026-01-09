"use client";

import { useRouter } from "next/navigation";
import NewsletterForm from "../components/NewsletterForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function NewNewsletterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/newsletters");
  };

  const handleCancel = () => {
    router.push("/newsletters");
  };

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
              <span className="text-gray-900 font-medium">New Newsletter</span>
            </nav>
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faPlus} className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">New Newsletter</h1>
                  <p className="text-gray-600 mt-1">
                    Create a new newsletter entry with PDF file
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
              Fill in the newsletter information below
            </p>
          </div>
          <div className="p-6">
            <NewsletterForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
