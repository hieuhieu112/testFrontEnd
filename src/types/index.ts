export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  user: User;
  totalAmount: number;
  status: string;
  createdAt?: string;
}

export interface OrderDetail {
  id: number;
  order: Order;
  product: Product;
  quantity: number;
  price: number;
}
