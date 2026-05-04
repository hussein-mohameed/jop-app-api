'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import type { Bonus } from '@/types/bonus.types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface BonusReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonus: Bonus | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
}

export default function BonusReviewModal({ isOpen, onClose, bonus, onApprove, onReject }: BonusReviewModalProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) setNotes('');
  }, [isOpen]);

  if (!bonus) return null;

  const handleApprove = () => {
    onApprove(bonus.id, notes);
    onClose();
  };

  const handleReject = () => {
    onReject(bonus.id, notes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Bonus Suggestion">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground hover:text-primary-600 transition-colors">
              <Link href={`/admin/employees/${bonus.employeeId}`}>
                {bonus.employeeName}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">Suggested by: <Link href={`/admin/employees/${bonus.suggestedById}`} className="hover:text-primary-600 hover:underline">{bonus.suggestedByName}</Link></p>
          </div>
          <StatusBadge status={bonus.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block font-medium text-muted-foreground">Amount</span>
            <span className="text-xl font-bold text-success-600">${bonus.amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="block font-medium text-muted-foreground">Date Suggested</span>
            <span className="text-foreground">{formatDate(bonus.createdAt)}</span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <span className="block font-medium text-muted-foreground text-sm mb-1">Justification</span>
          <div className="rounded-md bg-muted p-3 text-sm text-foreground">
            {bonus.reason}
          </div>
        </div>

        {/* Approval/Rejection Notes */}
        {bonus.status === 'PENDING' && (
          <div>
            <label className="block font-medium text-foreground text-sm mb-1" htmlFor="review-notes">
              Review Notes (Optional)
            </label>
            <textarea
              id="review-notes"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="Add notes explaining your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {/* Past Action Notes */}
        {bonus.status !== 'PENDING' && bonus.approvalNotes && (
          <div>
            <span className="block font-medium text-muted-foreground text-sm mb-1">
              Reviewer Notes (by {bonus.approvedByName})
            </span>
            <div className="rounded-md border border-border p-3 text-sm text-muted-foreground italic">
              {bonus.approvalNotes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {bonus.status === 'PENDING' ? 'Cancel' : 'Close'}
          </button>
          
          {bonus.status === 'PENDING' && (
            <>
              <button
                onClick={handleReject}
                className="rounded-md bg-danger-50 px-4 py-2 text-sm font-medium text-danger-700 hover:bg-danger-100 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="rounded-md bg-success-600 px-4 py-2 text-sm font-medium text-white hover:bg-success-700 transition-colors shadow-sm"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
