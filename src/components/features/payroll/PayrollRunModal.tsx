'use client';

import React, { useState } from 'react';

interface PayrollRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PayrollRunModal({ isOpen, onClose }: PayrollRunModalProps) {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-card rounded-xl shadow-lg border border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Run New Payroll</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
            Generate Draft
          </button>
        </div>
      </div>
    </div>
  );
}
