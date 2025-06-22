'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';
import { useAppSelector } from '@/hooks/useRedux';
import { useTranslations } from 'next-intl';

const LoginPage: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const t = useTranslations();

  // Redirect if user is already logged in
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);

  // Don't render if user is logged in
  if (token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-custom border border-light-gray">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black-ash rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
              <path d="M12 16V16.01M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-black-ash">{t('common.appName')}</h1>
        </div>

        {/* Login Form */}
        <div>
          <h2 className="text-xl font-semibold text-center mb-7 text-dark-gray">
            {t('auth.login.title')}
          </h2>
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-light-gray">
          <p className="text-medium-gray text-sm">
            © {new Date().getFullYear()} {t('common.appName')}. {t('common.allRightsReserved')}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;