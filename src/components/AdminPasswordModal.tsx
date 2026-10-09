import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle, ArrowRight, Code } from 'lucide-react';
import { Language } from '../types';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenFlutterCode?: () => void;
  currentLang: Language;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenFlutterCode,
  currentLang,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict authentication check for the specified admin password
    if (password === 'vu3tnovu3tno') {
      setPassword('');
      setErrorMessage('');
      onSuccess();
    } else {
      setShake(true);
      setErrorMessage(
        currentLang === 'en'
          ? 'Incorrect password. Access to Admin Console denied.'
          : currentLang === 'zh'
          ? '密码错误。管理员控制台拒绝访问。'
          : 'Kata laluan salah. Akses ke Konsol Admin ditolak.'
      );
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1A1A2E]">
              {currentLang === 'en'
                ? 'Admin Console Verification'
                : currentLang === 'zh'
                ? '管理员控制台身份验证'
                : 'Pengesahan Konsol Admin'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              admin@deliverymy.com
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          {currentLang === 'en'
            ? 'This area is restricted to authorized platform administrators. Please enter your secure master key to continue.'
            : currentLang === 'zh'
            ? '此区域仅限受权平台管理员进入。请输入主密钥以继续访问。'
            : 'Kawasan ini dikhaskan untuk pentadbir berdaftar sahaja. Sila masukkan kata laluan keselamatan untuk meneruskan.'}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#1A1A2E] mb-1.5">
              {currentLang === 'en'
                ? 'Administrator Password *'
                : currentLang === 'zh'
                ? '管理员密码 *'
                : 'Kata Laluan Pentadbir *'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none rounded-xl text-sm font-semibold pr-11 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {currentLang === 'en' ? 'Cancel' : currentLang === 'zh' ? '取消' : 'Batal'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{currentLang === 'en' ? 'Unlock Console' : currentLang === 'zh' ? '解锁控制台' : 'Buka Konsol'}</span>
            </button>
          </div>
        </form>

        {/* Admin Developer Tools: Flutter Source Code Trigger */}
        {onOpenFlutterCode && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Code className="w-3.5 h-3.5 text-sky-600" />
              <span>{currentLang === 'en' ? 'Mobile App Engine:' : currentLang === 'zh' ? '移动端核心:' : 'Enjin Aplikasi:'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFlutterCode();
              }}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="View Flutter Source Code (Dart & pubspec.yaml)"
            >
              <Code className="w-3.5 h-3.5 text-sky-600" />
              <span>Flutter Source Code (Dart)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
