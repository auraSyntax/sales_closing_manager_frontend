'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Trash2, AlertTriangle, Info } from 'lucide-react';

// Example component showing different ways to use the ConfirmationModal
export const ConfirmationModalExample: React.FC = () => {
  const [dangerModalOpen, setDangerModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleDangerConfirm = () => {
    console.log('Danger action confirmed');
    // Perform dangerous action here
  };

  const handleWarningConfirm = () => {
    console.log('Warning action confirmed');
    // Perform warning action here
  };

  const handleInfoConfirm = () => {
    console.log('Info action confirmed');
    // Perform info action here
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Confirmation Modal Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        {/* Danger Modal Example */}
        <Button
          variant="destructive"
          onClick={() => setDangerModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Item
        </Button>

        {/* Warning Modal Example */}
        <Button
          variant="secondary"
          onClick={() => setWarningModalOpen(true)}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Archive Item
        </Button>

        {/* Info Modal Example */}
        <Button
          variant="outline"
          onClick={() => setInfoModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Info className="w-4 h-4" />
          Publish Item
        </Button>
      </div>

      {/* Danger Confirmation Modal */}
      <ConfirmationModal
        isOpen={dangerModalOpen}
        onClose={() => setDangerModalOpen(false)}
        onConfirm={handleDangerConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone and will permanently remove the item from the system."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Warning Confirmation Modal */}
      <ConfirmationModal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        onConfirm={handleWarningConfirm}
        title="Archive Item"
        message="This will archive the item. You can restore it later from the archive section."
        confirmText="Archive"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Info Confirmation Modal */}
      <ConfirmationModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onConfirm={handleInfoConfirm}
        title="Publish Item"
        message="This will make the item visible to all users. Are you ready to publish?"
        confirmText="Publish"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
};

// Usage instructions as comments:
/*
How to use the ConfirmationModal component:

1. Import the component:
   import { ConfirmationModal } from '@/components/ui/confirmation-modal';

2. Add state management:
   const [modalOpen, setModalOpen] = useState(false);

3. Create handler functions:
   const handleConfirm = () => {
     // Your confirmation logic here
     console.log('Action confirmed');
   };

4. Add the modal to your JSX:
   <ConfirmationModal
     isOpen={modalOpen}
     onClose={() => setModalOpen(false)}
     onConfirm={handleConfirm}
     title="Your Title"
     message="Your confirmation message"
     confirmText="Confirm"
     cancelText="Cancel"
     variant="danger" // or "warning" or "info"
   />

5. Trigger the modal:
   <Button onClick={() => setModalOpen(true)}>
     Open Modal
   </Button>

Available props:
- isOpen: boolean - Controls modal visibility
- onClose: () => void - Function called when modal is closed
- onConfirm: () => void - Function called when user confirms
- title: string - Modal title (optional, defaults to "Confirm Action")
- message: string - Modal message (optional, defaults to generic message)
- confirmText: string - Confirm button text (optional, defaults to "Confirm")
- cancelText: string - Cancel button text (optional, defaults to "Cancel")
- variant: 'danger' | 'warning' | 'info' - Modal style variant (optional, defaults to "danger")
- icon: React.ReactNode - Custom icon (optional, uses default based on variant)
*/ 