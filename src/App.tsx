import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Order, CartItem, OrderStatus } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { playNewOrderChime } from './utils/audio';
import { Terminal, Shield, Bell, CheckCircle, Database } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ramz_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ramz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ramz_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Cart local save failed', e);
    }
  }, [cart]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prods, ords] = await Promise.all([
        api.getProducts(),
        api.getOrders()
      ]);
      const uniqueProds = Array.from(new Map(prods.map(p => [p.id, p])).values());
      const uniqueOrds = Array.from(new Map(ords.map(o => [o.id, o])).values());
      setProducts(uniqueProds);
      setOrders(uniqueOrds);
    } catch (err) {
      console.error('Failed to load RAMZ data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time synchronization via SSE (Server-Sent Events) + background polling
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('new_order', (e) => {
        const order: Order = JSON.parse(e.data);
        setOrders(prev => {
          if (prev.some(o => o.id === order.id)) return prev;
          return [order, ...prev];
        });

        if (soundEnabled) {
          playNewOrderChime();
        }

        setToast({
          message: `🔔 طلب جديد وارد: ${order.orderNumber}`,
          sub: `العميل: ${order.customerName} • المبلغ: ${order.total} ر.س`
        });
      });

      eventSource.addEventListener('order_updated', (e) => {
        const updated: Order = JSON.parse(e.data);
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      });

      eventSource.addEventListener('order_deleted', (e) => {
        const { id } = JSON.parse(e.data);
        setOrders(prev => prev.filter(o => o.id !== id));
      });

      eventSource.addEventListener('product_created', (e) => {
        const newProd: Product = JSON.parse(e.data);
        setProducts(prev => {
          if (prev.some(p => p.id === newProd.id)) return prev;
          return [newProd, ...prev];
        });
      });

      eventSource.addEventListener('product_updated', (e) => {
        const updated: Product = JSON.parse(e.data);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      });

      eventSource.addEventListener('product_deleted', (e) => {
        const { id } = JSON.parse(e.data);
        setProducts(prev => prev.filter(p => p.id !== id));
      });

      eventSource.addEventListener('products_reloaded', (e) => {
        const prods: Product[] = JSON.parse(e.data);
        const unique = Array.from(new Map(prods.map(p => [p.id, p])).values());
        setProducts(unique);
      });
    } catch (err) {
      console.warn('SSE connection could not be established, relying on polling', err);
    }

    // Interval polling backup every 5 seconds to guarantee multi-device accuracy
    const pollInterval = setInterval(async () => {
      try {
        const ords = await api.getOrders();
        setOrders(prev => {
          const map = new Map<string, Order>();
          for (const o of ords) map.set(o.id, o);
          for (const o of prev) {
            if (!map.has(o.id)) map.set(o.id, o);
          }
          return Array.from(map.values());
        });
      } catch {
        // silent fallback
      }
    }, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [soundEnabled]);

  // Admin access control with PIN 12345
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('ramz_admin_auth', 'true');
    } catch (e) {
      console.warn('Session storage write error', e);
    }
    setIsAdminLoginOpen(false);
    setCurrentView('admin');
    setToast({
      message: 'تم الدخول إلى لوحة الإدارة بنجاح',
      sub: 'تم التحقق من الصلاحيات'
    });
  };

  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('ramz_admin_auth');
    } catch (e) {
      console.warn('Session storage remove error', e);
    }
    setCurrentView('store');
    setToast({
      message: 'تم قفل لوحة الإدارة',
      sub: 'يتطلب الدخول مجدداً إدخال رمز المرور'
    });
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setToast({
      message: `تمت إضافة "${product.name}" إلى السلة`,
      sub: 'يمكنك فتح السلة لإتمام وإرسال الطلب'
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order submission
  const handleSubmitOrder = async (formData: {
    customerName: string;
    phone: string;
    email: string;
    notes: string;
  }): Promise<Order> => {
    const payload = {
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }))
    };

    const newOrder = await api.createOrder(payload);
    // Refresh orders safely avoiding duplicate entries
    setOrders(prev => {
      if (prev.some(o => o.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });
    return newOrder;
  };

  // Product operations for Admin
  const handleAddProduct = async (prodData: { name: string; description: string; price: number }) => {
    const created = await api.createProduct(prodData);
    setProducts(prev => {
      if (prev.some(p => p.id === created.id)) return prev;
      return [created, ...prev];
    });
    setToast({ message: `تمت إضافة الخدمة "${created.name}" بنجاح` });
  };

  const handleUpdateProduct = async (id: string, prodData: { name?: string; description?: string; price?: number }) => {
    const updated = await api.updateProduct(id, prodData);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    setToast({ message: `تم تحديث الخدمة "${updated.name}"` });
  };

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
    setToast({ message: 'تم حذف الخدمة من المتجر' });
  };

  const handleSeedSampleServices = async () => {
    const seeded = await api.seedSamples();
    setProducts(() => {
      const map = new Map<string, Product>();
      for (const p of seeded) {
        if (p && p.id && !map.has(p.id)) map.set(p.id, p);
      }
      return Array.from(map.values());
    });
    setToast({ message: 'تمت إضافة الخدمات النموذجية المقترحة بنجاح' });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    setToast({ message: `تم تغيير حالة الطلب ${updated.orderNumber}` });
  };

  const handleDeleteOrder = async (orderId: string) => {
    await api.deleteOrder(orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setToast({ message: 'تم حذف الطلب' });
  };

  // Guaranteed deduplicated products array for safe keys rendering
  const uniqueProducts = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      if (p && p.id && !map.has(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [products]);

  // Guaranteed deduplicated orders array for safe keys rendering
  const uniqueOrders = useMemo(() => {
    const map = new Map<string, Order>();
    for (const o of orders) {
      if (o && o.id && !map.has(o.id)) {
        map.set(o.id, o);
      }
    }
    return Array.from(map.values());
  }, [orders]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartProductIds = useMemo(() => {
    return new Set(cart.map(item => item.product.id));
  }, [cart]);

  const newOrdersCount = useMemo(() => {
    return uniqueOrders.filter(o => o.status === 'new').length;
  }, [uniqueOrders]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090E] text-slate-100 selection:bg-purple-600 selection:text-white">
      
      {/* Real-time Order Arrival Notification Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl border border-purple-500/40 bg-[#121424] p-4 shadow-[0_10px_35px_rgba(139,92,246,0.3)] backdrop-blur-md flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-sm font-bold text-white leading-snug">{toast.message}</div>
              {toast.sub && <div className="text-xs text-slate-300 mt-0.5">{toast.sub}</div>}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'admin') {
            handleOpenAdmin();
          } else {
            setCurrentView('store');
          }
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        newOrdersCount={newOrdersCount}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminClick={handleOpenAdmin}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'store' ? (
          <Storefront
            products={uniqueProducts}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            onOpenAdmin={handleOpenAdmin}
            isLoading={isLoading}
          />
        ) : (
          <AdminPanel
            products={uniqueProducts}
            orders={uniqueOrders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onSeedSampleServices={handleSeedSampleServices}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onRefresh={fetchData}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(v => !v)}
            onLockAdmin={handleLogoutAdmin}
          />
        )}
      </main>

      {/* Cart Drawer & Checkout */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Admin Login Modal (PIN 12345) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Tech Footer (Pure typography and text, NO images) */}
      <footer className="border-t border-[#161826] bg-[#07080C] py-10 mt-16 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#11131E] border border-[#1E2235] flex items-center justify-center text-purple-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono font-bold text-white text-sm">
                رمز RAMZ للبرمجة والتطوير
              </span>
              <p className="text-xs text-slate-500 font-normal">
                منصة متخصصة في تطوير البرمجيات والأنظمة وقواعد البيانات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <button
              onClick={() => {
                setCurrentView('store');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-purple-400 transition-colors"
            >
              قسم الكل
            </button>
            <button
              onClick={handleOpenAdmin}
              className="hover:text-purple-400 transition-colors"
            >
              لوحة الإدارة
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">
              جميع الحقوق محفوظة © {new Date().getFullYear()} رمز RAMZ
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
