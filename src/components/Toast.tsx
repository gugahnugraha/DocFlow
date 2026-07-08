"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-red-500    flex-shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500  flex-shrink-0" />,
  info:    <Info          className="w-5 h-5 text-blue-500   flex-shrink-0" />,
  loading: <Loader2       className="w-5 h-5 text-brand-500  flex-shrink-0 animate-spin" />,
};

const ACCENT: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error:   "border-l-red-500",
  warning: "border-l-amber-500",
  info:    "border-l-blue-500",
  loading: "border-l-brand-500",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  // Auto-dismiss
  useEffect(() => {
    if (!toast.duration && toast.duration !== 0) return;
    if (toast.duration === 0) return;
    const t = setTimeout(handleDismiss, toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration]);

  return (
    <div
      className={`flex items-start gap-3 bg-white border border-[var(--border)] border-l-4 ${ACCENT[toast.type]}
        rounded-xl shadow-[var(--shadow-lg)] p-4 w-[360px] max-w-[calc(100vw-2rem)]
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{toast.message}</p>
        )}
      </div>
      {toast.type !== "loading" && (
        <button
          onClick={handleDismiss}
          className="w-5 h-5 flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors flex-shrink-0 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">): string => {
    const id = `toast-${++counter.current}`;
    const duration = opts.duration ?? (opts.type === "loading" ? 0 : opts.type === "error" ? 6000 : 4000);
    setToasts(prev => [...prev, { ...opts, id, duration }]);
    return id;
  }, []);

  const success = useCallback((title: string, message?: string) =>
    toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) =>
    toast({ type: "error", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) =>
    toast({ type: "warning", title, message }), [toast]);
  const info = useCallback((title: string, message?: string) =>
    toast({ type: "info", title, message }), [toast]);
  const loading = useCallback((title: string, message?: string) =>
    toast({ type: "loading", title, message, duration: 0 }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error, warning, info, loading }}>
      {children}
      {/* Toast container — bottom-right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
