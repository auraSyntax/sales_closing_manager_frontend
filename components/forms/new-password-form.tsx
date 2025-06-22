'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import apiRequest from '@/lib/apiRequest';
import { showToast } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export const NewPasswordForm: React.FC = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Get reset token from URL
  const resetToken = searchParams.get('token');

  useEffect(() => {
    // Check if user has a valid reset token
    if (!resetToken) {
      showToast({ 
        title: t('auth.newPassword.invalidAccess'), 
        description: t('auth.newPassword.invalidAccessDesc'), 
        type: 'error' 
      });
      router.push('/forgot-password');
      return;
    }
    setIsValidToken(true);
  }, [resetToken, router, t]);

  const validatePasswords = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('auth.newPassword.passwordTooShort');
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.newPassword.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    
    setLoading(true);
    
    try {
      const res = await apiRequest({
        method: 'post',
        url: '/auth/reset-password',
        data: {
          resetToken,
          newPassword: formData.newPassword
        },
      });

      if (!res.error) {
        showToast({ title: t('auth.newPassword.passwordUpdated') });
        // Navigate to login
        router.push('/login');
      } else {
        setErrors({ api: res.error });
        showToast({ 
          title: t('auth.newPassword.passwordUpdateFailed'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: t('auth.newPassword.passwordUpdateFailed'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const isFormValid = formData.newPassword.length >= 8 && 
                     formData.newPassword === formData.confirmPassword &&
                     !loading;

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input
          type={showNewPassword ? 'text' : 'password'}
          name="newPassword"
          placeholder={t('auth.newPassword.newPasswordPlaceholder')}
          label={t('auth.newPassword.newPassword')}
          value={formData.newPassword}
          onChange={handleInputChange}
          error={errors.newPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 top-12 text-medium-gray hover:text-gray-700"
        >
          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <div className="mt-2 text-xs text-medium-gray">
          {t('auth.newPassword.passwordHint')}
        </div>
      </div>

      <div className="relative">
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder={t('auth.newPassword.confirmPasswordPlaceholder')}
          label={t('auth.newPassword.confirmPassword')}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-12 text-medium-gray hover:text-gray-700"
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
          <div className="mt-2 text-xs text-green-600">
            {t('auth.newPassword.passwordsMatch')}
          </div>
        )}
      </div>

      {errors.api && (
        <div className="text-red-600 text-sm mt-2">{errors.api}</div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!isFormValid}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t('auth.newPassword.updating')}
          </>
        ) : (
          t('auth.newPassword.setPassword')
        )}
      </Button>
    </form>
  );
};