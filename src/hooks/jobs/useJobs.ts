/**
 * @file Hook for managing Jobs data.
 * Connected to the backend API — replaces previous mock data.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { JobSummary, JobStatus, JobType } from '@/types/job.types';

export interface JobQuery {
  search?: string;
  status?: JobStatus | '';
  type?: JobType | '';
}

export function useJobs() {
  const [query, setQuery] = useState<JobQuery>({ search: '', status: '', type: '' });
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.search) params.set('search', query.search);
      if (query.status) params.set('status', query.status);
      if (query.type) params.set('jobType', query.type);
      params.set('pageSize', '100');

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setJobs(json.data.items.map(mapApiJob));
      } else {
        setError(json.error || 'Failed to load jobs');
      }
    } catch {
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  }, [query.search, query.status, query.type]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filteredJobs = useMemo(() => jobs, [jobs]);

  const publishJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      fetchJobs();
    } catch { /* handled by re-fetch */ }
  };

  const closeJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      fetchJobs();
    } catch { /* handled by re-fetch */ }
  };

  const deleteJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      fetchJobs();
    } catch { /* handled by re-fetch */ }
  };

  return {
    data: filteredJobs,
    total: filteredJobs.length,
    isLoading,
    error,
    query,
    setQuery,
    publishJob,
    closeJob,
    deleteJob,
    refetch: fetchJobs,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiJob(item: any): JobSummary {
  return {
    id: item.id,
    title: item.title,
    department: item.department?.name ?? 'Unknown',
    location: item.location,
    jobType: item.jobType,
    status: item.status,
    applicationCount: item._count?.applications ?? 0,
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
    closingDate: item.closingDate ? new Date(item.closingDate) : undefined,
  };
}
