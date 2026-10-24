import React, { useState } from 'react';
import { CartItem, Order } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: (formData: {
    customerName: string;
    phone: string;
    email: string;
    notes: string;
  }) => Promise<Order>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim()) {
      setSubmitError('يرجى إدخال اسم العميل أو اسم الجهة');
      return;
    }

    if (!phone.trim()) {
      setSubmitError('يرجى إدخال رقم الجوال');
      return;
    }

    if (items.length === 0) {
      setSubmitError('السلة فارغة، يرجى إضافة خدمات قبل إرسال الطلب');
      return;
    }

    try {
      setIsSubmitting(true);
      const newOrder = await onSubmitOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim()
      });
      setSubmittedOrder(newOrder);
      onClearCart();
    } catch (err: any) {
      setSubmitError(err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedOrder(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0D0F18] border-r border-[#1E2235] shadow-2xl flex flex-col text-slate-200">
          
          {/* Header */}
          <div className="p-6 border-b border-[#1E2235] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">سلة الطلبات</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {items.length} {items.length === 1 ? 'خدمة مختارة' : 'خدمات مختارة'}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1D2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* SUCCESS SCREEN */}
            {submittedOrder ? (
              <div className="py-6 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    تم إرسال الطلب بنجاح!
                  </h4>
                  <p className="text-sm text-slate-300">
                    تم تسجيل طلبك في قاعدة البيانات وظهر فوراً في لوحة الإدارة للمتابعة.
                  </p>
                </div>

                {/* Order Details Ticket */}
                <div className="rounded-xl border border-[#242940] bg-[#121524] p-5 text-right space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#20253B]">
                    <span className="text-slate-400">رقم الطلب:</span>
                    <span className="text-purple-400 font-bold text-sm bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {submittedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">اسم العميل:</span>
                    <span className="text-white font-medium">{submittedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">رقم التواصل:</span>
                    <span className="text-white font-medium">{submittedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">الحالة:</span>
                    <span className="text-cyan-400 font-medium">جديد (قيد المراجعة)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#20253B] text-sm">
                    <span className="text-slate-300 font-bold">المجموع:</span>
                    <span className="text-white font-bold">
                      {submittedOrder.total.toLocaleString('ar-SA', {
                        minimumFractionDigits: Number.isInteger(submittedOrder.total) ? 0 : 2,
                        maximumFractionDigits: 2
                      })} ر.س
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  العودة لتصفح الخدمات
                </button>
              </div>
            ) : items.length === 0 ? (
              /* EMPTY CART */
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#161827] flex items-center justify-center text-slate-500 mx-auto mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold text-white mb-1">
                  السلة فارغة
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  اختر من الخدمات المعروضة في قسم "الكل" وأضفها إلى السلة لإتمام الطلب.
                </p>
              </div>
            ) : (
              /* ITEMS & CHECKOUT FORM */
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    الخدمات المضافة ({items.length})
                  </h4>
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-[#1E2235] bg-[#121422] p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-sm font-bold text-white leading-snug">
                            {product.name}
                          </h5>
                          <div className="text-xs font-mono text-purple-400 font-bold mt-1">
                            {product.price.toLocaleString('ar-SA', {
                              minimumFractionDigits: Number.isInteger(product.price) ? 0 : 2,
                              maximumFractionDigits: 2
                            })} ر.س
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1C1F33]">
                        <span className="text-xs text-slate-400 font-mono">الكمية:</span>
                        <div className="flex items-center gap-2 bg-[#090A10] border border-[#23283E] rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-[#161928] text-slate-300 hover:text-white hover:bg-[#20253B]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-[#161928] text-slate-300 hover:text-white hover:bg-[#20253B]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Checkout Form */}
                <form id="orderForm" onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#1E2235]">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    معلومات العميل وتأكيد الطلب
                  </h4>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      اسم العميل أو المؤسسة <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: شركة التقنية الحديثة / أحمد خالد"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121422] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      رقم الجوال <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 5x xxx xxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121422] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      البريد الإلكتروني <span className="text-slate-500 text-[10px]">(اختياري)</span>
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121422] border border-[#23283E] focus:border-purple-500 focus:outline-none text-sm text-white placeholder-slate-500 text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      ملاحظات أو متطلبات المشروع <span className="text-slate-500 text-[10px]">(اختياري)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="اكتب أي تفاصيل إضافية تود إخبارنا بها حول مشروعك..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#121422] border border-[#23283E] focus:border-purple-500 focus:outline-none text-xs text-white placeholder-slate-500 resize-none"
                    />
                  </div>
                </form>
              </>
            )}

          </div>

          {/* Footer with Total and Submit Action */}
          {!submittedOrder && items.length > 0 && (
            <div className="p-6 border-t border-[#1E2235] bg-[#0A0B12] space-y-4">
              <div className="flex items-center justify-between font-mono">
                <span className="text-sm text-slate-400">المجموع الإجمالي:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    {total.toLocaleString('ar-SA', {
                      minimumFractionDigits: Number.isInteger(total) ? 0 : 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <span className="text-xs text-purple-400 font-bold mr-1.5">
                    ر.س
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="orderForm"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تسجيل وإرسال الطلب...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الطلب الآن</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500">
                ⚡ يُحفظ الطلب مباشرة في قاعدة البيانات ويصل فورياً للوحة الإدارة.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
