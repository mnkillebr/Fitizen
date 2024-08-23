import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Define the shape of our context
interface DialogContextType {
  isOpen: boolean;
  openDialog: (content: ReactNode, title: string) => void;
  closeDialog: () => void;
  dialogContent: ReactNode | null;
}

// Create the context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Create a provider component
export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string | null>(null);

  const openDialog = (content: ReactNode, title: string) => {
    setDialogContent(content);
    setDialogTitle(title);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogContent(null);
    setDialogTitle(null);
  };

  return (
    <DialogContext.Provider value={{ isOpen, openDialog, closeDialog, dialogContent }}>
      {children}
      <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between mb-3">
              <DialogTitle className="font-bold">{dialogTitle}</DialogTitle>
              <button
                onClick={closeDialog}
                className="size-6 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon />
              </button>
            </div>
            {dialogContent}
          </DialogPanel>
        </div>
      </Dialog>
    </DialogContext.Provider>
  );
};

// Custom hooks to use the dialog
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const useOpenDialog = () => {
  const { openDialog } = useDialog();
  return openDialog;
};

export const useCloseDialog = () => {
  const { closeDialog } = useDialog();
  return closeDialog;
};
