'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

  const getStatusVariant = (status: string): "success" | "destructive" | "warning" => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'warning';
    }
  };

  if (loading) return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">External Reviewers</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Invite'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="flex gap-2">
            <Input
              placeholder="Name"
              value={newReviewer.name}
              onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
              className="h-8"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newReviewer.email}
              onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
              className="h-8"
            />
            <Button size="sm" onClick={addReviewer} className="h-8">Invite</Button>
          </div>
        )}

        {reviewers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No external reviewers invited yet.</p>
        ) : (
          <div className="space-y-2">
            {reviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center text-sm font-medium">
                  {reviewer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{reviewer.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{reviewer.email}</div>
                  {reviewer.comment && (
                    <div className="text-xs text-muted-foreground italic mt-1">"{reviewer.comment}"</div>
                  )}
                </div>
                <Badge variant={getStatusVariant(reviewer.status)} className="text-xs capitalize">
                  {reviewer.status}
                </Badge>
                {reviewer.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => copyReviewLink(reviewer.token)}>
                      {copiedId === reviewer.token ? 'Copied!' : 'Copy Link'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
