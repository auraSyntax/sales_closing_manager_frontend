'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CardStats } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/hooks/useRedux';
import apiRequest from '@/lib/apiRequest';
import { Building2, Users, TrendingUp } from 'lucide-react';
import { showToast } from '@/lib/utils';

interface DashboardData {
  userName: string;
  profile: string;
  totalCompanies: number;
  activeCompanies: number;
}

const DashboardPage: React.FC = () => {
  const t = useTranslations();
  const { token } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        const res = await apiRequest({
          method: 'get',
          url: '/user/current-user',
          token: token,
        });

        if (!res.error && res.data) {
          setDashboardData(res.data);
        } else {
          showToast({ 
            title: 'Failed to load dashboard data', 
            description: res.error || 'An error occurred', 
            type: 'error' 
          });
        }
      } catch (error) {
        showToast({ 
          title: 'Failed to load dashboard data', 
          description: 'An error occurred', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-primary-dark mb-8">
              {t('dashboard.title')}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="animate-fade-in">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary-dark mb-2">
              {t('dashboard.welcome')}, {dashboardData?.userName || 'User'}!
            </h1>
            <p className="text-lg text-gray-600">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardStats
              title={t('dashboard.totalCompanies')}
              value={dashboardData?.totalCompanies || 0}
              description={t('dashboard.totalCompaniesDesc')}
              icon={<Building2 className="w-6 h-6" />}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            />
            
            <CardStats
              title={t('dashboard.activeCompanies')}
              value={dashboardData?.activeCompanies || 0}
              description={t('dashboard.activeCompaniesDesc')}
              icon={<Users className="w-6 h-6" />}
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
            />
            
            <CardStats
              title={t('dashboard.inactiveCompanies')}
              value={(dashboardData?.totalCompanies || 0) - (dashboardData?.activeCompanies || 0)}
              description={t('dashboard.inactiveCompaniesDesc')}
              icon={<TrendingUp className="w-6 h-6" />}
              className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;