'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ApprovalActions.module.css';

interface Document {
  id: string;
  status: string;
}

export default function ApprovalActions({ document }: { document: Document }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: 'approve' | 'reject' | 'submit') => {
    setIsLoading(true);
    try {
      let url = `/api/documents/${document.id}`;
      let method = 'PUT';

      if (action === 'approve') {
        url = `/api/documents/${document.id}/approve`;
        method = 'POST';
      } else if (action === 'reject') {
        url = `/api/documents/${document.id}/reject`;
        method = 'POST';
      } else if (action === 'submit') {
        url = `/api/documents/${document.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: action === 'submit' ? { 'Content-Type': 'application/json' } : {},
        body: action === 'submit' ? JSON.stringify({ status: 'pending' }) : undefined,
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/documents';
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Actions</h3>
      
      {document.status === 'draft' && (
        <button 
          onClick={() => handleAction('submit')}
          disabled={isLoading}
          className={styles.primaryButton}
        >
          Submit for Review
        </button>
      )}

      {document.status === 'pending' && (
        <div className={styles.buttonGroup}>
          <button 
            onClick={() => handleAction('approve')}
            disabled={isLoading}
            className={`${styles.button} ${styles.approve}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Approve
          </button>
          <button 
            onClick={() => handleAction('reject')}
            disabled={isLoading}
            className={`${styles.button} ${styles.reject}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Reject
          </button>
        </div>
      )}

      {document.status === 'approved' && (
        <div className={styles.approvedMessage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          This document has been approved
        </div>
      )}

      {document.status === 'rejected' && (
        <div className={styles.rejectedMessage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          This document was rejected
        </div>
      )}

      <div className={styles.divider} />

      <button 
        onClick={handleDelete}
        disabled={isLoading}
        className={styles.deleteButton}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Delete Document
      </button>
    </div>
  );
}
