export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  timestamp: number;
  ratingTotal: number; 
  ratingCount: number; 
  ratedBy: Record<string, number>; // Map of UserUUID -> Star Value (1-5)
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  customerName: string;
  phone: string;
  address: string;
  status: 'pending' | 'completed';
  timestamp: number;
}

export interface NewProductForm {
  name: string;
  price: string;
  description: string;
  image: File | null;
}