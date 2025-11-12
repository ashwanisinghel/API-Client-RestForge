import React, { createContext, useContext } from 'react';
import { useToast } from '@/components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { showToast, ToastContainer } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a no-op function instead of throwing
    return {
      showToast: (message: string, type?: 'success' | 'error' | 'info') => {
        console.log(`Toast: ${type || 'info'} - ${message}`);
      }
    };
  }
  return context;
}