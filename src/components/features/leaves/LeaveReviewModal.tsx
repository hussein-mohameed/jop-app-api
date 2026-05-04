'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import type { Leave } from '@/types/leave.types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: Leave | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
}

export default function LeaveReviewModal({ isOpen, onClose, leave, onApprove, onReject }: LeaveReviewModalProps) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) setNotes('');
  }, [isOpen]);

  if (!leave) return null;

  const handleApprove = () => {
    onApprove(leave.id, notes);
    onClose();
  };

  const handleReject = () => {
    onReject(leave.id, notes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Leave Request">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground hover:text-primary-600 transition-colors">
              <Link href={`/admin/employees/${leave.employeeId}`}>
                {leave.employeeName}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">{leave.departmentName}</p>
          </div>
          <StatusBadge status={leave.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block font-medium text-muted-foreground">Leave Type</span>
            <span className="text-foreground">{leave.leaveTypeName}</span>
          </div>
          <div>
            <span className="block font-medium text-muted-foreground">Duration</span>
            <span className="text-foreground">{leave.totalDays} Days</span>
          </div>
          <div>
            <span className="block font-medium text-muted-foreground">Start Date</span>
            <span className="text-foreground">{formatDate(leave.startDate)}</span>
          </div>
          <div>
            <span className="block font-medium text-muted-foreground">End Date</span>
            <span className="text-foreground">{formatDate(leave.endDate)}</span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <span className="block font-medium text-muted-foreground text-sm mb-1">Reason provided by employee</span>
          <div className="rounded-md bg-muted p-3 text-sm text-foreground">
            {leave.reason}
          </div>
        </div>

        {/* Approval/Rejection Notes */}
        {leave.status === 'PENDING' && (
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
        {leave.status !== 'PENDING' && leave.approvalNotes && (
          <div>
            <span className="block font-medium text-muted-foreground text-sm mb-1">
              Reviewer Notes (by {leave.approvedByName})
            </span>
            <div className="rounded-md border border-border p-3 text-sm text-muted-foreground italic">
              {leave.approvalNotes}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {leave.status === 'PENDING' ? 'Cancel' : 'Close'}
          </button>
          
          {leave.status === 'PENDING' && (
            <>
              <button
                onClick={handleReject}
                className="rounded-md bg-danger-50 px-4 py-2 text-sm font-medium text-danger-700 hover:bg-danger-100 transition-colors"
              >
                Reject Request
              </button>
              <button
                onClick={handleApprove}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-700 transition-colors shadow-sm"
              >
                Approve Request
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
