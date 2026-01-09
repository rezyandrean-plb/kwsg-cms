"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendarAlt,
  faEye,
  faCog,
  faArrowRight,
  faPlus,
  faWandSparkles,
  faEnvelope,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";

interface NewLaunch {
  id: number;
  title: string;
  summary?: string;
  image?: string;
  location: string;
  district: string;
  status: string;
  visibility?: string;
  type?: string;
  bedrooms?: string;
  price?: string;
  url?: string;
  launchDate?: string;
  developer?: string;
  units?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Newsletter {
  id: number;
  date: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [newLaunches, setNewLaunches] = useState<NewLaunch[]>([]);
  const [launchesLoading, setLaunchesLoading] = useState(true);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [newslettersLoading, setNewslettersLoading] = useState(true);

  const fetchNewLaunches = async () => {
    try {
      const response = await fetch("/api/new-launch-collection?page=1&limit=3", { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch new launches");
      const data = await response.json();
      setNewLaunches(data.launches || []);
      setLaunchesLoading(false);
    } catch (err: any) {
      console.error("Error fetching new launches:", err);
      setLaunchesLoading(false);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const response = await fetch("/api/newsletters?page=1&limit=3", { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch newsletters");
      const data = await response.json();
      setNewsletters(data.newsletters || []);
      setNewslettersLoading(false);
    } catch (err: any) {
      console.error("Error fetching newsletters:", err);
      setNewslettersLoading(false);
    }
  };

  useEffect(() => {
    fetchNewLaunches();
    fetchNewsletters();
  }, []);

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('coming') || lowerStatus.includes('preview')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (lowerStatus.includes('ongoing')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (lowerStatus.includes('completed')) {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your content and collections
            </p>
          </div>
          <button
            onClick={() => router.push('/new-launch-collection/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            <span>New Launch</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Launches</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {newLaunches.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <FontAwesomeIcon icon={faWandSparkles} className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Launches</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {newLaunches.filter(l => l.active !== false).length}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <FontAwesomeIcon icon={faEye} className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Newsletters</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {newsletters.length}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Newsletters</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {newsletters.filter(n => n.active).length}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <FontAwesomeIcon icon={faFilePdf} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* New Launch Collection Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">New Launch Collection</h2>
            <p className="mt-1 text-sm text-gray-500">
              Recent property launches and updates
            </p>
          </div>
          <button
            onClick={() => router.push('/new-launch-collection')}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>View All</span>
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </button>
        </div>

        {launchesLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
            <div className="flex items-center justify-center">
              <LoadingSpinner message="Loading new launches..." />
            </div>
          </div>
        ) : newLaunches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newLaunches.map((launch) => (
              <div
                key={launch.id}
                onClick={() => router.push(`/new-launch-collection/${launch.id}/edit`)}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md cursor-pointer"
              >
                {/* Image Section */}
                {launch.image ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={launch.image}
                      alt={launch.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}

                {/* Content Section */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="mb-1 text-base font-semibold text-gray-900 line-clamp-1">
                      {launch.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="line-clamp-1">{launch.location}</span>
                      {launch.district && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="line-clamp-1">{launch.district}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status and Price */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {launch.status && (
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(launch.status)}`}>
                        {launch.status}
                      </span>
                    )}
                    {launch.price && (
                      <span className="text-xs font-semibold text-gray-700">
                        {launch.price}
                      </span>
                    )}
                  </div>

                  {/* Launch Date */}
                  {launch.launchDate && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FontAwesomeIcon icon={faCalendarAlt} className="h-3 w-3" />
                      <span>{launch.launchDate}</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-xl bg-blue-600/0 transition-colors group-hover:bg-blue-600/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faWandSparkles} className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">No new launches available</p>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first launch
              </p>
              <button
                onClick={() => router.push('/new-launch-collection/new')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                <span>Create Launch</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Newsletters Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Newsletters</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest newsletter PDFs and updates
            </p>
          </div>
          <button
            onClick={() => router.push('/newsletters')}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span>View All</span>
            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </button>
        </div>

        {newslettersLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
            <div className="flex items-center justify-center">
              <LoadingSpinner message="Loading newsletters..." />
            </div>
          </div>
        ) : newsletters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newsletters.slice(0, 3).map((newsletter) => (
              <div
                key={newsletter.id}
                onClick={() => window.open(newsletter.url, '_blank')}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-red-300 hover:shadow-md cursor-pointer"
              >
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-lg bg-red-50 p-2">
                          <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-red-600" />
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          newsletter.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {newsletter.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Newsletter
                      </h3>
                      <p className="text-sm font-medium text-gray-600">
                        {newsletter.date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 group-hover:text-blue-700">
                    <span className="font-medium">View PDF</span>
                    <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-xl bg-red-600/0 transition-colors group-hover:bg-red-600/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">No newsletters available</p>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first newsletter
              </p>
              <button
                onClick={() => router.push('/newsletters/new')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                <span>Create Newsletter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PropTech CTA Section */}
      <div 
        onClick={() => router.push('/prop-tech')}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-xl transition-all hover:shadow-2xl cursor-pointer"
      >
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
              <FontAwesomeIcon icon={faCog} className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-bold text-white">
                PropTech Tools
              </h2>
              <p className="max-w-md text-blue-100">
                Access powerful property technology calculators and tools to enhance your real estate operations
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
            <span>Explore PropTech</span>
            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
    </div>
  );
}
