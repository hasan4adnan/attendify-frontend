'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import { useUser } from '../context/UserContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Strictly check authentication - redirect immediately if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0046FF] mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Strictly block dashboard access if not authenticated
  // Return null to prevent any rendering while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}

