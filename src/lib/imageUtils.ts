export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  is_primary?: boolean;
  caption?: string;
}

export const extractImageUrls = (images?: ProjectImage[]): string[] => {
  if (!images || !Array.isArray(images)) return [];
  return images.map(img => img.image_url);
};

export const getPrimaryImage = (images?: ProjectImage[]): string | null => {
  if (!images || !Array.isArray(images)) return null;
  const primary = images.find(img => img.is_primary);
  return primary ? primary.image_url : images[0]?.image_url || null;
};

export const getImageById = (images: ProjectImage[], imageUrl: string): ProjectImage | undefined => {
  return images.find(img => img.image_url === imageUrl);
}; 