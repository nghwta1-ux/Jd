import React from 'react';
import { ShoppingBag, ShieldCheck, Terminal, ArrowRight, Lock, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'store' | 'admin';
  onViewChange: (view: 'store' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  newOrdersCount: number;
  isAdminAuthenticated: boolean;
  onAdminClick: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  cartCount,
  onOpenCart,
  newOrdersCount,
  isAdminAuthenticated,
  onAdminClick,
  onLogoutAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2235] bg-[#090A10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity: رمز RAMZ */}
        <div 
          onClick={() => onViewChange('store')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.5)]">
            <div className="w-full h-full bg-[#0D0E17] rounded-[11px] flex items-center justify-center text-white">
              <Terminal className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                رَمْــز <span className="text-purple-400 text-xl font-bold tracking-wider">RAMZ</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300">
                PRO DEV
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              للبرمجة وتطوير المواقع والأنظمة وقواعد البيانات
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {currentView === 'store' ? (
            <>
              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131522] hover:bg-[#1A1E30] text-slate-200 border border-[#23283E] hover:border-purple-500/50 transition-all shadow-sm active:scale-95"
                title="عرض سلة الخدمات"
              >
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <span className="hidden sm:inline text-sm font-medium">السلة</span>
                {cartCount > 0 ? (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[11px] font-bold text-white font-mono animate-pulse">
                    {cartCount}
                  </span>
                ) : (
                  <span className="hidden sm:inline text-xs text-slate-500 font-mono">(0)</span>
                )}
              </button>

              {/* Admin Panel Entry with PIN Protection */}
              <button
                onClick={onAdminClick}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/60 transition-all text-sm font-medium active:scale-95"
                title="دخول لوحة الإدارة"
              >
                {isAdminAuthenticated ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-purple-400" />
                )}
                <span>لوحة الإدارة</span>
                {newOrdersCount > 0 && (
                  <span className="flex items-center justify-center w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
                )}
              </button>
            </>
          ) : (
            <>
              {/* Back to Storefront Button */}
              <button
                onClick={() => onViewChange('store')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131522] hover:bg-[#1A1E30] text-slate-200 border border-[#23283E] hover:border-cyan-500/40 transition-all text-sm font-medium active:scale-95"
              >
                <ArrowRight className="w-4 h-4 text-cyan-400 rotate-180" />
                <span>العودة لواجهة المتجر</span>
              </button>

              {/* Lock / Logout Admin Button */}
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all text-xs font-mono active:scale-95"
                title="قفل لوحة الإدارة وتسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">قفل اللوحة</span>
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
