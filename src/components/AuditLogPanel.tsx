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
}

export default function AuditLogPanel({ documentId }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [documentId]);

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
