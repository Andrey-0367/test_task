export interface ProductBase {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { 
    rate: number;
    count: number;
  };
}

export interface Product extends ProductBase {
  id: number;
}

export interface ProductFormData {
  title: string;
  price: number; 
  description: string;
  category: string;
  image: string; 
}