import React from 'react';
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-custom border border-light-gray text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-12 h-12 bg-black-ash rounded-full flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
              <path d="M12 16V16.01M12 8V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-black-ash">Sales Closing Manager</h1>
        </div>

        {/* Forgot Password Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-dark-gray">
            Reset your password
          </h2>
          <p className="text-medium-gray mb-7 text-sm leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;