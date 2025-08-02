"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import ProjectImageGallery from "@/components/ProjectImageGallery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import { extractImageUrls, ProjectImage } from "@/lib/imageUtils";

interface Project {
  id: number;
  name: string;
  property_type: string;
  developer: string;
  price: string;
  address: string;
  createdAt: string;
  project_name?: string;
  images?: ProjectImage[];
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('URL params:', params);
    console.log('params.id type:', typeof params.id, 'Value:', params.id);
    if (params.id) {
      fetch(`https://striking-hug-052e89dfad.strapiapp.com/api/projects/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch project");
          return res.json();
        })
        .then((data) => {
          const projectData = data.data || data;
          console.log('Project data being passed to form:', projectData);
          console.log('Project ID type:', typeof projectData.id, 'Value:', projectData.id);
          setProject(projectData);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [params.id]);

  const handleSuccess = () => {
    router.push("/projects");
  };

  const handleCancel = () => {
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-medium">Error loading project</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-medium">Project not found</p>
            <p className="text-sm mt-1">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <button
                onClick={() => router.push("/projects")}
                className="hover:text-gray-700 transition-colors flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                <span>Projects</span>
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit Project</span>
            </nav>
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FontAwesomeIcon icon={faEdit} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
                  <p className="text-gray-600 mt-1">
                    Update information for "{project.project_name || project.name}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Images Section */}
        {project.images && project.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Current Project Images</h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on any image to view it in full size
              </p>
            </div>
            <div className="p-6">
              <ProjectImageGallery 
                images={extractImageUrls(project.images)} 
                className="mb-4"
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Make changes to the project information below
            </p>
          </div>
          <div className="p-6">
            <ProjectForm
              initialData={project}
              projectId={Array.isArray(params.id) ? params.id[0] : params.id}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 