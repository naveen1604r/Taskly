import React, { useState, useEffect } from 'react';
import { useSettingsContext } from '../../context/SettingsContext';
import Button from '../common/Button';
import Card from '../common/Card';
import { User, Mail, Upload, Trash2, Check, AlertCircle } from 'lucide-react';

const PROFILE_STORAGE_KEY = 'user_profile';
const DEFAULT_PROFILE = {
  name: 'User',
  email: 'user@example.com',
  avatar: null,
};

// Helper to load profile data from localStorage with fallback defaults
const loadProfileFromStorage = () => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name ?? DEFAULT_PROFILE.name,
        email: parsed.email ?? DEFAULT_PROFILE.email,
        avatar: parsed.avatar ?? DEFAULT_PROFILE.avatar,
      };
    }
  } catch (err) {
    console.error('Failed to load profile from localStorage:', err);
  }
  return DEFAULT_PROFILE;
};

export default function ProfileSettings() {
  const { settings, updateProfile } = useSettingsContext() || {};

  // Initialize state directly from localStorage or fall back to defaults
  const [initialProfile] = useState(() => {
    const stored = loadProfileFromStorage();
    // Also consider settings.profile if available and not default
    if (stored.name === DEFAULT_PROFILE.name && settings?.profile?.name && settings.profile.name !== 'User') {
      return {
        name: settings.profile.name,
        email: settings.profile.email || DEFAULT_PROFILE.email,
        avatar: settings.profile.avatar || null,
      };
    }
    return stored;
  });

  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [avatar, setAvatar] = useState(initialProfile.avatar);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if settings context loads later
  useEffect(() => {
    if (settings?.profile?.name && settings.profile.name !== 'User') {
      setName(settings.profile.name);
      if (settings.profile.email) setEmail(settings.profile.email);
      if (settings.profile.avatar) setAvatar(settings.profile.avatar);
    }
  }, [settings?.profile]);

  // Handle avatar file upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Maximum image size is 2MB.');
      return;
    }

    // Check format
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Supported formats are PNG, JPG, and WEBP.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  // Save profile to localStorage and context
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    const updatedProfile = {
      name: name.trim(),
      email: email.trim() || DEFAULT_PROFILE.email,
      avatar,
    };

    try {
      // 1. Persist to localStorage so data survives page refreshes
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));

      // 2. Update application-wide context if available
      if (updateProfile) {
        updateProfile(updatedProfile);
      }

      setError('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save to local storage.');
    }
  };

  // Extract initials for live preview avatar
  const displayName = name.trim() || DEFAULT_PROFILE.name;
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">Profile Settings</h3>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Manage your personal workspace identity and profile display.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Your Name <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="User"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="user@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#171C27] text-white placeholder-slate-500 rounded-xl border border-white/[0.08] focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Profile Avatar <span className="text-[11px] text-slate-500 font-normal lowercase">(max 2MB)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#171C27] hover:bg-[#1f2635] text-slate-200 hover:text-white border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Upload Avatar</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 border border-[#EF4444]/20 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}

          {savedSuccess && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>Profile changes saved to localStorage!</span>
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>

        {/* Live Profile Preview Card (1 column) */}
        <Card className="flex flex-col items-center justify-center text-center p-6 bg-[#171C27]/50 border-white/[0.06]">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-4">
            Live Preview
          </span>

          <div className="relative mb-3">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile Avatar Preview"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#7C3AED]/40 shadow-hover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg ring-2 ring-white/10">
                {initials}
              </div>
            )}
          </div>

          <h4 className="text-base font-bold text-white tracking-tight">
            {displayName}
          </h4>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {email.trim() || DEFAULT_PROFILE.email}
          </p>
        </Card>
      </div>
    </div>
  );
}
