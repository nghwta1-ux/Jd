import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Database, 
  AlertCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Lock,
  LogOut
} from 'lucide-react';
import { DatabaseModal } from './DatabaseModal';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: { name: string; description: string; price: number }) => Promise<void>;
  onUpdateProduct: (id: string, product: { name?: string; description?: string; price?: number }) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSeedSampleServices: () => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onRefresh: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLockAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSeedSampleServices,
  onUpdateOrderStatus,
  onDeleteOrder,
  onRefresh,
  soundEnabled,
  onToggleSound,
  onLockAdmin
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  
  // Orders filter: 'new' | 'previous' | 'all'
  const [ordersFilter, setOrdersFilter] = useState<'new' | 'previous' | 'all'>('new');

  // Add Product Form state (STRICTLY NO IMAGE INPUTS)
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [isAddingProd, setIsAddingProd] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [isEditingProd, setIsEditingProd] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Database info modal
  const [showDbModal, setShowDbModal] = useState(false);

  // Status updating loader map
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filtered orders list
  const filteredOrders = orders.filter(order => {
    if (ordersFilter === 'new') return order.status === 'new';
    if (ordersFilter === 'previous') return order.status === 'completed' || order.status === 'cancelled';
    return true; // all
  });

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const previousOrdersCount = orders.filter(o => o.status === 'completed' || o.status === 'cancelled').length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError(null);

    if (!newProdName.trim()) {
      setProdError('اسم المنتج أو الخدمة مطلوب');
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 15.50) {
      setProdError('يجب أن يكون السعر بين 1 و 15.50 ر.س');
      return;
    }

    try {
      setIsAddingProd(true);
      await onAddProduct({
        name: newProdName.trim(),
        description: newProdDesc.trim(),
        price: priceNum
      });
      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice('');
    } catch (err: any) {
      setProdError(err.message || 'فشل حفظ المنتج');
    } finally {
      setIsAddingProd(false);
    }
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditPrice(p.price.toString());
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError('اسم المنتج أو الخدمة مطلوب');
      return;
    }

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum < 1 || priceNum > 15.50) {
      setEditError('يجب أن يكون السعر بين 1 و 15.50 ر.س');
      return;
    }

    try {
      setIsEditingProd(true);
      await onUpdateProduct(editingProduct.id, {
        name: editName.trim(),
        description: editDesc.trim(),
        price: priceNum
      });
      setEditingProduct(null);
    } catch (err: any) {
      setEditError(err.message || 'فشل تعديل المنتج');
    } finally {
      setIsEditingProd(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await onUpdateOrderStatus(orderId, newStatus);
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الحالة');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / System Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0F111C] border border-[#1E2235]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-white font-mono">لوحة إدارة رمز RAMZ</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>مزامنة مباشرة وفورية بين الأجهزة • التخزين السحابي متصل</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
              soundEnabled
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : 'bg-[#141624] border-[#23283E] text-slate-400'
            }`}
            title="تفعيل/تعطيل التنبيه الصوتي عند وصول طلب جديد"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'صوت التنبيه مفعّل' : 'التنبيه صامت'}</span>
          </button>

          {/* Database & Costs Guide */}
          <button
            onClick={() => setShowDbModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141624] hover:bg-[#1A1D2E] text-slate-300 border border-[#23283E] hover:border-cyan-500/40 text-xs font-medium transition-all"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>قواعد البيانات والتكاليف</span>
          </button>

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141624] hover:bg-[#1A1D2E] text-slate-300 border border-[#23283E] text-xs font-medium transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          {/* Lock Panel */}
          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-all"
            title="قفل لوحة الإدارة وتسجيل الخروج"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>قفل اللوحة</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[#1E2235] gap-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2.5 pb-3 px-2 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'orders'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-400" />
          <span>إدارة الطلبات</span>
          {newOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-mono">
              {newOrdersCount} جديد
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2.5 pb-3 px-2 border-b-2 font-bold text-sm transition-all ${
            activeTab === 'products'
              ? 'border-purple-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-purple-400" />
          <span>إدارة المنتجات والخدمات</span>
          <span className="px-2 py-0.5 rounded-full bg-[#181A28] text-slate-400 text-[10px] font-mono border border-[#242940]">
            {products.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Orders Sub-filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-[#0E101A] p-1.5 rounded-xl border border-[#1E2235]">
              <button
                onClick={() => setOrdersFilter('new')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ordersFilter === 'new'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الطلبات الجديدة ({newOrdersCount})
              </button>
              <button
                onClick={() => setOrdersFilter('previous')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ordersFilter === 'previous'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الطلبات السابقة ({previousOrdersCount})
              </button>
              <button
                onClick={() => setOrdersFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ordersFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                جميع الطلبات ({orders.length})
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              تصل الطلبات من أي هاتف أو كمبيوتر وتظهر هنا فورياً.
            </p>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#23283E] bg-[#0E101A] p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">
                {ordersFilter === 'new' ? 'لا توجد طلبات جديدة حالياً' : 'لا توجد طلبات في هذا القسم'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                عندما يقوم العميل بإضافة خدمات إلى السلة وإرسال الطلب من واجهة المتجر عبر أي جهاز، سيظهر الطلب هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const dateFormatted = new Date(order.createdAt).toLocaleString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isNew = order.status === 'new';

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border transition-all p-5 sm:p-6 bg-[#0E101A] ${
                      isNew
                        ? 'border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                        : 'border-[#1E2235]'
                    }`}
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1D2F]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-bold font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                          {order.orderNumber}
                        </span>
                        
                        {/* Status Badge */}
                        <span
                          className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border ${
                            order.status === 'new'
                              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                              : order.status === 'in_progress'
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : order.status === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          {order.status === 'new' && 'جديد'}
                          {order.status === 'in_progress' && 'قيد التنفيذ'}
                          {order.status === 'completed' && 'مكتمل'}
                          {order.status === 'cancelled' && 'ملغي'}
                        </span>

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {dateFormatted}
                        </span>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400 font-mono">تغيير الحالة:</label>
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-[#141624] border border-[#2A3048] text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-purple-500 focus:outline-none"
                        >
                          <option value="new">جديد</option>
                          <option value="in_progress">قيد التنفيذ</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الطلب رقم ${order.orderNumber}؟`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                      
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <span className="text-xs font-mono text-slate-500 uppercase">بيانات العميل:</span>
                        <div className="text-sm font-bold text-white">{order.customerName}</div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{order.phone}</span>
                        </div>

                        {order.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono" dir="ltr">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{order.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-2 md:col-span-2">
                        <span className="text-xs font-mono text-slate-500 uppercase">تفاصيل الخدمات المطلوبة:</span>
                        <div className="rounded-xl border border-[#1A1E2F] bg-[#090A10] p-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs pb-1.5 border-b border-[#141624] last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{item.name}</span>
                                <span className="text-slate-500 font-mono">× {item.quantity}</span>
                              </div>
                              <span className="font-mono text-purple-300 font-semibold">
                                {(item.price * item.quantity).toLocaleString('ar-SA')} ر.س
                              </span>
                            </div>
                          ))}

                          <div className="flex justify-between items-center pt-2 text-sm font-bold border-t border-[#1C2033]">
                            <span className="text-white">المجموع الإجمالي:</span>
                            <span className="text-purple-400 font-mono">
                              {order.total.toLocaleString('ar-SA')} ر.س
                            </span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#121422] border border-[#1C2033] text-xs text-slate-300">
                            <span className="font-bold text-slate-400 block mb-0.5">ملاحظات العميل:</span>
                            {order.notes}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          
          {/* Add Product Form - STRICT REQUIREMENT: NO IMAGE FIELDS */}
          <div className="rounded-2xl border border-[#1E2235] bg-[#0E101A] p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1D2F]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">إضافة منتج أو خدمة برمجية جديدة</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">نصوص وتنسيقات فقط (بدون صور)</span>
            </div>

            {prodError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {prodError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    اسم المنتج أو الخدمة <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="مثال: تطوير نظام إدارة المبيعات والمخزون"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500"
                  />
                </div>

                {/* Product Price */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      السعر (بالريال السعودي) <span className="text-purple-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      بين 1 و 15.50 ر.س
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="15.50"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="مثال: 15.50"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>

              </div>

              {/* Product Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  الوصف التفصيلي للخدمة <span className="text-purple-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="اكتب مواصفات الخدمة، المميزات المشمولة، ومدة التنفيذ أو التقنيات المستخدمة..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isAddingProd}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingProd ? 'جاري الحفظ...' : 'حفظ ونشر الخدمة في المتجر'}</span>
                </button>

                {/* Helper button if products are empty */}
                {products.length === 0 && (
                  <button
                    type="button"
                    onClick={onSeedSampleServices}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141624] hover:bg-[#1D2133] text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>إضافة خدمات نموذجية مقترحة بنقرة واحدة (اختياري)</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Current Products List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>الخدمات الحالية في المتجر</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#141624] text-slate-400 border border-[#23283E]">
                  {products.length}
                </span>
              </h3>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#23283E] bg-[#0E101A] p-10 text-center">
                <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">لا توجد منتجات بعد</h4>
                <p className="text-xs text-slate-400">
                  استخدم النموذج أعلاه لإضافة أول خدمة لمتجر رمز.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-[#1E2235] bg-[#0E101A] p-5 flex flex-col justify-between hover:border-[#2C334E] transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-base font-bold text-white leading-snug">
                          {product.name}
                        </h4>
                        <span className="font-mono text-purple-400 font-bold text-base shrink-0">
                          {product.price.toLocaleString('ar-SA', {
                            minimumFractionDigits: Number.isInteger(product.price) ? 0 : 2,
                            maximumFractionDigits: 2
                          })} ر.س
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1A1D2F] flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        معرّف: {product.id.slice(-6)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141624] hover:bg-[#1C2033] text-slate-200 border border-[#23283E] text-xs font-medium transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>تعديل</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف خدمة "${product.name}"؟`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            onClick={() => setEditingProduct(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-[#0D0F18] border border-[#23283E] rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#1E2235] mb-5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">تعديل بيانات الخدمة</h3>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    اسم المنتج / الخدمة
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 text-sm text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      السعر (ر.س)
                    </label>
                    <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      بين 1 و 15.50 ر.س
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="15.50"
                    step="0.01"
                    required
                    dir="ltr"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 text-sm text-white text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    الوصف التفصيلي
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141624] border border-[#23283E] focus:border-purple-500 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E2235]">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl bg-[#141624] text-slate-300 text-xs hover:bg-[#1A1D2E]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isEditingProd}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
                  >
                    {isEditingProd ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Database & Costs Modal */}
      <DatabaseModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />

    </div>
  );
};
