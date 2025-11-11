import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type Toast as ToastType } from '../../hooks/useToast';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <XCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
  };

  return (
    <div
      className={`
        glass-card pointer-events-auto
        min-w-[300px] max-w-md
        flex items-start gap-3 p-4
        border ${bgColors[toast.type]}
        animate-slide-in
        shadow-lg
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm text-text-primary">{toast.message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-glass-light transition-colors text-text-secondary hover:text-text-primary"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
