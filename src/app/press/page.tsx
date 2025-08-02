'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaEdit, FaTrash, FaCalendar, FaNewspaper, FaPlus } from 'react-icons/fa';
import PressArticleForm from '@/components/PressArticleForm';

interface PressArticle {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link: string;
  date: string;
  year: string;
  source: string;
  slug: string;
  article_content: string;
}

export default function PressPage() {
  const [articles, setArticles] = useState<PressArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<PressArticle | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE_URL = 'https://striking-hug-052e89dfad.strapiapp.com/api';

  const fetchPressArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/press-articles/`);
      if (!response.ok) {
        throw new Error('Failed to fetch press articles');
      }
      const data = await response.json();
      
      // Map API response to match frontend interface
      const mappedArticles = (data.data || []).map((article: any) => ({
        id: article.id,
        title: article.title || '',
        description: article.description || '',
        image_url: article.imageUrl || '', // Map imageUrl to image_url
        link: article.link || '',
        date: article.date || '',
        year: article.year || '',
        source: article.source || '',
        slug: article.slug || '',
        article_content: article.articleContent || '' // Map articleContent to article_content
      }));
      
      console.log('Fetched articles:', mappedArticles);
      setArticles(mappedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPressArticles();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Ensure consistent timezone handling
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleCreate = () => {
    console.log('=== CREATE BUTTON CLICKED ===');
    console.log('Setting editingArticle to null');
    console.log('Opening form');
    setEditingArticle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: number) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      setEditingArticle(article);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/press-articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      // Remove the article from the local state
      setArticles(prev => prev.filter(article => article.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async (articleData: {
    title: string;
    description: string;
    image_url: string;
    link: string;
    date: string;
    year: string;
    source: string;
    slug: string;
    article_content: string;
  }) => {
    setActionLoading(true);
    try {
      const isEditing = !!editingArticle;
      
      const url = isEditing 
        ? `${API_BASE_URL}/press-articles/${editingArticle!.id}`
        : `${API_BASE_URL}/press-articles/`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Use the correct field names that the API expects
      const requestBody = {
        title: articleData.title?.trim() || '',
        description: articleData.description?.trim() || '',
        imageUrl: articleData.image_url?.trim() || '',
        link: articleData.link?.trim() || '',
        date: articleData.date || '',
        year: new Date(articleData.date).getFullYear().toString(),
        source: articleData.source?.trim() || '',
        slug: articleData.slug?.trim() || '',
        articleContent: articleData.article_content || ''
      };

      // Validate required fields before sending
      if (!requestBody.title) {
        throw new Error('Title is required');
      }
      if (!requestBody.description) {
        throw new Error('Description is required');
      }
      if (!requestBody.imageUrl) {
        throw new Error('Image URL is required');
      }
      if (!requestBody.link) {
        throw new Error('Link is required');
      }
      if (!requestBody.date) {
        throw new Error('Date is required');
      }
      if (!requestBody.source) {
        throw new Error('Source is required');
      }
      
      console.log('=== API REQUEST DEBUG ===');
      console.log('Sending request to:', url);
      console.log('Request method:', method);
      console.log('Is editing:', isEditing);
      console.log('Article data received:', articleData);
      console.log('Request body:', requestBody);
      console.log('JSON string being sent:', JSON.stringify(requestBody, null, 2));
      console.log('========================');
      
      // Try with the 'data' wrapper (Strapi typically expects this structure)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        console.error('Full error details:', JSON.stringify(errorData, null, 2));
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} article: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      if (isEditing) {
        // Update the article in the local state
        const updatedArticle = {
          ...editingArticle!,
          ...articleData,
          year: new Date(articleData.date).getFullYear().toString(),
        };
        
        setArticles(prev => prev.map(article => 
          article.id === editingArticle!.id ? updatedArticle : article
        ));
      } else {
        // Add the new article to the local state
        // Map the API response to match our interface
        const newArticle = {
          id: result.data.id,
          title: result.data.title || '',
          description: result.data.description || '',
          image_url: result.data.imageUrl || '', // Map imageUrl to image_url
          link: result.data.link || '',
          date: result.data.date || '',
          year: result.data.year || new Date(articleData.date).getFullYear().toString(),
          source: result.data.source || '',
          slug: result.data.slug || '',
          article_content: result.data.articleContent || '' // Map articleContent to article_content
        };
        setArticles(prev => [...prev, newArticle]);
      }

      setIsFormOpen(false);
      setEditingArticle(null);
    } catch (err) {
      console.error('Error saving article:', err);
      alert(`Failed to ${editingArticle ? 'update' : 'create'} article. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingArticle(null);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading press articles: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Press & Media</h1>
          <p className="text-gray-600">Latest news and media coverage about KW Singapore</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-orange-600 hover:bg-orange-700"
          disabled={actionLoading}
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Add Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaNewspaper className="text-orange-600" />
            Press Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaNewspaper className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No press articles available at the moment.</p>
              <Button
                onClick={handleCreate}
                className="mt-4 bg-orange-600 hover:bg-orange-700"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Your First Article
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <h3 className="font-medium text-gray-900 truncate max-w-xs" title={article.title}>
                          {article.title}
                        </h3>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.source}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FaCalendar className="text-gray-400" />
                          {formatDate(article.date)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(article.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PressArticleForm
        article={editingArticle}
        onSave={handleSave}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
} 