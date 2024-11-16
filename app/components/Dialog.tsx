import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

// Enhanced interface for dialog options
interface DialogOptions {
  title?: {
    text: string;
    className?: string;
  };
  closeButton?: {
    show?: boolean;
    className?: string;
    icon?: ReactNode;
  };
  panelClassName?: string;
  allowOverflow?: boolean; // New option
}

// Define the shape of our context
interface DialogContextType {
  isOpen: boolean;
  openDialog: (content: ReactNode, options?: DialogOptions) => void;
  closeDialog: () => void;
  dialogContent: ReactNode | null;
}

// Create the context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Create a provider component
export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null);

  const openDialog = (content: ReactNode, options?: DialogOptions) => {
    setDialogContent(content);
    setDialogOptions(options || null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogContent(null);
    setDialogOptions(null);
  };

  const renderHeader = () => {
    if (!dialogOptions?.title && !dialogOptions?.closeButton?.show) {
      return null;
    }

    return (
      <div className="flex justify-between mb-3">
        {dialogOptions?.title && (
          <DialogTitle 
            className={clsx(
              "font-bold",
              dialogOptions.title.className
            )}
          >
            {dialogOptions.title.text}
          </DialogTitle>
        )}
        {dialogOptions?.closeButton?.show && (
          <button
            onClick={closeDialog}
            className={clsx(
              "size-6 text-gray-400 hover:text-gray-500",
              dialogOptions.closeButton.className
            )}
          >
            {dialogOptions.closeButton.icon || <XMarkIcon />}
          </button>
        )}
      </div>
    );
  };

  return (
    <DialogContext.Provider value={{ isOpen, openDialog, closeDialog, dialogContent }}>
      {children}
      <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            className={clsx(
              "w-fit max-w-[408px] md:max-w-[784px] transform rounded-lg",
              "bg-background text-foreground dark:border dark:border-border-muted",
              "p-6 text-left align-middle shadow-xl transition-all",
              // Only apply overflow-hidden if allowOverflow is false
              !dialogOptions?.allowOverflow && "overflow-hidden",
              dialogOptions?.panelClassName
            )}
          >
            {renderHeader()}
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
