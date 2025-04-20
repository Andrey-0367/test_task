export interface ProductBase {
  title: string;
  price: string | number; 
  description: string;
  category: string;
  image: string;
  rating?: { 
    rate: number;
    count: number;
  };
  updatedAt?: string;
  _isLocal?: boolean;
}

export interface Product extends ProductBase {
  id: number;
}

export interface ProductFormData {
  title: string;
  price: string | number; 
  description: string;
  category: string;
  image: string; 
}
