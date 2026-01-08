"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faChevronLeft, faChevronRight, faPlus } from "@fortawesome/free-solid-svg-icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ConfirmDialog from "@/components/ConfirmDialog";

interface PropTech {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category: string;
  subCategory?: string;
  url?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function PropTechPage() {
  const router = useRouter();
  const [propTech, setPropTech] = useState<PropTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  // UI state (align with New Launch Collection)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("All");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>(["All"]);
  const [allSubCategories, setAllSubCategories] = useState<string[]>(["All"]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPropTech = async (page: number = currentPage, search: string = searchQuery, category: string = categoryFilter, subCategory: string = subCategoryFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      if (category && category !== 'All') {
        params.append('category', category);
      }
      
      if (subCategory && subCategory !== 'All') {
        params.append('subCategory', subCategory);
      }
      
      const response = await fetch(`/api/tool-resources?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tool resources');
      }
      const data = await response.json();
      
      setPropTech(data.toolResources);
      setPaginationMeta({
        page: data.pagination.page,
        pageSize: data.pagination.limit,
        pageCount: data.pagination.pages,
        total: data.pagination.total
      });
      
      // Update categories from API response
      if (data.categories) {
        setAllCategories(['All', ...data.categories]);
      }
      
      // Update sub-categories from API response (based on selected category)
      if (data.subCategories) {
        setAllSubCategories(['All', ...data.subCategories]);
      } else {
        setAllSubCategories(['All']);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch tool resources');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }
    
    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPropTech(1, "", "All", "All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when category changes - reset subCategory filter
  useEffect(() => {
    setSubCategoryFilter("All");
    setCurrentPage(1);
    fetchPropTech(1, debouncedSearchQuery, categoryFilter, "All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  // Fetch when filters change (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchPropTech(1, debouncedSearchQuery, categoryFilter, subCategoryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, subCategoryFilter]);

  // Fetch when page changes (but not on initial mount)
  useEffect(() => {
    const isInitialMount = currentPage === 1 && !paginationMeta;
    if (!isInitialMount && currentPage > 0) {
      fetchPropTech(currentPage, debouncedSearchQuery, categoryFilter, subCategoryFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Calculate pagination using server-side metadata
  const totalPages = paginationMeta?.pageCount || 1;
  const totalItems = paginationMeta?.total || 0;
  const indexOfFirstItem = ((currentPage - 1) * itemsPerPage) + 1;
  const indexOfFirstItemDisplay = totalItems > 0 ? indexOfFirstItem : 0;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Use propTech directly since filtering is done server-side
  const filtered = propTech;

  // Handle search change (debouncing is handled by useEffect)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSubCategoryFilter("All"); // Reset sub-category when category changes
  };

  const handleSubCategoryChange = (value: string) => {
    setSubCategoryFilter(value);
  };

  const handleEdit = (propTechItem: PropTech) => {
    router.push(`/prop-tech/${propTechItem.id}/edit`);
  };

  const handleDelete = (id: number) => {
    const item = propTech.find(p => p.id === id);
    if (item) {
      setItemToDelete({ id, name: item.name });
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    
    try {
      const response = await fetch(`/api/tool-resources/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tool resource');
      }
      
      toast.success('Prop Tech item deleted successfully');
      
      // If we're on the last page and it becomes empty, go to previous page
      if (propTech.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchPropTech(newPage, debouncedSearchQuery, categoryFilter, subCategoryFilter);
      } else {
        fetchPropTech(currentPage, debouncedSearchQuery, categoryFilter, subCategoryFilter);
      }
    } catch (err) {
      toast.error('Failed to delete tool resource');
      console.error('Error deleting tool resource:', err);
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleAddPropTech = () => {
    router.push("/prop-tech/new");
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchPropTech(pageNumber, debouncedSearchQuery, categoryFilter, subCategoryFilter);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchPropTech(newPage, debouncedSearchQuery, categoryFilter, subCategoryFilter);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchPropTech(newPage, debouncedSearchQuery, categoryFilter, subCategoryFilter);
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Prop Tech</h1>
          <button
            onClick={handleAddPropTech}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Add Prop Tech"
            title="Add Prop Tech"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span className="text-sm font-medium">New Prop Tech</span>
          </button>
        </div>
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

      {showFilters && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Search by name, description, category..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => handleCategoryChange(e.target.value)}
              className="border rounded px-3 py-2"
              title="Category"
            >
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={subCategoryFilter}
              onChange={e => handleSubCategoryChange(e.target.value)}
              className="border rounded px-3 py-2"
              title="Sub-Category"
              disabled={categoryFilter === "All"}
            >
              {allSubCategories.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && viewMode === "list" && (
        <>
          <table className="min-w-full border bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Icon/Logo</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Sub-Category</th>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
                {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No Prop Tech items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-2">
                      {item.icon ? (
                        <img 
                          src={item.icon} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded border border-gray-200" 
                        />
                      ) : (
                        <ImagePlaceholder size="md" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {item.subCategory ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.subCategory}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Website
                        </a>
                      ) : (
                        <span className="text-gray-400">No URL</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                {totalItems > 0 ? (
                  <>Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} Prop Tech items</>
                ) : (
                  <>No Prop Tech items found</>
                )}
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

      {/* Grid view */}
      {!loading && !error && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">No Prop Tech items found.</div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="group relative bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
                <div className="h-40 w-full overflow-hidden flex items-center justify-center bg-gray-50">
                  {item.icon ? (
                    <img src={item.icon} alt={item.name} className="h-20 w-20 object-contain" />
                  ) : (
                    <ImagePlaceholder size="lg" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">{item.name}</h3>
                      <div className="text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                          {item.category}
                        </span>
                        {item.subCategory && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {item.subCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{truncateText(item.description, 80)}</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                  <div className="bg-white/95 backdrop-blur border rounded-md shadow-lg px-4 py-3 text-xs w-[85%] max-w-sm">
                    <div className="text-center font-semibold text-gray-900 truncate">{item.name}</div>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Prop Tech Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
}
