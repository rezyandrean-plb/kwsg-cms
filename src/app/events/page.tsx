"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";

interface Event {
  id: number;
  title: string;
  description: string;
  images?: string[];
  url?: string;
  category: string;
  date_time: string;
  created_at?: string;
  updated_at?: string;
}

// Mock data for events
const mockEvents: Event[] = [
  {
    id: 1,
    title: "MREA Masterclass 2025",
    description: "A 2-day intensive masterclass diving into the millionaire models, strategies, and systems for exponential growth.",
    images: [
      "/images/event/mrea-summit-stage.webp",
      "/images/event/mrea-pricing-new.webp",
      "/images/event/mega-summit.webp",
      "/images/event/melvin-explore.webp",
    ],
    url: "https://mrea-masterclass-2025.eventbrite.com",
    category: "Masterclass",
    date_time: "2025-08-15T09:00:00",
    created_at: "2024-12-01T10:00:00",
    updated_at: "2024-12-01T10:00:00"
  },
  {
    id: 2,
    title: "Explore Night Webinar",
    description: "An interactive online session for agents to discover multiple income streams and scalable models.",
    images: [
      "/images/event/melvin-explore.webp",
      "/images/event/mega-summit.webp",
      "/images/event/mrea-pricing-new.webp",
    ],
    url: "https://explore-night-webinar.zoom.us",
    category: "Webinar",
    date_time: "2025-07-20T19:00:00",
    created_at: "2024-11-15T14:30:00",
    updated_at: "2024-11-15T14:30:00"
  },
  {
    id: 3,
    title: "Seller Presentation Mastery",
    description: "Hands-on bootcamp to craft compelling listing presentations and win mandates consistently.",
    images: [
      "/images/event/mrea-pricing-new.webp",
      "/images/event/mrea-summit-stage.webp",
      "/images/event/mega-summit.webp",
    ],
    url: "https://seller-presentation-mastery.eventbrite.com",
    category: "Workshop",
    date_time: "2025-06-10T10:00:00",
    created_at: "2024-10-20T09:15:00",
    updated_at: "2024-10-20T09:15:00"
  },
  {
    id: 4,
    title: "High-Conversion Buyer Consultations",
    description: "Frameworks and flows to convert leads into loyal clients across six distinct buyer profiles.",
    images: [
      "/images/event/mega-summit.webp",
      "/images/event/mrea-summit-stage.webp",
      "/images/event/melvin-explore.webp",
    ],
    url: "https://buyer-consultations-workshop.eventbrite.com",
    category: "Training",
    date_time: "2025-05-25T14:00:00",
    created_at: "2024-09-30T16:45:00",
    updated_at: "2024-09-30T16:45:00"
  },
  {
    id: 5,
    title: "New Launch Analysis Workshop",
    description: "Mastering site and floor plan analysis, pricing strategies, and data-driven closing for new launches.",
    images: [
      "/images/event/mrea-summit-stage.webp",
      "/images/event/mega-summit.webp",
      "/images/event/mrea-pricing-new.webp",
    ],
    url: "https://new-launch-analysis.eventbrite.com",
    category: "Workshop",
    date_time: "2025-04-18T09:30:00",
    created_at: "2024-08-15T11:20:00",
    updated_at: "2024-08-15T11:20:00"
  }
];

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchEvents = (page: number = currentPage) => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      // Combine mock events with any events stored in localStorage
      const storedEvents = JSON.parse(localStorage.getItem('mockEvents') || '[]');
      const allEvents = [...mockEvents, ...storedEvents];
      
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedEvents = allEvents.slice(startIndex, endIndex);
      
      setEvents(paginatedEvents);
      setPaginationMeta({
        page: page,
        pageSize: itemsPerPage,
        pageCount: Math.ceil(allEvents.length / itemsPerPage),
        total: allEvents.length
      });
      setLoading(false);
    }, 500); // Simulate network delay
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Calculate pagination using server-side metadata
  const totalPages = paginationMeta?.pageCount || 1;
  const totalItems = paginationMeta?.total || 0;
  const indexOfFirstItem = ((currentPage - 1) * itemsPerPage) + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  const currentEvents = events; // Events are already filtered by server

  const handleEdit = (event: Event) => {
    router.push(`/events/${event.id}/edit`);
  };

  const handleDelete = (id: number) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this event?")) {
      // Check if it's a mock event (can't delete) or stored event
      const mockEventIndex = mockEvents.findIndex(event => event.id === id);
      const storedEvents = JSON.parse(localStorage.getItem('mockEvents') || '[]');
      const storedEventIndex = storedEvents.findIndex((event: Event) => event.id === id);
      
      if (mockEventIndex !== -1) {
        toast.error('Cannot delete mock events');
        return;
      }
      
      if (storedEventIndex !== -1) {
        storedEvents.splice(storedEventIndex, 1);
        localStorage.setItem('mockEvents', JSON.stringify(storedEvents));
        toast.success('Event deleted successfully');
        // Refresh the current page
        fetchEvents(currentPage);
        // If current page becomes empty and it's not the first page, go to previous page
        if (events.length === 1 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          fetchEvents(newPage);
        }
      } else {
        toast.error('Event not found');
      }
    }
  };

  const handleAddEvent = () => {
    router.push("/events/new");
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchEvents(pageNumber);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchEvents(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchEvents(newPage);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTime;
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <button 
          onClick={handleAddEvent}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Event</span>
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          <table className="min-w-full border bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Images</th>
                <th className="px-4 py-2 text-left">Event Title</th>
                <th className="px-4 py-2 text-left">Event Description</th>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Date & Time</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                currentEvents.map((event) => (
                  <tr key={event.id} className="border-t">
                    <td className="px-4 py-2">
                      {event.images && event.images.length > 0 ? (
                        <img 
                          src={event.images[0]} 
                          alt={event.title} 
                          className="w-16 h-16 object-cover rounded border border-gray-200" 
                        />
                      ) : (
                        <ImagePlaceholder size="md" />
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{event.title}</td>
                    <td className="px-4 py-2 text-gray-600" title={event.description}>
                      {truncateText(event.description)}
                    </td>
                    <td className="px-4 py-2">
                      {event.url ? (
                        <a 
                          href={event.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Event
                        </a>
                      ) : (
                        <span className="text-gray-400">No URL</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {formatDateTime(event.date_time)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
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
                Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} events
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
    </div>
  );
}
