import React from 'react';
import { X, Database, Server, Shield, Check, DollarSign, ExternalLink } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-[#0D0F18] border border-[#23283E] rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#1E2235]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">دليل قواعد البيانات والتكاليف</h3>
                <p className="text-xs text-slate-400 font-mono">RAMZ Architecture & Infrastructure</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1D2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-6 space-y-6 text-sm">
            
            {/* 1. Current Database Implementation */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Check className="w-5 h-5" />
                <span>الوضع الحالي: قاعدة بيانات مدمجة ومتزامنة بين الأجهزة بنسبة 100%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تم تجهيز هذا الموقع بخلفية برمجية متكاملة (Express + Persistent Storage) على السيرفر، مع اتصال فوري (Server-Sent Events) لتلقي الطلبات فوراً بين أي متصفح وجهاز (كمبيوتر، جوال، أو متصفح خفي) دون الاعتماد على التخزين المحلي للمتصفح (Local Storage) وحده.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-300">
                <span>التكلفة الحالية: 0$ (لا توجد أي اشتراكات أو مدفوعات مطلوبة للتشغيل الأساسي)</span>
              </div>
            </div>

            {/* 2. Responsibilities & Costs */}
            <div className="rounded-2xl border border-[#23283E] bg-[#121422] p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>إقرار التكاليف والمسؤولية المالية</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                وفق الشروط المتفق عليها: <strong>تكلفة أي قاعدة بيانات سحابية مدفوعة، أو استضافة مخصصة، أو خدمات مدفوعة تقع بالكامل على عاتق صاحب الموقع</strong> وليست ضمن مسؤولية المطور تلقائياً.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                لذلك تم اعتماد هذا المحرك الداخلي الفعال مجاناً أولاً، دون إجبارك على ربط بطاقتك الائتمانية أو دفع رسوم شهرية لأي طرف خارجي.
              </p>
            </div>

            {/* 3. Future External Database Connections */}
            <div className="rounded-2xl border border-[#23283E] bg-[#121422] p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>خيارات الترقية لقواعد بيانات خارجية عند التوسع</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                إذا أردت مستقبلاً ربط الموقع بقاعدة بيانات سحابية كبرى عند وصول آلاف الطلبات يومياً، يمكنك ربط أيٍّ من الخدمات التالية بسهولة:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pr-4 list-disc">
                <li>
                  <strong className="text-white">PostgreSQL / Supabase:</strong> قاعدة بيانات علائقية قوية، تقدم باقة مجانية كريمة تكفي حتى 500 ميغابايت وحوالي 50,000 مستخدم.
                </li>
                <li>
                  <strong className="text-white">Google Cloud SQL:</strong> خدمة مؤسسية عالية الاعتمادية (تتطلب مشروع Google Cloud مفعّل وتكاليف استضافة شهرية).
                </li>
                <li>
                  <strong className="text-white">Firebase Firestore:</strong> قاعدة بيانات NoSQL فورية، توفر باقة مجانية (Spark Plan) بحدود قراءة/كتابة يومية محددة.
                </li>
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#1E2235] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
