/**
 * @file Generic Modal component.
 * Provides a flexible wrapper for dialogs, forms, and alerts.
 */

'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  /** Is the modal currently open? */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Modal Title */
  title: string;
  /** Optional subtitle/description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Max width class (e.g., 'max-w-md', 'max-w-2xl') */
  maxWidth?: string;
}

/**
 * A highly reusable Modal dialog wrapper.
 * Handles backdrop click to close, escape key to close, and scroll locking.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-card p-6 text-left shadow-xl transition-all max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between pb-4 border-b border-border">
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable if content is long */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
