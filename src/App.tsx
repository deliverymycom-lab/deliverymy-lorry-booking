import React, { useState, useEffect } from 'react';
import { Language, UserRole, DriverProfile, AppConfig } from './types';
import { LanguageService } from './services/languageService';
import { StorageService } from './services/storageService';
import { HeaderBar } from './components/HeaderBar';
import { AdvertisementBanner } from './components/AdvertisementBanner';
import { SplashScreen } from './screens/SplashScreen';
import { DriverAuthScreen } from './screens/DriverAuthScreen';
import { CustomerHomeScreen } from './screens/CustomerHomeScreen';
import { DriverHomeScreen } from './screens/DriverHomeScreen';
import { AdminPanelScreen } from './screens/AdminPanelScreen';
import { FlutterCodeModal } from './components/FlutterCodeModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { AndroidStudioModal } from './components/AndroidStudioModal';
import { DeveloperSettingsModal } from './components/DeveloperSettingsModal';
import { AndroidBottomNav, AndroidTab } from './components/AndroidBottomNav';
import { AndroidSystemBar } from './components/AndroidSystemBar';
import { AndroidToastContainer } from './components/AndroidToastContainer';
import { AndroidBridge, downloadAndroidStudioProjectZip } from './services/androidProjectService';
import { Download, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(LanguageService.getLanguage());
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [driverUser, setDriverUser] = useState<DriverProfile | null>(null);
  const [appConfig, setAppConfig] = useState<AppConfig>(StorageService.getConfig());

  // Standalone Android Mobile Device Layout
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [activeAndroidTab, setActiveAndroidTab] = useState<AndroidTab>('book');
  
  // Modals & Hidden Developer Settings
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [unlockedDevFeatures, setUnlockedDevFeatures] = useState<{
    admin: boolean;
    apkStudio: boolean;
    zipDownload: boolean;
  }>({
    admin: false,
    apkStudio: false,
    zipDownload: false,
  });

  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState<boolean>(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState<boolean>(false);
  
  // Quick Download ZIP state
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  // Restore saved sessions if any & subscribe to config changes
  useEffect(() => {
    StorageService.init();

    const session = StorageService.getSession();
    if (session.role === 'customer') {
      setCurrentRole('customer');
      setActiveAndroidTab('book');
    } else if (session.role === 'driver' && session.user) {
      setDriverUser(session.user as DriverProfile);
      setCurrentRole('driver');
      setActiveAndroidTab('driver');
    } else if (session.role === 'admin') {
      setCurrentRole('admin');
      setActiveAndroidTab('admin');
    }

    const unsub = StorageService.subscribe(() => {
      setAppConfig(StorageService.getConfig());
    });
    return () => unsub();
  }, []);

  const handleLanguageChange = (lang: Language) => {
    LanguageService.setLanguage(lang);
    setCurrentLang(lang);
    AndroidBridge.toast(`Bahasa: ${lang === 'ms' ? 'Bahasa Melayu' : lang === 'en' ? 'English' : '中文'}`);
  };

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'admin') {
      const session = StorageService.getSession();
      if (session.role === 'admin') {
        setCurrentRole('admin');
        setActiveAndroidTab('admin');
      } else {
        setIsAdminPasswordModalOpen(true);
      }
      return;
    }

    setCurrentRole(role);
    if (role === 'customer') {
      setActiveAndroidTab('book');
      StorageService.setSession('customer', null);
    } else if (role === 'driver') {
      setActiveAndroidTab('driver');
    }
  };

  const handleAndroidTabChange = (tab: AndroidTab) => {
    setActiveAndroidTab(tab);
    if (tab === 'book') {
      setCurrentRole('customer');
      StorageService.setSession('customer', null);
    } else if (tab === 'return-load') {
      setCurrentRole('customer');
      StorageService.setSession('customer', null);
    } else if (tab === 'driver') {
      setCurrentRole('driver');
    } else if (tab === 'android-apk') {
      setIsAndroidModalOpen(true);
    } else if (tab === 'admin') {
      const session = StorageService.getSession();
      if (session.role === 'admin') {
        setCurrentRole('admin');
      } else {
        setIsAdminPasswordModalOpen(true);
      }
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminPasswordModalOpen(false);
    setUnlockedDevFeatures((prev) => ({ ...prev, admin: true }));
    StorageService.setSession('admin', null);
    setCurrentRole('admin');
    setActiveAndroidTab('admin');
    AndroidBridge.toast('Log masuk Admin berjaya');
  };

  const handleLogout = () => {
    StorageService.clearSession();
    setDriverUser(null);
    setCurrentRole(null);
    setActiveAndroidTab('book');
    AndroidBridge.toast('Sesi ditamatkan');
  };

  const handleQuickDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadAndroidStudioProjectZip();
      AndroidBridge.toast('📦 Projek Android Studio (.ZIP) dimuat turun!');
    } catch (err: any) {
      alert('Ralat memuat turun ZIP: ' + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1A1A2E] flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
      {/* Top Universal App Header with 15-Click Hidden Developer Settings */}
      <HeaderBar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentRole={currentRole}
        onRoleSwitch={handleRoleSelect}
        onLogout={handleLogout}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onAdminLoginClick={() => handleRoleSelect('admin')}
        onOpenDevSettings={() => setIsDevModalOpen(true)}
      />

      {/* Top Advertisement Banner */}
      <AdvertisementBanner ad={appConfig.advertisement?.topAd} position="top" />

      {/* Main Container Area with Prominent, Fully-Visible App Box */}
      <main className="flex-1 flex flex-col items-center justify-start p-1.5 sm:p-4 w-full">
        <div
          className={`w-full flex flex-col transition-all duration-300 bg-white shadow-xl ${
            isMobileFrame
              ? 'max-w-[430px] my-1 sm:my-3 rounded-[32px] sm:rounded-[40px] border-4 sm:border-[6px] border-slate-800 shadow-2xl relative overflow-hidden'
              : 'max-w-3xl sm:max-w-4xl my-1 sm:my-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl relative overflow-hidden'
          }`}
        >
          {/* Screen Viewport Content */}
          <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-120px)] overflow-y-auto">
            {/* Splash / Role Selection */}
            {currentRole === null && (
              <SplashScreen
                currentLang={currentLang}
                onSelectRole={handleRoleSelect}
                onAdminLoginClick={() => handleRoleSelect('admin')}
                onOpenDevSettings={() => setIsDevModalOpen(true)}
              />
            )}

            {/* Customer Booking Flow */}
            {currentRole === 'customer' && (
              <CustomerHomeScreen
                currentLang={currentLang}
                onBackToRoleSelect={handleLogout}
                onLogout={handleLogout}
              />
            )}

            {/* Driver Portal Flow */}
            {currentRole === 'driver' && (
              <>
                {driverUser ? (
                  <DriverHomeScreen
                    driver={driverUser}
                    currentLang={currentLang}
                    onLogout={handleLogout}
                  />
                ) : (
                  <DriverAuthScreen
                    currentLang={currentLang}
                    onSuccess={(driver) => setDriverUser(driver)}
                    onBack={() => {
                      setCurrentRole('customer');
                      setActiveAndroidTab('book');
                    }}
                  />
                )}
              </>
            )}

            {/* Admin Control Flow */}
            {currentRole === 'admin' && (
              <AdminPanelScreen
                currentLang={currentLang}
                onLogout={handleLogout}
                onOpenFlutterCode={() => setIsFlutterModalOpen(true)}
                onOpenAndroidProject={() => setIsAndroidModalOpen(true)}
              />
            )}
          </div>

          {/* Android Material 3 Bottom Navigation Bar - Kept perfectly clean for normal users */}
          <div className="sticky bottom-0 z-30 w-full bg-white border-t border-slate-200">
            <AndroidBottomNav
              activeTab={activeAndroidTab}
              onTabChange={handleAndroidTabChange}
              currentLang={currentLang}
              showApkTab={unlockedDevFeatures.apkStudio}
              showAdminTab={unlockedDevFeatures.admin || currentRole === 'admin'}
            />
            {isMobileFrame && (
              <AndroidSystemBar
                onBack={() => {
                  if (currentRole !== null) {
                    handleLogout();
                  }
                }}
                onHome={() => {
                  setCurrentRole('customer');
                  setActiveAndroidTab('book');
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Bottom Advertisement Banner */}
      <AdvertisementBanner ad={appConfig.advertisement?.bottomAd} position="bottom" />

      {/* Android Toast Notifications Container */}
      <AndroidToastContainer />

      {/* Hidden Developer Settings Modal (Activated by 15 Consecutive Clicks on DeliveryMY) */}
      <DeveloperSettingsModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        onOpenAdmin={() => {
          handleAdminAuthSuccess();
        }}
        onOpenAndroidStudio={() => {
          setIsAndroidModalOpen(true);
        }}
        onDownloadZip={handleQuickDownloadZip}
        unlockedFeatures={unlockedDevFeatures}
        onUnlockFeature={(feature) => {
          setUnlockedDevFeatures((prev) => ({ ...prev, [feature]: true }));
        }}
        onResetLocks={() => {
          setUnlockedDevFeatures({
            admin: false,
            apkStudio: false,
            zipDownload: false,
          });
        }}
        currentLang={currentLang}
      />

      {/* Android Studio Project (.ZIP) & APK Hub Modal */}
      <AndroidStudioModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        currentLang={currentLang}
      />

      {/* Flutter Source Code Modal */}
      <FlutterCodeModal
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />

      {/* Admin Password Authentication Modal */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        onOpenFlutterCode={() => setIsFlutterModalOpen(true)}
        currentLang={currentLang}
      />
    </div>
  );
}
