'use client';

import { useState, useEffect } from 'react';
import styles from './DeadlinePanel.module.css';

interface Props {
  documentId: string;
  mockDeadline?: string | null;
}

interface Deadline {
  deadline: string;
}

const MOCK_DEADLINE = '2026-03-01T17:00:00';

export default function DeadlinePanel({ documentId, mockDeadline }: Props) {
  const [deadline, setDeadline] = useState<string | null>(mockDeadline || null);
  const [loading, setLoading] = useState!(mockDeadline !== undefined);
  const [showForm, setShowForm] = useState(false);
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    if (mockDeadline !== undefined) return;
    fetchDeadline();
  }, [documentId, mockDeadline]);

  const fetchDeadline = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/deadline`);
      const data: Deadline = await res.json();
      setDeadline(data?.deadline || null);
    } catch (error) {
      console.error('Error fetching deadline:', error);
      setDeadline(MOCK_DEADLINE);
    } finally {
      setLoading(false);
    }
  };

  const setDeadlineDate = async () => {
    if (!newDeadline) return;
    
    try {
      await fetch(`/api/documents/${documentId}/deadline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: newDeadline }),
      });
      setNewDeadline('');
      setShowForm(false);
      fetchDeadline();
    } catch (error) {
      console.error('Error setting deadline:', error);
    }
  };

  const removeDeadline = async () => {
    if (!confirm('Remove the deadline?')) return;
    
    try {
      await fetch(`/api/documents/${documentId}/deadline`, {
        method: 'DELETE',
      });
      setDeadline(null);
    } catch (error) {
      console.error('Error removing deadline:', error);
    }
  };

  const formatDeadline = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Overdue', class: styles.overdue };
    if (days === 0) return { text: 'Due today', class: styles.today };
    if (days === 1) return { text: 'Due tomorrow', class: styles.soon };
    if (days <= 3) return { text: `Due in ${days} days`, class: styles.soon };
    return { text: date.toLocaleDateString(), class: '' };
  };

  if (loading) return <div className={styles.panel}>Loading...</div>;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Deadline</h3>
        <button 
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : deadline ? 'Change' : '+ Set'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <input
            type="datetime-local"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className={styles.input}
          />
          <button onClick={setDeadlineDate} className={styles.submitButton}>
            Save
          </button>
        </div>
      )}

      {deadline ? (
        <div className={styles.deadlineDisplay}>
          {(() => {
            const { text, class: statusClass } = formatDeadline(deadline);
            return (
              <>
                <div className={`${styles.date} ${statusClass}`}>{text}</div>
                <button onClick={removeDeadline} className={styles.removeBtn}>
                  Remove
                </button>
              </>
            );
          })()}
        </div>
      ) : (
        !showForm && <p className={styles.empty}>No deadline set.</p>
      )}
    </div>
  );
}
