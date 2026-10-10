'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/translations';
import { api } from '../../lib/api';
import { Address } from '../../types';
import {
  User,
  MapPin,
  Lock,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout, language } = useStore();
  const t = translations[language];

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    street: '',
    city: 'Cairo',
    country: 'Egypt',
    isDefault: true,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setName(user.name);
    setPhone(user.phone || '');

    async function loadAddresses() {
      try {
        const res = await api.getAddresses();
        if (res.data) setAddresses(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadAddresses();
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      setProfileLoading(true);
      const res = await api.updateProfile({ name, phone });
      if (res.data) {
        setUser({ ...user!, name: res.data.name, phone: res.data.phone });
        setProfileMsg(language === 'ar' ? 'تم تحديث البيانات بنجاح' : 'Profile updated successfully');
      }
    } catch (err: any) {
      setProfileMsg('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordErr(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(addressForm);
      if (res.data) {
        setAddresses([res.data, ...addresses]);
        setShowAddressModal(false);
      }
    } catch (e) {
      alert('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (e) {
      alert('Failed to delete address');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="py-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.profile}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-black text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>{language === 'ar' ? 'المعلومات الشخصية' : 'Personal Details'}</span>
          </div>

          {profileMsg && (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-500 mb-1">{t.recipientName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">{t.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-black text-sm">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</span>
          </div>

          {passwordMsg && (
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passwordMsg}</span>
            </div>
          )}
          {passwordErr && (
            <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordErr}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-slate-500 mb-1">
                {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
            >
              {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{t.addresses}</span>
          </div>

          <button
            onClick={() => setShowAddressModal(!showAddressModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة عنوان' : 'Add Address'}</span>
          </button>
        </div>

        {/* Add Address Form Accordion */}
        {showAddressModal && (
          <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Label (e.g. Home, Work)"
                required
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
              />
              <input
                type="text"
                placeholder="Recipient Name"
                required
                value={addressForm.recipientName}
                onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
              />
              <input
                type="text"
                placeholder="Street Address"
                required
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
              />
              <input
                type="text"
                placeholder="City"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Save Address
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between"
            >
              <div>
                <span className="font-bold text-xs text-blue-600 block mb-1">{addr.label}</span>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-100">{addr.recipientName}</p>
                <p className="text-xs text-slate-500 mt-1">{addr.street}, {addr.city}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{addr.phone}</p>
              </div>

              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
