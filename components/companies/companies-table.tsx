'use client';

import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ToggleSwitch } from '@/components/ui/toggle';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Eye, Trash2 } from 'lucide-react';

interface Company {
  id: string;
  logo?: string;
  companyName: string;
  companyEmail: string;
  contactPerson: string;
  contactPhone: string;
  status: number;
}

interface CompaniesTableProps {
  companies: Company[];
  loading: boolean;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: boolean) => void;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  loading,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [companyToDelete, setCompanyToDelete] = React.useState<Company | null>(null);

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (companyToDelete) {
      onDelete(companyToDelete.id);
      setCompanyToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCompanyToDelete(null);
  };

  const renderLogo = (company: Company) => {
    if (company.logo) {
      return (
        <img
          src={company.logo}
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover shadow-md transition-transform duration-200 hover:scale-110"
        />
      );
    } else if (company.companyName) {
      const initials = company.companyName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="w-10 h-10 bg-dark-ash-button text-white font-bold rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-110">
          {initials}
        </div>
      );
    } else {
      return null;
    }
  };

  // Skeleton rows
  const skeletonRows = Array.from({ length: 10 });

  return (
    <>
      <div className="overflow-y-auto max-h-[520px] min-h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>No</TableCell>
              <TableCell isHeader>Logo</TableCell>
              <TableCell isHeader>Company Name</TableCell>
              <TableCell isHeader>Company Email</TableCell>
              <TableCell isHeader className="hidden md:table-cell">Contact Person</TableCell>
              <TableCell isHeader className="hidden md:table-cell">Contact Phone</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader className="text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              skeletonRows.map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell><div className="h-4 bg-gray-200 rounded w-6" /></TableCell>
                  <TableCell><div className="w-10 h-10 bg-gray-200 rounded-full" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-24" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-10" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-16 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">No data found.</TableCell>
              </TableRow>
            ) : (
              companies.map((company, index) => (
                <TableRow key={company.id} className="animate-fade-in">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{renderLogo(company)}</TableCell>
                  <TableCell className="font-medium">{company.companyName}</TableCell>
                  <TableCell>{company.companyEmail}</TableCell>
                  <TableCell className="hidden md:table-cell">{company.contactPerson}</TableCell>
                  <TableCell className="hidden md:table-cell">{company.contactPhone}</TableCell>
                  <TableCell>
                    <ToggleSwitch
                      checked={company.status === 1}
                      onChange={(status) => onStatusChange(company.id, status)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(company)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(company)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.companyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};