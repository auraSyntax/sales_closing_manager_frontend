'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CompaniesTable } from '@/components/companies/companies-table';
import { CompanyModal } from '@/components/companies/company-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import apiRequest from '@/lib/apiRequest';
import { useAppSelector } from '@/hooks/useRedux';
import { showToast } from '@/lib/utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useTranslations } from 'next-intl';

const PAGE_SIZE = 10;

const CompaniesPage: React.FC = () => {
  const token = useAppSelector(state => state.auth.token);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState<{ id: string; status: boolean; companyName: string } | null>(null);
  const t = useTranslations();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const params: any = { page, size: PAGE_SIZE };
    if (searchTerm) params.search = searchTerm;
    const res = await apiRequest({
      method: 'get',
      url: '/user',
      params,
      token: token || undefined,
    });
    setLoading(false);
    if (res && res.data) {
      setCompanies(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      setCompanies([]);
      setTotalPages(1);
    }
  }, [page, searchTerm, token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleAddCompany = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const res = await apiRequest({
        method: 'delete',
        url: `/user/${id}`,
        token: token || undefined,
      });
      if (!res.error) {
        showToast({ title: t('companies.companyDeleted') });
        fetchCompanies(); // Refresh table
      } else {
        showToast({ title: t('companies.failedToDelete'), description: res.error, type: 'error' });
      }
    } catch (error) {
      showToast({ title: t('companies.failedToDelete'), description: 'An error occurred', type: 'error' });
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    // Store the status change data for confirmation
    const company = companies.find(c => c.id === id);
    if (company) {
      setStatusChangeData({ id, status, companyName: company.companyName });
      setStatusModalOpen(true);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChangeData) return;
    
    try {
      const res = await apiRequest({
        method: 'put',
        url: `/user?id=${statusChangeData.id}&status=${statusChangeData.status ? 1 : 0}`,
        token: token || undefined,
      });
      if (!res.error) {
        showToast({ 
          title: statusChangeData.status ? t('companies.companyActivated') : t('companies.companyDeactivated')
        });
        fetchCompanies(); // Refresh table
      } else {
        showToast({ 
          title: t('companies.failedToUpdateStatus'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: t('companies.failedToUpdateStatus'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    }
    
    setStatusModalOpen(false);
    setStatusChangeData(null);
  };

  const cancelStatusChange = () => {
    setStatusModalOpen(false);
    setStatusChangeData(null);
  };

  const handleSaveCompany = () => {
    setIsModalOpen(false);
    fetchCompanies(); // Refresh after create
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-primary-dark mb-8">
            {t('companies.title')}
          </h1>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button 
              onClick={handleAddCompany} 
              className="flex items-center gap-2 animate-slide-up"
              variant="default"
            >
              <Plus className="w-4 h-4" />
              {t('companies.addCompany')}
            </Button>
            
            <div className="flex items-center gap-2 w-full sm:w-auto animate-slide-up">
              <div className="relative flex-1 sm:flex-none">
                <Input
                  type="text"
                  placeholder={t('companies.searchCompanies')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="animate-slide-up">
            <CompaniesTable
              companies={companies}
              loading={loading}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8 animate-slide-up">
            <Button variant="outline" size="sm" className="pagination-enhanced" onClick={() => setPage(1)} disabled={page === 1}>
              &#8249;&#8249;
            </Button>
            {[...Array(totalPages)].map((_, idx) => (
              <Button
                key={idx + 1}
                variant="outline"
                size="sm"
                className={`pagination-enhanced${page === idx + 1 ? ' pagination-active' : ''}`}
                onClick={() => setPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="pagination-enhanced" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
              &#8250;&#8250;
            </Button>
          </div>

          {/* Status Change Confirmation Modal */}
          <ConfirmationModal
            isOpen={statusModalOpen}
            onClose={cancelStatusChange}
            onConfirm={confirmStatusChange}
            title={statusChangeData?.status ? t('companies.activateCompany') : t('companies.deactivateCompany')}
            message={`${statusChangeData?.status ? t('companies.activateConfirmation') : t('companies.deactivateConfirmation')} "${statusChangeData?.companyName}"?`}
            confirmText={statusChangeData?.status ? t('companies.activateCompany') : t('companies.deactivateCompany')}
            cancelText={t('common.cancel')}
            variant="info"
          />

          {/* Company Modal */}
          <CompanyModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            companyId={selectedCompany?.id}
            onSave={handleSaveCompany}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CompaniesPage;