/**
 * @file Password reveal dialog — shown after creating an employee.
 * Displays the auto-generated password ONCE. Admin must copy it before closing.
 * The password cannot be retrieved again after this dialog is dismissed.
 */

'use client';

import { useState } from 'react';

interface PasswordRevealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  employeeId: string;
  email: string;
  generatedPassword: string;
}

export default function PasswordRevealDialog({
  isOpen,
  onClose,
  employeeName,
  employeeId,
  email,
  generatedPassword,
}: PasswordRevealDialogProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: select the text
      const el = document.getElementById('generated-password');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  const handleCopyAll = async () => {
    const text = `Employee Credentials\n────────────────────\nName: ${employeeName}\nEmployee ID: ${employeeId}\nEmail: ${email}\nPassword: ${generatedPassword}\n────────────────────\n⚠️ This password was auto-generated and cannot be retrieved again.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Silently fail
    }
  };

  const handleClose = () => {
    if (!confirmed) return;
    setCopied(false);
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-sm animate-fade-in" id="password-dialog-overlay">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-scale-in" id="password-dialog">
        <div className="p-6">
          {/* Success icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
            <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="text-center text-lg font-semibold text-foreground">
            Employee Created Successfully
          </h3>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            A secure password has been generated for <span className="font-medium text-foreground">{employeeName}</span>.
          </p>

          {/* Credentials card */}
          <div className="mt-5 rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee ID</span>
              <span className="font-mono text-sm text-foreground">{employeeId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</span>
              <span className="text-sm text-foreground">{email}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</span>
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  id="copy-password-btn"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div
                id="generated-password"
                className="mt-1.5 rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-sm tracking-wider text-foreground select-all"
              >
                {generatedPassword}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            <strong>⚠️ Important:</strong> This password is shown only once and cannot be retrieved later.
            Please copy it and share it securely with the employee.
          </div>

          {/* Copy all credentials button */}
          <button
            onClick={handleCopyAll}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            id="copy-all-btn"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy All Credentials
          </button>

          {/* Confirmation checkbox */}
          <label className="mt-4 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-primary-600"
              id="confirm-saved-checkbox"
            />
            <span className="text-sm text-muted-foreground">
              I have copied and securely saved the password
            </span>
          </label>
        </div>

        {/* Close button */}
        <div className="border-t border-border px-6 py-4">
          <button
            onClick={handleClose}
            disabled={!confirmed}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            id="close-password-dialog-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
