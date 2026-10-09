import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Download, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  KeyRound, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';
import { AndroidBridge } from '../services/androidProjectService';

type TargetOption = 'apkStudio' | 'zipDownload' | 'admin';

interface DeveloperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onOpenAndroidStudio: () => void;
  onDownloadZip: () => Promise<void>;
  unlockedFeatures: {
    admin: boolean;
    apkStudio: boolean;
    zipDownload: boolean;
  };
  onUnlockFeature: (feature: 'admin' | 'apkStudio' | 'zipDownload') => void;
  onResetLocks: () => void;
  currentLang: Language;
}

export const DeveloperSettingsModal: React.FC<DeveloperSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenAndroidStudio,
  onDownloadZip,
  unlockedFeatures,
  onUnlockFeature,
  onResetLocks,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<TargetOption>('apkStudio');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  // Password mappings
  const PASSWORDS: Record<TargetOption, string> = {
    apkStudio: 'studiovu3tnovu3tno',
    zipDownload: 'zipvu3tnovu3tno',
    admin: 'vu3tnovu3tno',
  };

  const TARGET_LABELS: Record<TargetOption, string> = {
    apkStudio: 'APK / Studio',
    zipDownload: 'ZIP Download',
    admin: 'Admin',
  };

  const handleUnlock = (targetToVerify?: TargetOption) => {
    setErrorMessage('');
    setSuccessMessage('');

    const activeTarget = targetToVerify || selectedTarget;
    const cleanInput = password.trim();

    if (!cleanInput) {
      setErrorMessage('Please enter an authorization password.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // 1. Direct match for currently selected / targeted feature
    if (cleanInput === PASSWORDS[activeTarget]) {
      onUnlockFeature(activeTarget);
      setPassword('');
      AndroidBridge.vibrate(60);
      AndroidBridge.toast(`${TARGET_LABELS[activeTarget]} unlocked!`);
      setSuccessMessage(`Success! ${TARGET_LABELS[activeTarget]} is now UNLOCKED.`);
      return;
    }

    // 2. Smart fall-through: if user typed the password of another target
    if (cleanInput === PASSWORDS.apkStudio) {
      onUnlockFeature('apkStudio');
      setSelectedTarget('apkStudio');
      setPassword('');
      AndroidBridge.vibrate(60);
      AndroidBridge.toast('APK / Studio unlocked!');
      setSuccessMessage('Success! APK / Studio is now UNLOCKED.');
      return;
    }

    if (cleanInput === PASSWORDS.zipDownload) {
      onUnlockFeature('zipDownload');
      setSelectedTarget('zipDownload');
      setPassword('');
      AndroidBridge.vibrate(60);
      AndroidBridge.toast('ZIP Download unlocked!');
      setSuccessMessage('Success! ZIP Download is now UNLOCKED.');
      return;
    }

    if (cleanInput === PASSWORDS.admin) {
      onUnlockFeature('admin');
      setSelectedTarget('admin');
      setPassword('');
      AndroidBridge.vibrate(60);
      AndroidBridge.toast('Admin unlocked!');
      setSuccessMessage('Success! Admin console is now UNLOCKED.');
      return;
    }

    // Incorrect password
    setShake(true);
    setErrorMessage(`Invalid password for ${TARGET_LABELS[activeTarget]}. Verification failed.`);
    AndroidBridge.vibrate(100);
    setTimeout(() => setShake(false), 500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUnlock();
  };

  const handleTargetSelect = (target: TargetOption) => {
    setSelectedTarget(target);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      await onDownloadZip();
      AndroidBridge.toast('Android Studio project ZIP download started!');
    } catch (err: any) {
      setErrorMessage('ZIP download error: ' + (err?.message || err));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`bg-[#0F172A] border border-slate-700/80 w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto ${
          shake ? 'animate-bounce ring-2 ring-rose-500' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                Developer Settings
              </h3>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                15-Click Hidden
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secured developer console • Password authorization required
            </p>
          </div>
        </div>

        {/* Target Selector Tabs */}
        <div className="mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Feature to Unlock:</span>
            <span className="text-purple-400 font-mono normal-case">Target: {TARGET_LABELS[selectedTarget]}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* APK / Studio Tab */}
            <button
              type="button"
              onClick={() => handleTargetSelect('apkStudio')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedTarget === 'apkStudio'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>APK / Studio</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${unlockedFeatures.apkStudio ? 'text-emerald-400' : 'text-slate-500'}`}>
                {unlockedFeatures.apkStudio ? '● UNLOCKED' : '○ LOCKED'}
              </span>
            </button>

            {/* ZIP Download Tab */}
            <button
              type="button"
              onClick={() => handleTargetSelect('zipDownload')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedTarget === 'zipDownload'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>ZIP Download</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${unlockedFeatures.zipDownload ? 'text-amber-400' : 'text-slate-500'}`}>
                {unlockedFeatures.zipDownload ? '● UNLOCKED' : '○ LOCKED'}
              </span>
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => handleTargetSelect('admin')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedTarget === 'admin'
                  ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-sm ring-1 ring-blue-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${unlockedFeatures.admin ? 'text-blue-400' : 'text-slate-500'}`}>
                {unlockedFeatures.admin ? '● UNLOCKED' : '○ LOCKED'}
              </span>
            </button>
          </div>
        </div>

        {/* Security Password Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-5">
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Enter Verification Password</span>
              </label>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                Unlocking: {TARGET_LABELS[selectedTarget]}
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder={`Enter password for ${TARGET_LABELS[selectedTarget]}...`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (successMessage) setSuccessMessage('');
                  }}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock</span>
              </button>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Feedback */}
            {successMessage && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>
        </div>

        {/* The Three Protected Options */}
        <div className="space-y-3 mb-5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Protected Options (3 Controls)
          </div>

          {/* 1. APK / Studio Option */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              unlockedFeatures.apkStudio
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-900/20'
                : selectedTarget === 'apkStudio'
                ? 'bg-slate-900/70 border-emerald-500/40'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    unlockedFeatures.apkStudio
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-white">
                      APK / Studio
                    </h4>
                    {unlockedFeatures.apkStudio ? (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standalone Android Studio Kotlin project & source file explorer
                  </p>
                </div>
              </div>

              {unlockedFeatures.apkStudio ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAndroidStudio();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open APK / Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTargetSelect('apkStudio')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Locked • Select to Unlock</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. ZIP Download Option */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              unlockedFeatures.zipDownload
                ? 'bg-amber-950/40 border-amber-500/50 shadow-md shadow-amber-900/20'
                : selectedTarget === 'zipDownload'
                ? 'bg-slate-900/70 border-amber-500/40'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    unlockedFeatures.zipDownload
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-white">
                      ZIP Download
                    </h4>
                    {unlockedFeatures.zipDownload ? (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Download complete ready-to-run Android Studio project .ZIP package
                  </p>
                </div>
              </div>

              {unlockedFeatures.zipDownload ? (
                <button
                  onClick={handleDownloadClick}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black shadow-md shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Preparing ZIP...' : 'Download ZIP'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTargetSelect('zipDownload')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Locked • Select to Unlock</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Admin Option */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              unlockedFeatures.admin
                ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-900/20'
                : selectedTarget === 'admin'
                ? 'bg-slate-900/70 border-blue-500/40'
                : 'bg-slate-900/40 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    unlockedFeatures.admin
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-white">
                      Admin
                    </h4>
                    {unlockedFeatures.admin ? (
                      <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>UNLOCKED</span>
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Access full administration dashboard, platform metrics and driver manager
                  </p>
                </div>
              </div>

              {unlockedFeatures.admin ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTargetSelect('admin')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Locked • Select to Unlock</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => {
              onResetLocks();
              setPassword('');
              setSuccessMessage('');
              setErrorMessage('All developer options have been locked.');
              AndroidBridge.vibrate(40);
            }}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lock All Options</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
