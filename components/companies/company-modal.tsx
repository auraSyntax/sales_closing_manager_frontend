'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { X, Building2, FileText, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { validateRequiredFields, isValidEmail, isValidPhoneNumber, showToast } from '@/lib/utils';
import apiRequest from '@/lib/apiRequest';
import { useAppSelector } from '@/hooks/useRedux';

interface Company {
  id: number;
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
  company?: Company;
  onSave: (company: Partial<Company>) => void;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Company & { password?: string; confirmPassword?: string }>>({
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
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!company;
  const token = useAppSelector(state => state.auth.token);

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
      confirmPassword: ''
    });
    setLogoPreview('');
    setActiveTab('basicInfo');
    setErrors({});
  };

  // Wrap onClose to also reset state
  const handleModalClose = () => {
    resetModalState();
    onClose();
  };

  useEffect(() => {
    if (company) {
      setFormData(company);
      setLogoPreview(company.logoUrl);
    } else {
      resetModalState();
    }
    setActiveTab('basicInfo');
    setErrors({});
  }, [company]);

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
        tabErrors.confirmPassword = 'Passwords do not match';
      }
      if (formData.email && !isValidEmail(formData.email)) {
        tabErrors.email = 'Invalid email address';
      }
    }
    if (tab === 'basicInfo') {
      if (formData.contactPersonPhone && !isValidPhoneNumber(formData.contactPersonPhone)) {
        tabErrors.contactPersonPhone = 'Invalid phone number';
      }
    }
    setErrors(tabErrors);
    return Object.keys(tabErrors).length === 0;
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      if (activeTab === 'basicInfo') setActiveTab('detailedInfo');
      else if (activeTab === 'detailedInfo') setActiveTab('loginCredentials');
    }
  };

  const handleBack = () => {
    if (activeTab === 'detailedInfo') setActiveTab('basicInfo');
    else if (activeTab === 'loginCredentials') setActiveTab('detailedInfo');
  };

  const handleSave = async () => {
    if (!validateTab('loginCredentials')) return;
    // Map formData to API payload
    const payload = {
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
      onSave(formData);
      showToast({ title: 'Company created successfully!' });
      onClose();
    } else {
      setErrors({ api: res.error });
      showToast({ title: 'Failed to create company', description: res.error, type: 'error' });
    }
  };

  // Helper to add asterisk to required labels
  const labelWithAsterisk = (label: string, field: string, tab: string) => {
    return requiredFieldsByTab[tab]?.includes(field) ? `${label} *` : label;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isEditMode ? 'Update Company' : 'Add Company'}
      className="max-w-2xl"
    >
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
              <span className="text-sm font-medium">Basic Info</span>
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
              <span className="text-sm font-medium">Details</span>
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
              <span className="text-sm font-medium">Credentials</span>
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
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
            </div>

            <Input
              name="name"
              label={labelWithAsterisk('Company Name', 'name', 'basicInfo')}
              placeholder="Company Name"
              value={formData.name || ''}
              onChange={handleInputChange}
              icon={<Building2 size={16} className="text-gray-400" />}
              error={errors.name}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="contactPersonName"
                label={labelWithAsterisk('Contact Person', 'contactPersonName', 'basicInfo')}
                placeholder="Contact Person Name"
                value={formData.contactPersonName || ''}
                onChange={handleInputChange}
                error={errors.contactPersonName}
              />

              <Input
                name="contactPersonPhone"
                label={labelWithAsterisk('Phone Number', 'contactPersonPhone', 'basicInfo')}
                placeholder="Contact Person Phone"
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
                    alt="Company Logo"
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
                  {logoPreview ? 'Upload New Logo' : 'Upload Company Logo'}
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
                      {logoPreview ? 'Replace Logo' : 'Click to Upload Logo'}
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
              <h3 className="text-lg font-semibold text-gray-800">Detailed Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="sirenNumber"
                label="SIREN Number"
                placeholder="SIREN Number"
                value={formData.sirenNumber || ''}
                onChange={handleInputChange}
              />

              <Input
                name="legalName"
                label="Legal Name"
                placeholder="Legal Name"
                value={formData.legalName || ''}
                onChange={handleInputChange}
              />
            </div>

            <Input
              name="address"
              label="Address"
              placeholder="Company Address"
              value={formData.address || ''}
              onChange={handleInputChange}
              fullWidth
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                name="nafCode"
                label="NAF Code"
                placeholder="NAF Code"
                value={formData.nafCode || ''}
                onChange={handleInputChange}
              />

              <Input
                name="legalStatus"
                label="Legal Status"
                placeholder="Legal Status"
                value={formData.legalStatus || ''}
                onChange={handleInputChange}
              />

              <Input
                name="workforceSize"
                label="Workforce Size"
                placeholder="Workforce Size"
                type="number"
                value={formData.workforceSize || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="loginCredentials" className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 space-y-4 border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <KeyRound className="text-green-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Login Credentials</h3>
            </div>

            <Input
              name="email"
              type="email"
              label={labelWithAsterisk('Company Email', 'email', 'loginCredentials')}
              placeholder="Company Email"
              value={formData.email || ''}
              onChange={handleInputChange}
              icon={<span className="text-gray-400">@</span>}
              fullWidth
              error={errors.email}
            />

            {!isEditMode && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="password"
                  type="password"
                  label={labelWithAsterisk('Password', 'password', 'loginCredentials')}
                  placeholder="Create Password"
                  icon={<KeyRound size={16} className="text-gray-400" />}
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  error={errors.password}
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label={labelWithAsterisk('Confirm Password', 'confirmPassword', 'loginCredentials')}
                  placeholder="Confirm Password"
                  icon={<KeyRound size={16} className="text-gray-400" />}
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                />
              </div>
            )}
            {errors.api && (
              <div className="text-red-600 text-sm mt-2">{errors.api}</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
        {activeTab === 'detailedInfo' && (
          <Button variant="outline" onClick={handleBack} className="min-w-[120px]">Back</Button>
        )}
        {activeTab === 'loginCredentials' && (
          <Button variant="outline" onClick={handleBack} className="min-w-[120px]">Back</Button>
        )}
        {activeTab === 'basicInfo' && (
          <Button onClick={handleNext} className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">Next</Button>
        )}
        {activeTab === 'detailedInfo' && (
          <Button onClick={handleNext} className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">Next</Button>
        )}
        {activeTab === 'loginCredentials' && (
          <Button onClick={handleSave} className="min-w-[120px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">{isEditMode ? 'Update Company' : 'Save Company'}</Button>
        )}
        {activeTab === 'basicInfo' && (
          <Button variant="outline" onClick={handleModalClose} className="min-w-[120px] hover:bg-gray-100 hover:shadow-sm transition-all duration-200">Cancel</Button>
        )}
      </div>
    </Modal>
  );
};