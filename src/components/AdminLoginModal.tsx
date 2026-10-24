import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CORRECT_PIN = '12345'; // رمز لوحة الإدارة المحفوظ داخلياً

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pin.trim() === CORRECT_PIN) {
      setError(null);
      onSuccess();
    } else {
      setError('رمز المرور غير صحيح! يرجى المحاولة مرة أخرى.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handlePadClick = (digit: string) => {
    if (pin.length < 10) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin === CORRECT_PIN) {
        setTimeout(() => {
          onSuccess();
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClearAll = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-[#0D0F18] border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(139,92,246,0.25)] text-slate-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1D2E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-3 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Lock className="w-7 h-7" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">دخول لوحة الإدارة</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                أدخل رمز المرور السري للمسؤول
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* PIN Input (Password masked) */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  maxLength={10}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPin(val);
                    setError(null);
                    if (val === CORRECT_PIN) {
                      setTimeout(() => onSuccess(), 150);
                    }
                  }}
                  placeholder="• • • • •"
                  className="w-full text-center text-2xl tracking-[0.4em] py-3.5 px-4 rounded-xl bg-[#141624] border border-[#272E47] focus:border-purple-500 focus:outline-none font-mono text-white placeholder-slate-600 shadow-inner"
                  autoFocus
                />
              </div>

              {/* Error message (No PIN revealed) */}
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Quick Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-2" dir="ltr">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePadClick(num)}
                  className="py-2.5 rounded-xl bg-[#131625] hover:bg-purple-600/20 hover:border-purple-500/40 border border-[#20253B] text-white font-mono font-bold text-base transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 rounded-xl bg-[#131625] hover:bg-[#1A1F33] border border-[#20253B] text-slate-400 font-mono text-xs transition-all active:scale-95"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => handlePadClick('0')}
                className="py-2.5 rounded-xl bg-[#131625] hover:bg-purple-600/20 hover:border-purple-500/40 border border-[#20253B] text-white font-mono font-bold text-base transition-all active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="py-2.5 rounded-xl bg-[#131625] hover:bg-rose-500/10 border border-[#20253B] text-rose-300 font-mono text-xs font-semibold transition-all active:scale-95"
              >
                إفراغ
              </button>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all active:scale-98"
              >
                دخول اللوحة
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                إلغاء والعودة للمتجر
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
