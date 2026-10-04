"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full select-none font-sans">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              className="pointer-events-auto p-3 rounded-[8px] bg-[#040406] border border-[#2e3038] shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-2 fade-in duration-150"
            >
              <div className="flex items-center gap-2.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-[#fbbf24] shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[#cc9166] shrink-0" />
                )}
                <span className="text-[#e2e3e9] font-medium leading-tight">
                  {toast.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-[#777a88] hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}
