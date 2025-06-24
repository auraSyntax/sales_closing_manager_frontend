'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, User } from 'lucide-react';
import apiRequest from '@/lib/apiRequest';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setLogin } from '@/lib/authSlice';
import { showToast, isValidEmail } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const t = useTranslations();

  // Redirect if user is already logged in
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!formData.email) {
      errs.email = t('auth.login.emailRequired');
    } else if (!isValidEmail(formData.email)) {
      errs.email = t('auth.login.invalidEmail');
    }
    if (!formData.password) {
      errs.password = t('auth.login.passwordRequired');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    const res = await apiRequest({
      method: 'post',
      url: '/auth/login',
      data: { email: formData.email, password: formData.password },
    });
    setLoading(false);
    if (!res.error) {
      // Set rememberMe cookie for Redux Persist storage selection
      document.cookie = `rememberMe=${rememberMe}; path=/`;
      dispatch(setLogin({
        user: {
          name: res.userName,
          email: res.email,
          userType: res.userType,
          profile: res.profile
        },
        token: res.jwtToken,
        refreshToken: res.refreshToken,
        expireIn: (res.expirationTime || 15) * 60 * 1000,
      }));
      showToast({ title: t('auth.login.loginSuccessful') });
      // Force reload to re-initialize Redux Persist with correct storage
      window.location.reload();
    } else {
      setErrors({ api: res.error });
      showToast({ title: t('auth.login.loginFailed'), description: res.error, type: 'error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Don't render form if user is already logged in
  if (token) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input
          type="email"
          name="email"
          placeholder={t('auth.login.emailPlaceholder')}
          label={t('auth.login.email')}
          value={formData.email}
          onChange={handleInputChange}
          required
          error={errors.email}
          rightIcon={<User className="w-5 h-5 text-medium-gray" />}
        />
      </div>

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          label={t('auth.login.password')}
          value={formData.password}
          onChange={handleInputChange}
          required
          error={errors.password}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-medium-gray hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />
      </div>

      {errors.api && (
        <div className="text-red-600 text-sm mt-2">{errors.api}</div>
      )}

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300 text-black-ash focus:ring-black-ash"
          />
          <span className="text-medium-gray">{t('auth.login.rememberMe')}</span>
        </label>
        
        <a
          href="/forgot-password"
          className="text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          {t('auth.login.forgotPassword')}
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
      </Button>
    </form>
  );
};
