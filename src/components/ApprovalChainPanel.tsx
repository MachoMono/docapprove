'use client';

import { useState, useEffect } from 'react';
import styles from './ApprovalChainPanel.module.css';

interface Approver {
  id: string;
  approver_email: string;
  approver_name: string;
  order: number;
  status: string;
  comment: string | null;
  resolved_at: string | null;
}

interface Props {
  documentId: string;
}

export default function ApprovalChainPanel({ documentId }: Props) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newApprover, setNewApprover] = useState({ email: '', name: '' });

  useEffect(() => {
    fetchApprovers();
  }, [documentId]);

  const fetchApprovers = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/approvers`);
      const data = await res.json();
      setApprovers(data);
    } catch (error) {
      console.error('Error fetching approvers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addApprover = async () => {
    if (!newApprover.email || !newApprover.name) return;
    
    try {
      const res = await fetch(`/api/documents/${documentId}/approvers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newApprover,
          order: approvers.length + 1
        }),
      });
      
      if (res.ok) {
        setNewApprover({ email: '', name: '' });
        setShowForm(false);
        fetchApprovers();
      }
    } catch (error) {
      console.error('Error adding approver:', error);
    }
  };

  const removeApprover = async (approverId: string) => {
    if (!confirm('Remove this approver?')) return;
    
    try {
      await fetch(`/api/documents/${documentId}/approvers?approverId=${approverId}`, {
        method: 'DELETE',
      });
      fetchApprovers();
    } catch (error) {
      console.error('Error removing approver:', error);
    }
  };

  const resolveApprover = async (approverId: string, status: 'approved' | 'rejected') => {
    const comment = prompt('Add a comment (optional):');
    
    try {
      await fetch(`/api/documents/${documentId}/approvers/${approverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
      });
      fetchApprovers();
    } catch (error) {
      console.error('Error resolving approver:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      default: return styles.pending;
    }
  };

  if (loading) return <div className={styles.panel}>Loading...</div>;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Approval Chain</h3>
        <button 
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Approver'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={newApprover.name}
            onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={newApprover.email}
            onChange={(e) => setNewApprover({ ...newApprover, email: e.target.value })}
            className={styles.input}
          />
          <button onClick={addApprover} className={styles.submitButton}>
            Add
          </button>
        </div>
      )}

      {approvers.length === 0 ? (
        <p className={styles.empty}>No approvers added yet.</p>
      ) : (
        <div className={styles.list}>
          {approvers.map((approver, index) => (
            <div key={approver.id} className={styles.item}>
              <div className={styles.order}>{index + 1}</div>
              <div className={styles.info}>
                <div className={styles.name}>{approver.approver_name}</div>
                <div className={styles.email}>{approver.approver_email}</div>
                {approver.comment && (
                  <div className={styles.comment}>"{approver.comment}"</div>
                )}
              </div>
              <div className={`${styles.status} ${getStatusColor(approver.status)}`}>
                {approver.status}
              </div>
              {approver.status === 'pending' ? (
                <div className={styles.actions}>
                  <button
                    onClick={() => resolveApprover(approver.id, 'approved')}
                    className={styles.approveBtn}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => resolveApprover(approver.id, 'rejected')}
                    className={styles.rejectBtn}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => removeApprover(approver.id)}
                    className={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => removeApprover(approver.id)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
