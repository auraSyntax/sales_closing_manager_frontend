'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      {/* Optionally, you can redirect to dashboard or show a landing page */}
      {/* For now, redirect to /dashboard */}
      <RedirectToDashboard />
    </ProtectedRoute>
  );
}

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}