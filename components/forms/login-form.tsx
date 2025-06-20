'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, User } from 'lucide-react';
import apiRequest from '@/lib/apiRequest';
import { useAppDispatch } from '@/hooks/useRedux';
import { setLogin } from '@/lib/authSlice';
import { showToast, isValidEmail } from '@/lib/utils';

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

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!formData.email) {
      errs.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Invalid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
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
      dispatch(setLogin({
        user: res.userName,
        token: res.jwtToken,
        refreshToken: res.refreshToken,
        expireIn: (res.expirationTime || 15) * 60 * 1000,
      }));
      showToast({ title: 'Login successful!' });
    } else {
      setErrors({ api: res.error });
      showToast({ title: 'Login failed', description: res.error, type: 'error' });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          label="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          error={errors.email}
        />
        <User className="absolute right-3 top-12 w-5 h-5 text-medium-gray" />
      </div>

      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter your password"
          label="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-12 text-medium-gray hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
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
          <span className="text-medium-gray">Remember me</span>
        </label>
        
        <a
          href="/forgot-password"
          className="text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
