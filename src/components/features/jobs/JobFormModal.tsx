/**
 * @file Job Form Modal.
 * Wraps the generic Modal component for creating and editing Job postings.
 */

'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { JobType } from '@/types/job.types';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  mode: 'create' | 'edit';
}

export default function JobFormModal({
  isOpen,
  onClose,
  initialData,
  mode,
}: JobFormModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [jobType, setJobType] = useState<JobType>(initialData?.jobType || 'FULL_TIME');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Submitting Job:', { title, department, location, jobType });
    onClose(); // close modal on success
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Post New Job' : 'Edit Job Posting'}
      description="Fill in the details for the job posting."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Job Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Department */}
          <div>
            <label htmlFor="department" className="text-sm font-medium text-foreground">
              Department
            </label>
            <input
              id="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
              placeholder="e.g. Engineering"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </label>
            <input
              id="location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder="e.g. Remote, New York"
            />
          </div>
        </div>

        {/* Job Type */}
        <div>
          <label htmlFor="jobType" className="text-sm font-medium text-foreground">
            Employment Type
          </label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobType)}
            className={inputClass}
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-500"
          >
            {mode === 'create' ? 'Publish Job' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
