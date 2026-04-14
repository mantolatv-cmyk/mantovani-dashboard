"use client";

import { useEffect, useState, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm" id="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "from-emerald-500/15 to-emerald-600/10",
      border: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    error: {
      icon: XCircle,
      bg: "from-red-500/15 to-red-600/10",
      border: "border-red-500/30",
      iconColor: "text-red-400",
    },
    info: {
      icon: AlertCircle,
      bg: "from-blue-500/15 to-blue-600/10",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
  };

  const c = config[toast.type] || config.info;
  const Icon = c.icon;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-gradient-to-r ${c.bg}
        border ${c.border}
        backdrop-blur-xl
        shadow-2xl shadow-black/20
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
    >
      <Icon size={18} className={c.iconColor} />
      <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
