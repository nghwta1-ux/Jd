import { Product, Order, OrderStatus, SystemInfo } from '../types';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    throw new Error('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.');
  }

  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON response (e.g. HTML 502/warmup from proxy or server restart)
      if (!res.ok) {
        throw new Error(`تعذر معالجة الطلب حالياً (رمز الاستجابة: ${res.status}). يرجى إعادة المحاولة.`);
      }
      throw new Error('استجابة غير متوقعة من الخادم.');
    }
  }

  if (!res.ok || (data && data.success === false)) {
    const errorMsg = (data && data.error) || `فشل الطلب (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  async getProducts(): Promise<Product[]> {
    const data = await safeFetchJson<{ success: boolean; products: Product[] }>('/api/products');
    return data.products || [];
  },

  async createProduct(payload: { name: string; description: string; price: number; category?: string }): Promise<Product> {
    const data = await safeFetchJson<{ success: boolean; product: Product }>('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return data.product;
  },

  async updateProduct(id: string, payload: { name?: string; description?: string; price?: number; category?: string }): Promise<Product> {
    const data = await safeFetchJson<{ success: boolean; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    await safeFetchJson<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  async seedSamples(): Promise<Product[]> {
    const data = await safeFetchJson<{ success: boolean; products: Product[] }>('/api/products/seed-samples', {
      method: 'POST'
    });
    return data.products || [];
  },

  async getOrders(): Promise<Order[]> {
    const data = await safeFetchJson<{ success: boolean; orders: Order[] }>('/api/orders');
    return data.orders || [];
  },

  async createOrder(payload: {
    customerName: string;
    phone: string;
    email?: string;
    notes?: string;
    items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  }): Promise<Order> {
    const data = await safeFetchJson<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return data.order;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const data = await safeFetchJson<{ success: boolean; order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return data.order;
  },

  async deleteOrder(id: string): Promise<void> {
    await safeFetchJson<{ success: boolean }>(`/api/orders/${id}`, {
      method: 'DELETE'
    });
  },

  async getSystemInfo(): Promise<SystemInfo> {
    return await safeFetchJson<SystemInfo>('/api/system/info');
  }
};
