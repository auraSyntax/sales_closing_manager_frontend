import ProtectedRoute from '@/components/ProtectedRoute';
import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CardStats } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <h1 className="text-4xl font-bold text-primary-dark mb-8">
            Welcome, Super Admin
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CardStats
              title="Total Companies"
              value="5"
            />
            <CardStats
              title="Active Companies"
              value="3"
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage;