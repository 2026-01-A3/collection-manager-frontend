import { Category } from './category.model';

export interface Collection {
  id: number;
  name: string;
  category_id: number;
  category: Category;
  image_url: string;
}

export interface CreateCollectionRequest {
  name: string;
  category_id: number;
  image_url: string;
}

export interface UpdateCollectionRequest {
  name: string;
  category_id: number;
  image_url: string;
}
