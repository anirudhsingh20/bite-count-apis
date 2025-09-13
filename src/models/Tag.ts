export interface Tag {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagRequest {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateTagRequest {
  name?: string;
  description?: string;
  category?: string;
  color?: string;
  isActive?: boolean;
}

export interface TagResponse {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagSearchParams {
  query?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface TagStats {
  totalTags: number;
  activeTags: number;
  inactiveTags: number;
  tagsByCategory: { [category: string]: number };
}
