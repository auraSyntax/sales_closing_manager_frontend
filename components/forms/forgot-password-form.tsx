'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2 } from 'lucide-react';
import apiRequest from '@/lib/apiRequest';
import { showToast, isValidEmail } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; api?: string }>({});
  const router = useRouter();
  const t = useTranslations();

  const validate = () => {
    const errs: { email?: string } = {};
    if (!email) {
      errs.email = t('auth.forgotPassword.emailRequired');
    } else if (!isValidEmail(email)) {
      errs.email = t('auth.forgotPassword.invalidEmail');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const res = await apiRequest({
        method: 'post',
        url: '/auth/forgot-password',
        data: { email },
      });

      if (!res.error) {
        showToast({ title: t('auth.forgotPassword.resetLinkSent') });
        // Show success message - user should check their email
        setIsSubmitted(true);
      } else {
        setErrors({ api: res.error });
        showToast({ 
          title: t('auth.forgotPassword.resetLinkFailed'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: t('auth.forgotPassword.resetLinkFailed'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-lg font-semibold">
          {t('auth.forgotPassword.resetLinkSent')}
        </div>
        <p className="text-medium-gray">
          {t('auth.forgotPassword.resetLinkMessage')} <strong>{email}</strong>
        </p>
        <p className="text-sm text-medium-gray">
          {t('auth.forgotPassword.checkEmailInstructions')}
        </p>
        <a
          href="/login"
          className="inline-block text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          {t('auth.forgotPassword.backToLogin')}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input
          type="email"
          placeholder={t('auth.forgotPassword.emailPlaceholder')}
          label={t('auth.forgotPassword.email')}
          value={email}
          onChange={handleInputChange}
          required
          error={errors.email}
          rightIcon={<Mail className="w-5 h-5 text-medium-gray" />}
        />
      </div>

      {errors.api && (
        <div className="text-red-600 text-sm mt-2">{errors.api}</div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t('auth.forgotPassword.sending')}
          </>
        ) : (
          t('auth.forgotPassword.sendResetLink')
        )}
      </Button>
      
      <div className="text-center">
        <a
          href="/login"
          className="text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          {t('auth.forgotPassword.backToLogin')}
        </a>
      </div>
    </form>
  );
};