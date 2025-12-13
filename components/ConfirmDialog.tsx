import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6 text-center transform transition-all animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 mb-4">
          <ExclamationTriangleIcon />
        </div>
        <h3 className="text-2xl font-bold text-white" id="modal-title">
          {title}
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-400">
            {message}
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            className="inline-flex justify-center rounded-full border border-transparent bg-red-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
            onClick={onConfirm}
          >
            نعم، ابدأ من جديد
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-full border border-slate-600 bg-transparent px-6 py-2 text-base font-medium text-gray-300 shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
            onClick={onCancel}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;