"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHome, 
  faBuilding, 
  faDollarSign, 
  faChartLine, 
  faMapMarkerAlt,
  faCalendarAlt,
  faArrowUp,
  faArrowDown,
  faEye,
  faEdit,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { ProjectImage } from "@/lib/imageUtils";

interface Project {
  id: number;
  project_name: string;
  property_type: string;
  developer: string;
  price: string;
  address: string;
  createdAt: string;
  images?: ProjectImage[];
}

interface DashboardStats {
  totalProjects: number;
  totalValue: number;
  averagePrice: number;
  propertyTypes: { [key: string]: number };
  topDevelopers: { [key: string]: number };
  recentProjects: Project[];
  priceRange: {
    under500k: number;
    under1m: number;
    under2m: number;
    over2m: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch("https://striking-hug-052e89dfad.strapiapp.com/api/projects/");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      const projectsData = data.data || [];
      setProjects(projectsData);
      
      // Calculate dashboard statistics
      const calculatedStats = calculateStats(projectsData);
      setStats(calculatedStats);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateStats = (projects: Project[]): DashboardStats => {
    const propertyTypes: { [key: string]: number } = {};
    const developers: { [key: string]: number } = {};
    let totalValue = 0;
    let under500k = 0, under1m = 0, under2m = 0, over2m = 0;

    projects.forEach(project => {
      // Count property types
      propertyTypes[project.property_type] = (propertyTypes[project.property_type] || 0) + 1;
      
      // Count developers
      developers[project.developer] = (developers[project.developer] || 0) + 1;
      
      // Calculate price statistics
      const price = parseFloat(project.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) {
        totalValue += price;
        if (price < 500000) under500k++;
        else if (price < 1000000) under1m++;
        else if (price < 2000000) under2m++;
        else over2m++;
      }
    });

    // Sort developers by count
    const topDevelopers = Object.fromEntries(
      Object.entries(developers).sort(([,a], [,b]) => b - a).slice(0, 5)
    );

    // Get recent projects (last 5)
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalProjects: projects.length,
      totalValue,
      averagePrice: projects.length > 0 ? totalValue / projects.length : 0,
      propertyTypes,
      topDevelopers,
      recentProjects,
      priceRange: { under500k, under1m, under2m, over2m }
    };
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
              <p className="text-gray-600 mt-1">Analytics and insights for your property portfolio</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/projects')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                <span>View All Projects</span>
              </button>
              <button
                onClick={() => router.push('/projects/new')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FontAwesomeIcon icon={faBuilding} className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FontAwesomeIcon icon={faDollarSign} className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <FontAwesomeIcon icon={faChartLine} className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averagePrice)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <FontAwesomeIcon icon={faHome} className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Property Types</p>
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.propertyTypes).length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Property Types Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.propertyTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / stats.totalProjects) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count} ({formatPercentage(count, stats.totalProjects)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Under $500K</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.priceRange.under500k / stats.totalProjects) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stats.priceRange.under500k}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">$500K - $1M</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(stats.priceRange.under1m / stats.totalProjects) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stats.priceRange.under1m}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">$1M - $2M</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${(stats.priceRange.under2m / stats.totalProjects) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stats.priceRange.under2m}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Over $2M</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(stats.priceRange.over2m / stats.totalProjects) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stats.priceRange.over2m}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Developers and Recent Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Developers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Developers</h3>
                <div className="space-y-3">
                  {Object.entries(stats.topDevelopers).map(([developer, count], index) => (
                    <div key={developer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{developer}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} projects</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                  <button
                    onClick={() => router.push('/projects')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {stats.recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{project.project_name}</p>
                          <p className="text-sm text-gray-600">{project.property_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{project.price}</p>
                        <p className="text-sm text-gray-600">{project.developer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/projects/new')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faPlus} className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="font-medium text-gray-900">Add New Project</p>
                    <p className="text-sm text-gray-600">Create a new property listing</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faEye} className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="font-medium text-gray-900">View All Projects</p>
                    <p className="text-sm text-gray-600">Browse your property portfolio</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/projects')}
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faEdit} className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="font-medium text-gray-900">Manage Projects</p>
                    <p className="text-sm text-gray-600">Edit or delete existing projects</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
