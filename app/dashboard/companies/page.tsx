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
    // Implement delete API call if needed
    // await apiRequest({ method: 'delete', url: `/user/${id}`, token });
    fetchCompanies();
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    // Implement status update API call if needed
    // await apiRequest({ method: 'patch', url: `/user/${id}/status`, data: { status }, token });
    fetchCompanies();
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
            Manage Companies
          </h1>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button 
              onClick={handleAddCompany} 
              className="flex items-center gap-2 animate-slide-up"
              variant="default"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
            
            <div className="flex items-center gap-2 w-full sm:w-auto animate-slide-up">
              <div className="relative flex-1 sm:flex-none">
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-x-1/2 w-4 h-4 text-gray-400" />
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

          {/* Company Modal */}
          <CompanyModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            company={selectedCompany}
            onSave={handleSaveCompany}
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CompaniesPage;