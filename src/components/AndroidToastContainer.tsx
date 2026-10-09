import React, { useState, useEffect } from 'react';

export const AndroidToastContainer: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      const msg = e.detail?.message || '';
      if (msg) {
        setToastMessage(msg);
        const timer = setTimeout(() => {
          setToastMessage(null);
        }, 2800);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('androidToast', handleToast);
    return () => window.removeEventListener('androidToast', handleToast);
  }, []);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#2D3139]/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl border border-white/10 max-w-sm text-center flex items-center gap-2">
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
