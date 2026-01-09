"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faChevronLeft, faChevronRight, faPlus, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Newsletter {
  id: number;
  date: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function NewslettersPage() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; date: string } | null>(null);

  const fetchNewsletters = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/newsletters?page=${page}&limit=${itemsPerPage}&_ts=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch newsletters');
      }
      
      const data = await response.json();
      setNewsletters(data.newsletters);
      setPaginationMeta({
        page: data.pagination.page,
        pageSize: data.pagination.limit,
        pageCount: data.pagination.pages,
        total: data.pagination.total
      });
    } catch (err) {
      console.error('Error fetching newsletters:', err);
      setError('Failed to load newsletters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const totalPages = paginationMeta?.pageCount || 1;
  const totalItems = paginationMeta?.total || 0;
  const indexOfFirstItem = ((currentPage - 1) * itemsPerPage) + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleEdit = (newsletter: Newsletter) => {
    router.push(`/newsletters/${newsletter.id}/edit`);
  };

  const handleDelete = (id: number) => {
    const item = newsletters.find(n => n.id === id);
    if (item) {
      setItemToDelete({ id, date: item.date });
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/newsletters/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete newsletter');
      }
      
      toast.success(`Newsletter "${itemToDelete.date}" deleted successfully`);
      
      setShowDeleteDialog(false);
      setItemToDelete(null);
      
      fetchNewsletters(currentPage);
      if (newsletters.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        fetchNewsletters(newPage);
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast.error('Failed to delete newsletter');
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleAddNewsletter = () => {
    router.push("/newsletters/new");
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchNewsletters(pageNumber);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchNewsletters(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchNewsletters(newPage);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your newsletter PDFs and date ranges</p>
        </div>
        <button 
          onClick={handleAddNewsletter}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-all"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          <span>Add Newsletter</span>
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading newsletters...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {newsletters.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <FontAwesomeIcon icon={faFilePdf} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No newsletters found</p>
              <p className="text-sm text-gray-500 mb-4">Get started by adding your first newsletter</p>
              <button
                onClick={handleAddNewsletter}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                <span>Add Newsletter</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PDF URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{newsletter.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4 text-red-600" />
                          <a
                            href={newsletter.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate max-w-md"
                          >
                            {newsletter.url}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          newsletter.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {newsletter.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(newsletter.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(newsletter)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(newsletter.id)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} newsletters
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i < 5 ? i + 1 : totalPages;
                    if (i === 5) return <span key="ellipsis" className="px-2">...</span>;
                    if (i === 6) return null;
                  } else if (currentPage >= totalPages - 3) {
                    if (i === 0) return (
                      <>
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                        <span key="ellipsis" className="px-2">...</span>
                      </>
                    );
                    pageNum = totalPages - 6 + i;
                  } else {
                    if (i === 0) return (
                      <>
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          1
                        </button>
                        <span key="ellipsis1" className="px-2">...</span>
                      </>
                    );
                    if (i === 6) return (
                      <>
                        <span key="ellipsis2" className="px-2">...</span>
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 border rounded hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    );
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 border rounded transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }).filter(Boolean)}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Newsletter"
        message={`Are you sure you want to delete the newsletter "${itemToDelete?.date}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
}
