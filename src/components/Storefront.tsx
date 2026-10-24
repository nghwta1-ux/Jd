import React from 'react';
import { Product } from '../types';
import { Plus, Check, Code2, Cpu, Database, Server, Sparkles, Layers } from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartProductIds: Set<string>;
  onOpenAdmin: () => void;
  isLoading: boolean;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  onAddToCart,
  cartProductIds,
  onOpenAdmin,
  isLoading
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero Section - Text and Code aesthetic only, NO images */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1E2238] bg-gradient-to-b from-[#10121F] via-[#0B0D15] to-[#090A10] p-8 sm:p-12 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Subtle decorative glow accents without images */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>RAMZ // هندسة برمجية وحلول رقمية متقدمة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight sm:leading-tight mb-5 tracking-tight">
            حلول برمجية متخصصة تبني <br className="hidden sm:inline" />
            <span className="bg-gradient-to-l from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              مستقبل أعمالك الرقمية
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl font-normal">
            نطور المواقع الحديثة، الأنظمة الإدارية المعقدة، وهندسة قواعد البيانات السحابية بأعلى معايير الأداء والسرعة، المصممة خصيصاً لتلبية متطلبات مشروعك.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141624] border border-[#23283E]">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>برمجة مخصصة</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141624] border border-[#23283E]">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>تطوير الأنظمة</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141624] border border-[#23283E]">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>قواعد البيانات</span>
            </div>
          </div>
        </div>
      </section>

      {/* STRICT REQUIREMENT: Only ONE section called "الكل" */}
      <section className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2235] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-sm font-bold">
              /01
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>الكل</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#181B2B] text-slate-400 border border-[#2A304B]">
                  {products.length} {products.length === 1 ? 'خدمة' : 'خدمات'}
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            جميع الخدمات والحلول البرمجية المتوفرة
          </p>
        </div>

        {/* Loading State */}
        {isLoading && products.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">جاري تحميل الخدمات من قاعدة البيانات...</p>
          </div>
        )}

        {/* Empty State - Starts with 0 products until added from Admin */}
        {!isLoading && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#282E47] bg-[#0E101A]/60 p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              قائمة الخدمات فارغة حالياً
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              لم تتم إضافة أي خدمات أو منتجات برمجية بعد. يمكنك كمسؤول للموقع إضافة الخدمات والمنتجات وتحديد أسعارها وتفاصيلها مباشرة من لوحة الإدارة.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة خدمات من لوحة الإدارة</span>
            </button>
          </div>
        )}

        {/* Products Grid - Strictly text-based cards, NO images */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const inCart = cartProductIds.has(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#1E2235] bg-[#0E101A] p-6 hover:border-purple-500/50 hover:bg-[#121422] transition-all duration-300 hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)]"
                >
                  {/* Card Content (Text Only) */}
                  <div className="space-y-4">
                    {/* Badge & Price Header */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#161929] border border-[#272D45] text-purple-300">
                        {product.category || 'قسم الغمس'}
                      </span>
                      <div className="text-left font-mono">
                        <span className="text-2xl font-black text-white">
                          {Number(product.price).toLocaleString('ar-SA', {
                            minimumFractionDigits: Number.isInteger(Number(product.price)) ? 0 : 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                        <span className="text-xs text-purple-400 font-bold mr-1">
                          ر.س
                        </span>
                      </div>
                    </div>

                    {/* Product Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                      {product.name}
                    </h3>

                    {/* Product Description */}
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 whitespace-pre-line font-normal">
                      {product.description || 'حل برمجي وتطوير مخصص وفق أفضل المعايير التقنية.'}
                    </p>
                  </div>

                  {/* Card Action */}
                  <div className="pt-6 mt-6 border-t border-[#1C2033] flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 font-mono">
                      تسليم وضمان احترافي
                    </span>
                    
                    {/* Add to Cart button */}
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
                        inCart
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>في السلة (إضافة أخرى)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>إضافة إلى السلة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Trust & Guarantee Banner (Text-only) */}
      <section className="mt-16 rounded-2xl border border-[#1A1D2E] bg-[#0A0B12] p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-right">
          <div className="p-4 rounded-xl bg-[#0F111B] border border-[#1A1E2F]">
            <h4 className="text-sm font-bold text-white mb-1">تنفيذ فوري واحترافي</h4>
            <p className="text-xs text-slate-400">فريق هندسي متخصص في تطوير البرمجيات المعقدة والحلول السريعة.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F111B] border border-[#1A1E2F]">
            <h4 className="text-sm font-bold text-white mb-1">دقة وموثوقية في التسليم</h4>
            <p className="text-xs text-slate-400">توثيق شامل للكود، وهيكلة برمجية نظيفة قابلة للتوسع المستقبلي.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0F111B] border border-[#1A1E2F]">
            <h4 className="text-sm font-bold text-white mb-1">استقبال مباشر للطلبات</h4>
            <p className="text-xs text-slate-400">تصل طلباتك فوراً للإدارة عبر قاعدة البيانات المشتركة بدون تأخير.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
