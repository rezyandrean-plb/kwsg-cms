"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faChevronLeft, faChevronRight, faPlus, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ConfirmDialog from "@/components/ConfirmDialog";

interface NewLaunch {
  id: number;
  title: string;
  summary: string;
  image: string;
  location: string;
  district: string;
  status: string;
  visibility?: string;
  type: string;
  bedrooms: string;
  price: string;
  url: string;
  launchDate?: string;
  developer?: string;
  units?: number;
  views?: number;
}

// New Launch Collection data
const newLaunches = [
  {
    id: 1,
    title: "Springleaf Residence",
    summary: "The North's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/springleaf-collection.webp",
    location: "Upper Thomson",
    district: "District 26",
    status: "Registration Open",
    type: "Condo",
    bedrooms: "3-5",
    price: "From $2,300,000",
    url: "/springleaf-residence",
  },
  {
    id: 2,
    title: "Penrith",
    summary: "The Margaret Drive Address That Brings You Closer to Everything",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/penrith-collection.webp",
    launchDate: "April 2024",
    location: "Queenstown",
    district: "District 3",
    status: "Preview Available",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,495,000",
    url: "/penrith",
  },
  {
    id: 3,
    title: "Aurea",
    summary: "The Golden Mile's Premier Residential Development",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/hero-aurea.webp",
    launchDate: "May 2024",
    location: "Beach Road",
    district: "District 7",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "2-5",
    price: "From $1,765,000",
    url: "/aurea",
  },
  {
    id: 4,
    title: "W Residences Marina View",
    summary: "Embrace liberated luxury with sleek, chic apartments that offer exclusive 5-star W facilities and services.",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/w-residences-collection.webp",
    launchDate: "June 2024",
    location: "Marina View",
    district: "District 1",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "1-5 BR",
    price: "From $1,848,000",
    url: "",
  },
  {
    id: 5,
    title: "Arina East Residences",
    summary: "The East Coast's First Nature-Integrated, and Well-connected High-Rise",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/arina-east-collection.webp",
    launchDate: "June 2024",
    location: "East Coast",
    district: "District 15",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "1-4",
    price: "From $1,298,000",
    url: "",
  },
  {
    id: 6,
    title: "Artisan 8",
    summary: "TBC",
    image: "https://kwsingapore.s3.ap-southeast-1.amazonaws.com/images/new-launch-collection/coming-soon.webp",
    launchDate: "June 2024",
    location: "Sin Ming Road",
    district: "District 20",
    status: "Coming Soon",
    type: "Condo",
    bedrooms: "TBC",
    price: "TBC",
    url: "",
  },
];

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function NewLaunchCollectionPage() {
  const router = useRouter();
  const [launches, setLaunches] = useState<NewLaunch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [developerFilter, setDeveloperFilter] = useState<string>("All");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Latest Added");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; title: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchLaunches = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/new-launch-collection?page=${page}&limit=${itemsPerPage}&_ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch launches');
      }
      
      const data = await response.json();
      setLaunches(data.launches);
      setPaginationMeta({
        page: data.pagination.page,
        pageSize: data.pagination.limit,
        pageCount: data.pagination.pages,
        total: data.pagination.total
      });
    } catch (err) {
      console.error('Error fetching launches:', err);
      setError('Failed to load new launches');
      // Fallback to mock data if API fails
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedLaunches = newLaunches.slice(startIndex, endIndex);
      
      setLaunches(paginatedLaunches);
      setPaginationMeta({
        page: page,
        pageSize: itemsPerPage,
        pageCount: Math.ceil(newLaunches.length / itemsPerPage),
        total: newLaunches.length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunches();
  }, []);

  // Calculate pagination using server-side metadata
  const totalPages = paginationMeta?.pageCount || 1;
  const totalItems = paginationMeta?.total || 0;
  const indexOfFirstItem = ((currentPage - 1) * itemsPerPage) + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const currentLaunches = launches; // Launches are already filtered by server

  // Derived options for filters
  const allStatuses = ["All", "Registration Open", "Preview Available", "Coming Soon", "Drafts", "Ongoing", "Completed", "Upcoming", "Sold Out"];
  const allDevelopers = ["All", ...Array.from(new Set(launches.map(l => l.developer).filter(Boolean))) as string[]];
  const allDistricts = ["All", ...Array.from(new Set(launches.map(l => l.district).filter(Boolean))) as string[]];

  const parsePriceNumber = (priceStr?: string): number | null => {
    if (!priceStr) return null;
    const match = priceStr.replace(/[,\s]/g, "").match(/\$?(\d+(?:\.\d+)?)/);
    if (!match) return null;
    return Number(match[1]);
  };

  const computeProgressPercent = (status: string): number => {
    const s = status.toLowerCase();
    if (s.includes("registration")) return 10;
    if (s.includes("preview")) return 25;
    if (s.includes("coming")) return 40;
    if (s.includes("ongoing")) return 60;
    if (s.includes("completed") || s.includes("sold")) return 100;
    return 50;
  };

  const getBadges = (item: NewLaunch): string[] => {
    const badges: string[] = [];
    // New if recently added (heuristic: high id)
    if (item.id >= Math.max(0, (paginationMeta?.total || item.id)) - 3) badges.push("New");
    if (item.status.toLowerCase().includes("coming") || item.status.toLowerCase().includes("preview")) badges.push("Launching Soon");
    if (item.status.toLowerCase().includes("sold")) badges.push("Sold Out");
    return badges;
  };

  const filteredAndSorted = currentLaunches
    .filter(item => {
      // Status filter groups
      const status = item.status.toLowerCase();
      const statusOk =
        statusFilter === "All" ||
        (statusFilter === "Ongoing" && (status.includes("ongoing") || status.includes("preview") || status.includes("registration"))) ||
        (statusFilter === "Completed" && status.includes("completed")) ||
        (statusFilter === "Upcoming" && (status.includes("coming") || status.includes("preview"))) ||
        (statusFilter === "Drafts" && status.includes("draft")) ||
        status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const searchOk =
        q.length === 0 ||
        [item.title, item.location, item.district, item.type, item.developer]
          .filter(Boolean)
          .some(v => (v as string).toLowerCase().includes(q));

      const developerOk = developerFilter === "All" || item.developer === developerFilter;
      const districtOk = districtFilter === "All" || item.district === districtFilter;

      const price = parsePriceNumber(item.price) ?? -1;
      const min = priceMin ? Number(priceMin) : -1;
      const max = priceMax ? Number(priceMax) : Number.MAX_SAFE_INTEGER;
      const priceOk = price === -1 ? true : price >= min && price <= max;

      return statusOk && searchOk && developerOk && districtOk && priceOk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Latest Added":
          return b.id - a.id;
        case "Highest Value": {
          const pa = parsePriceNumber(a.price) || 0;
          const pb = parsePriceNumber(b.price) || 0;
          return pb - pa;
        }
        case "Most Viewed":
          return (b.views || 0) - (a.views || 0);
        case "Launch Date": {
          const da = a.launchDate ? Date.parse(a.launchDate) : 0;
          const db = b.launchDate ? Date.parse(b.launchDate) : 0;
          return db - da;
        }
        default:
          return 0;
      }
    });

  const handleEdit = (launch: NewLaunch) => {
    router.push(`/new-launch-collection/${launch.id}/edit`);
  };

  const handleDelete = (id: number) => {
    const item = launches.find(l => l.id === id);
    if (item) {
      setItemToDelete({ id, title: item.title });
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/new-launch-collection/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete new launch');
      }
      
      toast.success(`"${itemToDelete.title}" deleted successfully`);
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setItemToDelete(null);
      
      // Refresh the current page
      fetchLaunches(currentPage);
      // If current page becomes empty and it's not the first page, go to previous page
      if (launches.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchLaunches(newPage);
      }
    } catch (error) {
      console.error('Error deleting new launch:', error);
      toast.error('Failed to delete new launch');
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleAddLaunch = () => {
    router.push("/new-launch-collection/new");
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchLaunches(pageNumber);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchLaunches(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchLaunches(newPage);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'registration open':
        return 'bg-green-100 text-green-800';
      case 'preview available':
        return 'bg-blue-100 text-blue-800';
      case 'coming soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Launch Collection</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`px-3 py-2 border rounded ${showFilters ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}
            title="Toggle filters"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 border rounded ${viewMode === "grid" ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}
            title="Grid view"
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 border rounded ${viewMode === "list" ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}
            title="List view"
          >
            List
          </button>
        </div>
      </div>

      {/* Filters and search */}
      {showFilters && (
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {allStatuses.slice(0, 5).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, type..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Developer */}
          <select
            value={developerFilter}
            onChange={e => setDeveloperFilter(e.target.value)}
            className="border rounded px-3 py-2"
            title="Developer"
          >
            {allDevelopers.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* District */}
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="border rounded px-3 py-2"
            title="District"
          >
            {allDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
              placeholder="Min $"
              className="w-24 border rounded px-3 py-2"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
              placeholder="Max $"
              className="w-24 border rounded px-3 py-2"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
            title="Sort by"
          >
            {[
              "Latest Added",
              "Highest Value",
              "Most Viewed",
              "Launch Date",
            ].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      )}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          {viewMode === "list" ? (
            <table className="min-w-full border bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Visibility</th>
                  <th className="px-4 py-2 text-left">Bedrooms</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-gray-500">
                      No New Launch items found.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((item) => (
                    <tr key={item.id} className="border-t group">
                      <td className="px-4 py-2">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-16 h-16 object-cover rounded border border-gray-200" 
                          />
                        ) : (
                          <ImagePlaceholder size="md" />
                        )}
                      </td>
                      <td className="px-4 py-2 font-medium">{item.title}</td>
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium">{item.location}</div>
                          <div className="text-sm text-gray-500">{item.district}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (item.visibility || 'Show') === 'Show'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {item.visibility || 'Show'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{item.bedrooms}</td>
                      <td className="px-4 py-2 font-medium text-green-600">From ${item.price}</td>
                      <td className="px-4 py-2">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Actions"
                            aria-label="Actions"
                          >
                            <FontAwesomeIcon icon={faEllipsisVertical} className="w-5 h-5" />
                          </button>
                          {openMenuId === item.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleEdit(item);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-blue-600" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDelete(item.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSorted.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12">No New Launch items found.</div>
              ) : (
                filteredAndSorted.map(item => (
                <div key={item.id} className="group relative bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow flex flex-col min-h-[360px]">
                  <div className="h-40 w-full overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <ImagePlaceholder size="lg" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      {getBadges(item).map(b => (
                        <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-white">{b}</span>
                      ))}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-h-[60px]">
                          <h3 className="font-semibold leading-tight">{item.title}</h3>
                          <div className="text-sm text-gray-600 min-h-[22px]">
                            {item.location} • {item.district}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${getStatusColor(item.status)}`}>{item.status}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                            (item.visibility || 'Show') === 'Show'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}>{item.visibility || 'Show'}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-green-700 font-medium">From ${item.price}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-600 min-h-[20px]">
                        <div>Type: {item.type}</div>
                        <div>Units: {item.units ?? 200}</div>
                        <div>BR: {item.bedrooms}</div>
                      </div>
                      {/* Actions moved to hover popover */}
                    </div>

                    {/* Hover centered popover with title and actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                      <div className="bg-white/95 backdrop-blur border rounded-md shadow-lg px-4 py-3 text-xs w-[85%] max-w-sm">
                        <div className="text-center font-semibold text-gray-900 truncate">{item.title}</div>
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 px-3 h-8 rounded-full border text-blue-600 hover:bg-blue-50"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            <span className="text-[12px]">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center gap-1 px-3 h-8 rounded-full border text-red-600 hover:bg-red-50"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            <span className="text-[12px]">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} New Launch items
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                </button>
                
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 7;
                  
                  if (totalPages <= maxVisiblePages) {
                    // Show all pages if total is small
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === i
                              ? "bg-blue-600 text-white border-blue-600"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                  } else {
                    // Show pages with ellipsis for large page counts
                    if (currentPage <= 4) {
                      // Show first 5 pages + ellipsis + last page
                      for (let i = 1; i <= 5; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis1" className="px-2">...</span>);
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    } else if (currentPage >= totalPages - 3) {
                      // Show first page + ellipsis + last 5 pages
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis2" className="px-2">...</span>);
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                    } else {
                      // Show first page + ellipsis + current page and neighbors + ellipsis + last page
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      pages.push(<span key="ellipsis3" className="px-2">...</span>);
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-1 border rounded ${
                              currentPage === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      pages.push(<span key="ellipsis4" className="px-2">...</span>);
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Add Project */}
      <button
        onClick={handleAddLaunch}
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 px-5 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Add Project"
        title="Add Project"
      >
        <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
        <span className="text-sm font-medium">New Project</span>
      </button>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete New Launch Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
}
