import React, { useState } from 'react';
import { User, Mail, Lock, Phone, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { CustomerProfile } from '../types';
import { LanguageService } from '../services/languageService';
import { StorageService } from '../services/storageService';

interface CustomerAuthScreenProps {
  onSuccess: (customer: CustomerProfile) => void;
  onBack: () => void;
}

export const CustomerAuthScreen: React.FC<CustomerAuthScreenProps> = ({
  onSuccess,
  onBack,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const customers = StorageService.getCustomers();
    const found = customers.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      StorageService.setSession('customer', found);
      onSuccess(found);
    } else {
      // Allow seamless demo login
      const newCust = StorageService.registerCustomer({
        email: email || 'customer@example.com',
        name: name || 'Pelanggan DeliveryMY',
        phone: phone || '0123456789',
        password: password || 'password123',
      });
      StorageService.setSession('customer', newCust);
      onSuccess(newCust);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !password) {
      setErrorMsg('Sila lengkapkan semua ruangan bertanda *');
      return;
    }

    const customers = StorageService.getCustomers();
    if (customers.some((c) => c.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('E-mel ini telah didaftarkan. Sila log masuk.');
      return;
    }

    const newCust = StorageService.registerCustomer({
      name,
      email,
      phone,
      password,
      preferredLanguage: LanguageService.getLanguage(),
    });

    StorageService.setSession('customer', newCust);
    onSuccess(newCust);
  };

  const quickDemoLogin = (custIndex: number) => {
    const customers = StorageService.getCustomers();
    const cust = customers[custIndex] || customers[0];
    if (cust) {
      StorageService.setSession('customer', cust);
      onSuccess(cust);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 max-w-md mx-auto w-full animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Pilihan Peranan</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">
            {isRegister ? 'Daftar Pelanggan' : 'Log Masuk Pelanggan'}
          </h2>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Daftar akaun percuma untuk tempah lori ke mana-mana'
              : 'Log masuk untuk melihat tempahan lori anda'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              !isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {LanguageService.t('login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {LanguageService.t('register')}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-400 font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {LanguageService.t('fullName')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cth: Sarah Lee"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {LanguageService.t('email')} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {LanguageService.t('phone')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="012-345 6789"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                {LanguageService.t('password')} *
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setSuccessMsg('Pautan set semula kata laluan telah dihantar ke e-mel anda.')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Lupa kata laluan?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all mt-2"
          >
            {isRegister ? 'Daftar Sekarang' : 'Log Masuk'}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] text-slate-400 text-center font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Pilih Akaun Ujian Segera:</span>
          </div>
          <button
            type="button"
            onClick={() => quickDemoLogin(0)}
            className="w-full py-2 px-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs flex items-center justify-between transition-colors"
          >
            <span className="font-semibold">Sarah Lee (JB - Pejabat)</span>
            <span className="text-[10px] text-blue-400 font-mono">sarah@business.my</span>
          </button>
          <button
            type="button"
            onClick={() => quickDemoLogin(1)}
            className="w-full py-2 px-3 bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs flex items-center justify-between transition-colors"
          >
            <span className="font-semibold">Hasan Enterprise (Klang)</span>
            <span className="text-[10px] text-blue-400 font-mono">hasan@perabot.my</span>
          </button>
        </div>
      </div>
    </div>
  );
};
