'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-8 h-8 text-red-500" />,
          confirmButton: 'destructive',
          titleColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          confirmButton: 'secondary',
          titleColor: 'text-yellow-600'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
          confirmButton: 'default',
          titleColor: 'text-blue-600'
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          confirmButton: 'destructive',
          titleColor: 'text-red-600'
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
          {icon || variantStyles.icon}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${variantStyles.titleColor}`}>
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variantStyles.confirmButton as any}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 