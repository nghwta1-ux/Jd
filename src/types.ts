export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SystemInfo {
  platform: string;
  database: {
    type: string;
    location: string;
    status: string;
    productsCount: number;
    ordersCount: number;
    externalCost: number;
    notes: string;
  };
}
