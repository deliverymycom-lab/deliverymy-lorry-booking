import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  FileCode2, 
  Check, 
  Copy, 
  X, 
  Terminal, 
  Layers, 
  ExternalLink, 
  Sparkles, 
  Vibrate, 
  Bell, 
  Compass, 
  MessageSquare,
  PackageCheck,
  CheckCircle2,
  FolderArchive
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, downloadAndroidStudioProjectZip, AndroidBridge } from '../services/androidProjectService';
import { Language } from '../types';

interface AndroidStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const AndroidStudioModal: React.FC<AndroidStudioModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'download' | 'guide' | 'tester'>('files');
  const [selectedFileKey, setSelectedFileKey] = useState<string>('MainActivity.kt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadAndroidStudioProjectZip((status) => {
        setDownloadStatus(status);
      });
      setDownloadSuccess(true);
      AndroidBridge.toast('Projek Android Studio berjaya dimuat turun!');
      AndroidBridge.vibrate(80);
    } catch (err: any) {
      alert('Ralat semasa memuat turun fail ZIP: ' + err?.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCode = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      AndroidBridge.vibrate(40);
    }
  };

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#121826] border border-slate-700/80 w-full max-w-4xl rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Projek Android Studio (APK)
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v1.0.0 Standalone
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pakej Penuh Kotlin & Gradle untuk Membina APK dalam Android Studio
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs Bar (div:nth-of-type(2)) */}
        <div className="flex gap-1.5 border-b border-slate-800 pb-2.5 overflow-x-auto text-xs no-scrollbar shrink-0">
          {Object.keys(ANDROID_PROJECT_FILES).map((key) => {
            const item = ANDROID_PROJECT_FILES[key];
            const isSelected = selectedFileKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedFileKey(key);
                  AndroidBridge.vibrate(25);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>{item.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Selected File Details Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-emerald-400 font-bold truncate">
              {selectedFile?.path}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono hidden sm:inline">
              {selectedFile?.category.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => handleCopyCode(selectedFile.content, selectedFileKey)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-2 border border-slate-700 shadow-sm"
          >
            {copiedKey === selectedFileKey ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-black">Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Kod</span>
              </>
            )}
          </button>
        </div>

        {/* The Code Box - Always Visible and Prominently Shown */}
        <div className="flex-1 min-h-[320px] max-h-[460px] overflow-auto bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-2xl relative">
          <div className="absolute top-2 right-3 text-[10px] text-slate-500 font-mono select-none">
            UTF-8 • Android Studio Ready
          </div>
          <pre className="whitespace-pre font-mono pt-2">{selectedFile?.content}</pre>
        </div>

        {/* Quick Actions Footer: Download ZIP, Build Guide, Native Tester */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Menyediakan ZIP...' : 'Muat Turun Projek (.ZIP)'}</span>
            </button>

            <button
              onClick={() => {
                AndroidBridge.toast('🚛 DeliveryMY: Ujian Toast Native Android Berjaya!');
                AndroidBridge.vibrate(60);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Uji Notifikasi Toast"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
              <span>Uji Toast</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
            Package: <strong className="text-white">com.deliverymy.app</strong> • API 24–34
          </div>
        </div>

      </div>
    </div>
  );
};
