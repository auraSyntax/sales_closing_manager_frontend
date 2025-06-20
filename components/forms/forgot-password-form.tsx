'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-lg font-semibold">
          Reset link sent!
        </div>
        <p className="text-medium-gray">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <a
          href="/login"
          className="inline-block text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          ← Back to login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        placeholder="Enter your email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" className="w-full">
        Send Reset Link
      </Button>
      
      <div className="text-center">
        <a
          href="/login"
          className="text-dark-gray font-medium hover:text-black-ash hover:underline transition-colors"
        >
          ← Back to login
        </a>
      </div>
    </form>
  );
};