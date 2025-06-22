'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Building2, FileText, KeyRound, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { validateRequiredFields, isValidEmail, isValidPhoneNumber, showToast } from '@/lib/utils';
import apiRequest from '@/lib/apiRequest';
import { useAppSelector } from '@/hooks/useRedux';
import { useTranslations } from 'next-intl';

interface Company {
  id: string;
  name: string;
  email: string;
  contactPersonName: string;
  contactPersonPhone: string;
  status: boolean;
  logoUrl: string;
  sirenNumber: string;
  legalName: string;
  address: string;
  nafCode: string;
  legalStatus: string;
  workforceSize: string;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string; // For update mode, we pass the company ID
  onSave: () => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  companyId,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Company & { 
    password?: string; 
    confirmPassword?: string;
    currentPassword?: string;
  }>>({
    name: '',
    email: '',
    contactPersonName: '',
    contactPersonPhone: '',
    sirenNumber: '',
    legalName: '',
    address: '',
    nafCode: '',
    legalStatus: '',
    workforceSize: '',
    logoUrl: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingCompany, setFetchingCompany] = useState(false);
  const [updatingCredentials, setUpdatingCredentials] = useState(false);

  const isEditMode = !!companyId;
  const token = useAppSelector(state => state.auth.token);
  const t = useTranslations();

  // Helper to reset all modal states
  const resetModalState = () => {
    setFormData({
      name: '',
      email: '',
      contactPersonName: '',
      contactPersonPhone: '',
      sirenNumber: '',
      legalName: '',
      address: '',
      nafCode: '',
      legalStatus: '',
      workforceSize: '',
      logoUrl: '',
      password: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setLogoPreview('');
    setActiveTab('basicInfo');
    setErrors({});
    setLoading(false);
    setFetchingCompany(false);
    setUpdatingCredentials(false);
  };

  // Wrap onClose to also reset state
  const handleModalClose = () => {
    resetModalState();
    onClose();
  };

  // Fetch company data when in edit mode
  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyData();
    } else if (isOpen && !companyId) {
      resetModalState();
    }
  }, [isOpen, companyId]);

  const fetchCompanyData = async () => {
    if (!companyId) return;
    
    setFetchingCompany(true);
    try {
      const res = await apiRequest({
        method: 'get',
        url: `/user/user-by-id?userId=${companyId}`,
        token: token || undefined,
      });
      if (!res.error) {
        const companyData = res;
        setFormData({
          name: companyData.companyName || '',
          email: companyData.email || '',
          contactPersonName: companyData.fullName || '',
          contactPersonPhone: companyData.phoneNo || '',
          sirenNumber: companyData.sirenNumber || '',
          legalName: companyData.legalName || '',
          address: companyData.address || '',
          nafCode: companyData.nafCode || '',
          legalStatus: companyData.legalStatus || '',
          workforceSize: companyData.workForceSize || '',
          logoUrl: companyData.logo || '',
          password: '',
          confirmPassword: '',
          currentPassword: ''
        });
        setLogoPreview(companyData.logo || '');
      } else {
        showToast({ title: t('companies.failedToFetch'), description: res.error, type: 'error' });
        handleModalClose();
      }
    } catch (error) {
      showToast({ title: t('companies.failedToFetch'), description: 'An error occurred', type: 'error' });
      handleModalClose();
    } finally {
      setFetchingCompany(false);
    }
  };

