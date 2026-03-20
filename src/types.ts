export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
}

export interface Category {
  name: string;
  subcategories: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
