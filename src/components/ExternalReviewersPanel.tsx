'use client';

import { useState, useEffect } from 'react';
import styles from './ExternalReviewersPanel.module.css';

interface Reviewer {
  id: string;
  email: string;
  name: string;
  token: string;
  status: string;
  comment: string | null;
  resolved_at: string | null;
}

interface Props {
  documentId: string;
  mockData?: Reviewer[];
}

const MOCK_REVIEWERS: Reviewer[] = [
  { id: '1', email: 'client@external.com', name: 'Client Rep', token: 'abc123', status: 'pending', comment: null, resolved_at: null },
  { id: '2', email: 'legal@partner.com', name: 'Legal Team', token: 'def456', status: 'approved', comment: 'Legal review complete', resolved_at: '2026-02-21T14:00:00Z' },
];

export default function ExternalReviewersPanel({ documentId, mockData }: Props) {
  const [reviewers, setReviewers] = useState<Reviewer[]>(mockData || []);
  const [loading, setLoading] = useState(!mockData);
  const [showForm, setShowForm] = useState(false);
  const [newReviewer, setNewReviewer] = useState({ email: '', name: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (mockData) return;
    fetchReviewers();
  }, [documentId, mockData]);

  const fetchReviewers = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/reviewers`);
      const data = await res.json();
      setReviewers(data);
    } catch (error) {
      console.error('Error fetching reviewers:', error);
      setReviewers(MOCK_REVIEWERS);
    } finally {
      setLoading(false);
    }
  };

  const addReviewer = async () => {
    if (!newReviewer.email || !newReviewer.name) return;
    
    try {
      const res = await fetch(`/api/documents/${documentId}/reviewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewer),
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewReviewer({ email: '', name: '' });
        setShowForm(false);
        fetchReviewers();
        copyReviewLink(data.token);
      }
    } catch (error) {
      console.error('Error adding reviewer:', error);
    }
  };

  const copyReviewLink = async (token: string) => {
    const link = `${window.location.origin}/external/review?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeReviewer = async (reviewerId: string) => {
    if (!confirm('Remove this reviewer?')) return;
    
    try {
      await fetch(`/api/documents/${documentId}/reviewers?reviewerId=${reviewerId}`, {
        method: 'DELETE',
      });
      fetchReviewers();
    } catch (error) {
      console.error('Error removing reviewer:', error);
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
        <h3>External Reviewers</h3>
        <button 
          className={styles.addButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Invite Reviewer'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={newReviewer.name}
            onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
            className={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={newReviewer.email}
            onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
            className={styles.input}
          />
          <button onClick={addReviewer} className={styles.submitButton}>
            Invite
          </button>
        </div>
      )}

      {reviewers.length === 0 ? (
        <p className={styles.empty}>No external reviewers invited yet.</p>
      ) : (
        <div className={styles.list}>
          {reviewers.map((reviewer) => (
            <div key={reviewer.id} className={styles.item}>
              <div className={styles.avatar}>
                {reviewer.name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.info}>
                <div className={styles.name}>{reviewer.name}</div>
                <div className={styles.email}>{reviewer.email}</div>
                {reviewer.comment && (
                  <div className={styles.comment}>"{reviewer.comment}"</div>
                )}
              </div>
              <div className={`${styles.status} ${getStatusColor(reviewer.status)}`}>
                {reviewer.status}
              </div>
              {reviewer.status === 'pending' && (
                <button
                  onClick={() => copyReviewLink(reviewer.token)}
                  className={styles.linkBtn}
                >
                  {copiedId === reviewer.token ? 'Copied!' : 'Copy Link'}
                </button>
              )}
              {reviewer.status === 'pending' && (
                <button
                  onClick={() => removeReviewer(reviewer.id)}
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
