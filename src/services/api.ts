import { Product, Order, OrderStatus, SystemInfo } from '../types';

export const api = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('فشل جلب المنتجات');
    const data = await res.json();
    return data.products || [];
  },

  async createProduct(payload: { name: string; description: string; price: number }): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل حفظ المنتج');
    }
    return data.product;
  },

  async updateProduct(id: string, payload: { name?: string; description?: string; price?: number }): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل تحديث المنتج');
    }
    return data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل حذف المنتج');
    }
  },

  async seedSamples(): Promise<Product[]> {
    const res = await fetch('/api/products/seed-samples', {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل إضافة الخدمات النموذجية');
    }
    return data.products || [];
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('فشل جلب الطلبات');
    const data = await res.json();
    return data.orders || [];
  },

  async createOrder(payload: {
    customerName: string;
    phone: string;
    email?: string;
    notes?: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل إرسال الطلب');
    }
    return data.order;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل تحديث حالة الطلب');
    }
    return data.order;
  },

  async deleteOrder(id: string): Promise<void> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل حذف الطلب');
    }
  },

  async getSystemInfo(): Promise<SystemInfo> {
    const res = await fetch('/api/system/info');
    if (!res.ok) throw new Error('فشل جلب معلومات النظام');
    return await res.json();
  }
};
