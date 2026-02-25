'use client';

import { useState, useEffect } from 'react';
import styles from './AuditLogPanel.module.css';

interface AuditLog {
  id: string;
  action: string;
  actor_email: string;
  actor_name: string;
  details: string | null;
  created_at: string;
}

interface Props {
  documentId?: string;
  mockData?: AuditLog[];
}

const MOCK_LOGS: AuditLog[] = [
  { id: '1', action: 'DOCUMENT_CREATED', actor_email: 'author@company.com', actor_name: 'Author Name', details: 'Document created', created_at: '2026-02-15T09:00:00Z' },
  { id: '2', action: 'SUBMITTED_FOR_REVIEW', actor_email: 'author@company.com', actor_name: 'Author Name', details: 'Submitted for approval', created_at: '2026-02-18T11:30:00Z' },
  { id: '3', action: 'APPROVER_ADDED', actor_email: 'admin@company.com', actor_name: 'Admin User', details: 'Added approver: John Smith (john@company.com)', created_at: '2026-02-18T14:00:00Z' },
  { id: '4', action: 'DEADLINE_SET', actor_email: 'system', actor_name: 'System', details: 'Deadline set: 2026-03-01', created_at: '2026-02-19T10:00:00Z' },
  { id: '5', action: 'EXTERNAL_REVIEWER_ADDED', actor_email: 'admin@company.com', actor_name: 'Admin User', details: 'Added external reviewer: Client Rep (client@external.com)', created_at: '2026-02-20T09:00:00Z' },
  { id: '6', action: 'APPROVER_APPROVED', actor_email: 'john@company.com', actor_name: 'John Smith', details: 'Looks good!', created_at: '2026-02-20T10:00:00Z' },
  { id: '7', action: 'EXTERNAL_REVIEWER_APPROVED', actor_email: 'legal@partner.com', actor_name: 'Legal Team', details: 'Legal review complete', created_at: '2026-02-21T14:00:00Z' },
];

export default function AuditLogPanel({ documentId, mockData }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>(mockData || []);
  const [loading, setLoading] = useState(!mockData);

  useEffect(() => {
    if (mockData) return;
    fetchLogs();
  }, [documentId, mockData]);

  const fetchLogs = async () => {
    try {
      const endpoint = documentId 
        ? `/api/documents/${documentId}/audit`
        : `/api/audit`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs(MOCK_LOGS);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('SET')) return styles.positive;
    if (action.includes('REJECTED') || action.includes('REMOVED')) return styles.negative;
    return '';
  };

  if (loading) return <div className={styles.panel}>Loading...</div>;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Activity Log</h3>
      </div>

      {logs.length === 0 ? (
        <p className={styles.empty}>No activity yet.</p>
      ) : (
        <div className={styles.list}>
          {logs.map((log) => (
            <div key={log.id} className={styles.item}>
              <div className={styles.time}>{formatDate(log.created_at)}</div>
              <div className={`${styles.action} ${getActionColor(log.action)}`}>
                {formatAction(log.action)}
              </div>
              <div className={styles.actor}>
                {log.actor_name || log.actor_email}
              </div>
              {log.details && (
                <div className={styles.details}>{log.details}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