  const requiredFieldsByTab: Record<string, string[]> = {
    basicInfo: ['name', 'contactPersonName', 'contactPersonPhone'],
    detailedInfo: [],
    loginCredentials: isEditMode ? ['email'] : ['email', 'password', 'confirmPassword']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setFormData({
          ...formData,
          logoUrl: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    setLogoPreview('');
    setFormData({
      ...formData,
      logoUrl: ''
    });
  };

  const validateTab = (tab: string) => {
    let tabFields = requiredFieldsByTab[tab] || [];
    let tabErrors = validateRequiredFields(formData, tabFields);
    
    // Special case for password match on loginCredentials tab
    if (tab === 'loginCredentials') {
      if (!isEditMode && formData.password !== formData.confirmPassword) {
        tabErrors.confirmPassword = t('validation.passwordMismatch');
      }
      if (isEditMode && formData.password && formData.password !== formData.confirmPassword) {
        tabErrors.confirmPassword = t('validation.passwordMismatch');
      }
      if (formData.email && !isValidEmail(formData.email)) {
        tabErrors.email = t('validation.invalidEmail');
      }
    }
    if (tab === 'basicInfo') {
      if (formData.contactPersonPhone && !isValidPhoneNumber(formData.contactPersonPhone)) {
        tabErrors.contactPersonPhone = t('validation.invalidPhone');
      }
    }
    setErrors(tabErrors);
    return Object.keys(tabErrors).length === 0;
  };

  const handleNext = () => {
    if (activeTab === 'basicInfo') {
      if (validateTab('basicInfo')) {
        setActiveTab('detailedInfo');
      }
    } else if (activeTab === 'detailedInfo') {
      setActiveTab('loginCredentials');
    }
  };

  const handleBack = () => {
    if (activeTab === 'detailedInfo') {
      setActiveTab('basicInfo');
    } else if (activeTab === 'loginCredentials') {
      setActiveTab('detailedInfo');
    }
  };

  const handleSave = async () => {
    if (!validateTab('loginCredentials')) return;
    
    setLoading(true);
    try {
      // Map formData to API payload
      const payload = {
        ...(isEditMode && { id: companyId }), // Include ID for update
        fullName: formData.contactPersonName,
        companyName: formData.name,
        email: formData.email,
        phoneNo: formData.contactPersonPhone,
        password: formData.password,
        logo: formData.logoUrl,
        sirenNumber: formData.sirenNumber,
        legalName: formData.legalName,
        address: formData.address,
        nafCode: formData.nafCode,
        legalStatus: formData.legalStatus,
        workForceSize: formData.workforceSize
      };

      const res = await apiRequest({
        method: 'post',
        url: '/user',
        data: payload,
        token: token || undefined,
      });

      if (!res.error) {
        showToast({ title: isEditMode ? t('companies.companyUpdated') : t('companies.companyCreated') });
        onSave();
        if (!isEditMode) {
          handleModalClose();
        }
      } else {
        setErrors({ api: res.error });
        showToast({ 
          title: isEditMode ? t('companies.failedToUpdate') : t('companies.failedToCreate'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: isEditMode ? t('companies.failedToUpdate') : t('companies.failedToCreate'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!validateTab('loginCredentials')) return;
    if (!formData.currentPassword || !formData.password || !formData.confirmPassword) {
      setErrors({ 
        currentPassword: t('validation.required'),
        password: t('validation.required'),
        confirmPassword: t('validation.required')
      });
      return;
    }

    setUpdatingCredentials(true);
    try {
      const payload = {
        userId: companyId,
        newEmail: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.password
      };

      const res = await apiRequest({
        method: 'put',
        url: '/user/user-credentials',
        data: payload,
        token: token || undefined,
      });

      if (!res.error) {
        showToast({ title: t('companies.credentialsUpdated') });
        onSave();
        handleModalClose();
      } else {
        setErrors({ api: res.error });
        showToast({ 
          title: t('companies.failedToUpdateCredentials'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: t('companies.failedToUpdateCredentials'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setUpdatingCredentials(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!validateTab('detailedInfo')) return;
    
    setLoading(true);
    try {
      // Map formData to API payload for company update
      const payload = {
        id: companyId,
        fullName: formData.contactPersonName,
        companyName: formData.name,
        email: formData.email,
        phoneNo: formData.contactPersonPhone,
        logo: formData.logoUrl,
        sirenNumber: formData.sirenNumber,
        legalName: formData.legalName,
        address: formData.address,
        nafCode: formData.nafCode,
        legalStatus: formData.legalStatus,
        workForceSize: formData.workforceSize
      };

      const res = await apiRequest({
        method: 'post',
        url: '/user',
        data: payload,
        token: token || undefined,
      });

      if (!res.error) {
        showToast({ title: t('companies.companyUpdated') });
        onSave(); // Refresh the companies list
        // Don't close the modal, let user continue to credentials tab
      } else {
        setErrors({ api: res.error });
        showToast({ 
          title: t('companies.failedToUpdate'), 
          description: res.error, 
          type: 'error' 
        });
      }
    } catch (error) {
      showToast({ 
        title: t('companies.failedToUpdate'), 
        description: 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to add asterisk to required labels
  const labelWithAsterisk = (label: string, field: string, tab: string) => {
    return requiredFieldsByTab[tab]?.includes(field) ? `${label} *` : label;
  };

  // Loading skeleton for form fields
  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isEditMode ? t('companies.updateCompany') : t('companies.addCompany')}
      className="max-w-2xl"
    >
      {fetchingCompany ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-gray-600">{t('common.loading')}</span>
          </div>
        </div>
      ) : (
        <Tabs
          defaultValue="basicInfo"
          value={activeTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent p-0 gap-2">
            <TabsTrigger
              value="basicInfo"
              className={`relative rounded-xl p-4 transition-all duration-300 ${activeTab === 'basicInfo' ? 'bg-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === 'basicInfo' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                  <Building2 size={18} />
                </div>
                <span className="text-sm font-medium">{t('companies.basicInfo.title')}</span>
              </div>
              {activeTab === 'basicInfo' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-blue-500 rounded-t-full" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="detailedInfo"
              className={`relative rounded-xl p-4 transition-all duration-300 ${activeTab === 'detailedInfo' ? 'bg-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === 'detailedInfo' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                  <FileText size={18} />
                </div>
                <span className="text-sm font-medium">{t('companies.detailedInfo.title')}</span>
              </div>
              {activeTab === 'detailedInfo' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-purple-500 rounded-t-full" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="loginCredentials"
              className={`relative rounded-xl p-4 transition-all duration-300 ${activeTab === 'loginCredentials' ? 'bg-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${activeTab === 'loginCredentials' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                  <KeyRound size={18} />
                </div>
                <span className="text-sm font-medium">{t('companies.loginCredentials.title')}</span>
              </div>
              {activeTab === 'loginCredentials' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-green-500 rounded-t-full" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basicInfo" className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Building2 className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">{t('companies.basicInfo.title')}</h3>
              </div>

              <Input
                name="name"
                label={labelWithAsterisk(t('companies.companyName'), 'name', 'basicInfo')}
                placeholder={t('companies.companyName')}
                value={formData.name || ''}
                onChange={handleInputChange}
                icon={<Building2 size={16} className="text-gray-400" />}
                error={errors.name}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="contactPersonName"
                  label={labelWithAsterisk(t('companies.contactPerson'), 'contactPersonName', 'basicInfo')}
                  placeholder={t('companies.contactPerson')}
                  value={formData.contactPersonName || ''}
                  onChange={handleInputChange}
                  error={errors.contactPersonName}
                />

                <Input
                  name="contactPersonPhone"
                  label={labelWithAsterisk(t('companies.contactPhone'), 'contactPersonPhone', 'basicInfo')}
                  placeholder={t('companies.contactPhone')}
                  value={formData.contactPersonPhone || ''}
                  onChange={handleInputChange}
                  error={errors.contactPersonPhone}
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                {logoPreview ? (
                  <div className="relative group">
                    <Image
                      src={logoPreview}
                      alt={t('companies.logo')}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-300 shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={handleDeleteLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-md hover:scale-110"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <Building2 size={24} />
                  </div>
                )}

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {logoPreview ? t('companies.replaceLogo') : t('companies.uploadLogo')}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-200 cursor-pointer text-center"
                    >
                      <span className="text-sm text-gray-600">
                        {logoPreview ? t('companies.replaceLogo') : t('companies.clickToUpload')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detailedInfo" className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 space-y-4 border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="text-purple-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">{t('companies.detailedInfo.title')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="sirenNumber"
                  label={t('companies.detailedInfo.sirenNumber')}
                  placeholder={t('companies.detailedInfo.sirenNumber')}
                  value={formData.sirenNumber || ''}
                  onChange={handleInputChange}
                />

                <Input
                  name="legalName"
                  label={t('companies.detailedInfo.legalName')}
                  placeholder={t('companies.detailedInfo.legalName')}
                  value={formData.legalName || ''}
                  onChange={handleInputChange}
                />
              </div>

              <Input
                name="address"
                label={t('companies.detailedInfo.address')}
                placeholder={t('companies.detailedInfo.address')}
                value={formData.address || ''}
                onChange={handleInputChange}
                fullWidth
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  name="nafCode"
                  label={t('companies.detailedInfo.nafCode')}
                  placeholder={t('companies.detailedInfo.nafCode')}
                  value={formData.nafCode || ''}
                  onChange={handleInputChange}
                />

                <Input
                  name="legalStatus"
                  label={t('companies.detailedInfo.legalStatus')}
                  placeholder={t('companies.detailedInfo.legalStatus')}
                  value={formData.legalStatus || ''}
                  onChange={handleInputChange}
                />

                <Input
                  name="workforceSize"
                  label={t('companies.detailedInfo.workforceSize')}
                  placeholder={t('companies.detailedInfo.workforceSize')}
                  type="number"
                  value={formData.workforceSize || ''}
                  onChange={handleInputChange}
                />
              </div>

              {/* Action buttons for detailed info tab */}
              {isEditMode && (
                <div className="flex justify-center gap-4 pt-4 border-t border-blue-200">
                  <Button 
                    onClick={handleUpdateCompany} 
                    disabled={loading}
                    className="min-w-[140px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t('companies.updateCompany')}
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="min-w-[120px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="loginCredentials" className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 space-y-4 border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <KeyRound className="text-green-500" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">{t('companies.loginCredentials.title')}</h3>
              </div>

              {isEditMode ? (
                // Update credentials form - empty fields for user to fill
                <div className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    label={labelWithAsterisk(t('companies.companyEmail'), 'email', 'loginCredentials')}
                    placeholder={t('companies.companyEmail')}
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    icon={<span className="text-gray-400">@</span>}
                    fullWidth
                    error={errors.email}
                  />

                  <Input
                    name="currentPassword"
                    type="password"
                    label={labelWithAsterisk(t('companies.loginCredentials.currentPassword'), 'currentPassword', 'loginCredentials')}
                    placeholder={t('companies.loginCredentials.currentPassword')}
                    value={formData.currentPassword || ''}
                    onChange={handleInputChange}
                    icon={<KeyRound size={16} className="text-gray-400" />}
                    error={errors.currentPassword}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="password"
                      type="password"
                      label={labelWithAsterisk(t('companies.loginCredentials.newPassword'), 'password', 'loginCredentials')}
                      placeholder={t('companies.loginCredentials.newPassword')}
                      icon={<KeyRound size={16} className="text-gray-400" />}
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      error={errors.password}
                    />

                    <Input
                      name="confirmPassword"
                      type="password"
                      label={labelWithAsterisk(t('companies.loginCredentials.confirmPassword'), 'confirmPassword', 'loginCredentials')}
                      placeholder={t('companies.loginCredentials.confirmPassword')}
                      icon={<KeyRound size={16} className="text-gray-400" />}
                      value={formData.confirmPassword || ''}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                    />
                  </div>
                </div>
              ) : (
                // Create credentials form
                <>
                  <Input
                    name="email"
                    type="email"
                    label={labelWithAsterisk(t('companies.companyEmail'), 'email', 'loginCredentials')}
                    placeholder={t('companies.companyEmail')}
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    icon={<span className="text-gray-400">@</span>}
                    fullWidth
                    error={errors.email}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="password"
                      type="password"
                      label={labelWithAsterisk(t('companies.loginCredentials.password'), 'password', 'loginCredentials')}
                      placeholder={t('companies.loginCredentials.createPassword')}
                      icon={<KeyRound size={16} className="text-gray-400" />}
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      error={errors.password}
                    />

                    <Input
                      name="confirmPassword"
                      type="password"
                      label={labelWithAsterisk(t('companies.loginCredentials.confirmPassword'), 'confirmPassword', 'loginCredentials')}
                      placeholder={t('companies.loginCredentials.confirmPasswordPlaceholder')}
                      icon={<KeyRound size={16} className="text-gray-400" />}
                      value={formData.confirmPassword || ''}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                    />
                  </div>
                </>
              )}
              
              {errors.api && (
                <div className="text-red-600 text-sm mt-2">{errors.api}</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
        {activeTab === 'detailedInfo' && !isEditMode && (
          <Button variant="outline" onClick={handleBack} className="min-w-[120px]">{t('common.back')}</Button>
        )}
        {activeTab === 'loginCredentials' && (
          <Button variant="outline" onClick={handleBack} className="min-w-[120px]">{t('common.back')}</Button>
        )}
        {activeTab === 'basicInfo' && (
          <Button onClick={handleNext} className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">{t('common.next')}</Button>
        )}
        {activeTab === 'detailedInfo' && !isEditMode && (
          <Button onClick={handleNext} className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">{t('common.next')}</Button>
        )}
        {activeTab === 'loginCredentials' && (
          <div className="flex gap-2">
            {isEditMode ? (
              <Button 
                onClick={handleUpdateCredentials} 
                disabled={updatingCredentials}
                className="min-w-[140px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {updatingCredentials ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('companies.updateCredentials')}
              </Button>
            ) : (
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('companies.addCompany')}
              </Button>
            )}
          </div>
        )}
        {activeTab === 'basicInfo' && (
          <Button variant="outline" onClick={handleModalClose} className="min-w-[120px] hover:bg-gray-100 hover:shadow-sm transition-all duration-200">{t('common.cancel')}</Button>
        )}
      </div>
    </Modal>
  );
};