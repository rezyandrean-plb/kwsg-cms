'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaTimes, FaSave } from 'react-icons/fa';
import RichTextEditor from './RichTextEditor';
import PressImageUpload from './PressImageUpload';
import { uploadFileToS3 } from '@/lib/uploadUtils';

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

interface PressArticleFormData {
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

interface PressArticleFormProps {
  article?: PressArticle | null;
  onSave: (article: PressArticleFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function PressArticleForm({ article, onSave, onCancel, isOpen }: PressArticleFormProps) {
  const [formData, setFormData] = useState<PressArticleFormData>({
    title: '',
    description: '',
    image_url: '',
    link: '',
    date: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear().toString(),
    source: '',
    slug: '',
    article_content: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (article) {
      console.log('=== EDITING ARTICLE ===');
      console.log('Article data received:', article);
      console.log('Article content:', article.article_content);
      
      const formDataToSet = {
        title: article.title || '',
        description: article.description || '',
        image_url: article.image_url || '',
        link: article.link || '',
        date: article.date || new Date().toISOString().split('T')[0],
        year: article.year || new Date().getFullYear().toString(),
        source: article.source || '',
        slug: article.slug || '',
        article_content: article.article_content || ''
      };
      console.log('Form data being set:', formDataToSet);
      setFormData(formDataToSet);
    } else {
      console.log('=== CREATING NEW ARTICLE ===');
      const defaultFormData = {
        title: '',
        description: '',
        image_url: '',
        link: '',
        date: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear().toString(),
        source: '',
        slug: '',
        article_content: ''
      };
      setFormData(defaultFormData);
      setSelectedImageFile(null);
    }
    setErrors({});
  }, [article]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.link.trim()) {
      newErrors.link = 'Link is required';
    }
    if (!formData.image_url.trim() && !selectedImageFile) {
      newErrors.image_url = 'Article image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission - formData:', formData);
    console.log('Form submission - title value:', formData.title);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.image_url;

      // If there's a selected file, upload it first
      if (selectedImageFile) {
        console.log('Uploading selected image file...');
        const result = await uploadFileToS3(selectedImageFile, 'images');
        
        if (result.success && result.url) {
          finalImageUrl = result.url;
          console.log('Image uploaded successfully:', finalImageUrl);
        } else {
          throw new Error(result.error || 'Failed to upload image');
        }
      }

      // Create the final form data with the uploaded image URL
      const finalFormData = {
        ...formData,
        image_url: finalImageUrl
      };

      console.log('Calling onSave with final formData:', finalFormData);
      await onSave(finalFormData);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PressArticleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageFileSelect = (file: File | null) => {
    setSelectedImageFile(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {article ? 'Edit Press Article' : 'Create New Press Article'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <FaTimes className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter article title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter article description"
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source *</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  placeholder="e.g., The Straits Times"
                  className={errors.source ? 'border-red-500' : ''}
                />
                {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="link">Article Link *</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://example.com/article"
                className={errors.link ? 'border-red-500' : ''}
              />
              {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
            </div>

            <div>
              <PressImageUpload
                currentImageUrl={formData.image_url}
                onImageChange={(imageUrl) => handleInputChange('image_url', imageUrl)}
                onRemoveImage={() => handleInputChange('image_url', '')}
                onFileSelect={handleImageFileSelect}
                label="Press Article Image"
              />
              {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="article-slug"
              />
            </div>

            <div>
              <Label htmlFor="article_content">Article Content</Label>
              <p className="text-sm text-gray-500 mb-2">
                Note: Images are not supported in the article content. Use the article image field above for the main image.
              </p>
              <RichTextEditor
                value={formData.article_content}
                onChange={(value) => handleInputChange('article_content', value)}
                placeholder="Enter the full article content..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FaSave className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : (article ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 