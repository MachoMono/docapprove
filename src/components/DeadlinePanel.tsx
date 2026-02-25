'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    
    if (days < 0) return { text: 'Overdue', variant: 'destructive' as const };
    if (days === 0) return { text: 'Due today', variant: 'destructive' as const };
    if (days === 1) return { text: 'Due tomorrow', variant: 'warning' as const };
    if (days <= 3) return { text: `Due in ${days} days`, variant: 'warning' as const };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), variant: 'default' as const };
  };

  if (loading) return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Deadline</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : deadline ? 'Change' : '+ Set'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="flex gap-2 mb-3">
            <Input
              type="datetime-local"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="h-8"
            />
            <Button size="sm" onClick={setDeadlineDate} className="h-8">Save</Button>
          </div>
        )}

        {deadline ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <div className="text-sm font-medium">{formatDeadline(deadline).text}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={removeDeadline}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
          </div>
        ) : !showForm && (
          <p className="text-sm text-muted-foreground text-center py-2">No deadline set.</p>
        )}
      </CardContent>
    </Card>
  );
}
