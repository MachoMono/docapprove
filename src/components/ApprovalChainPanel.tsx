'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  mockData?: Approver[];
}

const MOCK_APPROVERS: Approver[] = [
  { id: '1', approver_email: 'john@company.com', approver_name: 'John Smith', order: 1, status: 'approved', comment: 'Looks good!', resolved_at: '2026-02-20T10:00:00Z' },
  { id: '2', approver_email: 'sarah@company.com', approver_name: 'Sarah Johnson', order: 2, status: 'pending', comment: null, resolved_at: null },
  { id: '3', approver_email: 'mike@company.com', approver_name: 'Mike Wilson', order: 3, status: 'pending', comment: null, resolved_at: null },
];

export default function ApprovalChainPanel({ documentId, mockData }: Props) {
  const [approvers, setApprovers] = useState<Approver[]>(mockData || []);
  const [loading, setLoading] = useState(!mockData);
  const [showForm, setShowForm] = useState(false);
  const [newApprover, setNewApprover] = useState({ email: '', name: '' });

  useEffect(() => {
    if (mockData) return;
    fetchApprovers();
  }, [documentId, mockData]);

  const fetchApprovers = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}/approvers`);
      const data = await res.json();
      setApprovers(data);
    } catch (error) {
      console.error('Error fetching approvers:', error);
      setApprovers(MOCK_APPROVERS);
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
          <CardTitle className="text-sm">Approval Chain</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="flex gap-2">
            <Input
              placeholder="Name"
              value={newApprover.name}
              onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
              className="h-8"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newApprover.email}
              onChange={(e) => setNewApprover({ ...newApprover, email: e.target.value })}
              className="h-8"
            />
            <Button size="sm" onClick={addApprover} className="h-8">Add</Button>
          </div>
        )}

        {approvers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No approvers added yet.</p>
        ) : (
          <div className="space-y-2">
            {approvers.map((approver, index) => (
              <div key={approver.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{approver.approver_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{approver.approver_email}</div>
                  {approver.comment && (
                    <div className="text-xs text-muted-foreground italic mt-1">"{approver.comment}"</div>
                  )}
                </div>
                <Badge variant={getStatusVariant(approver.status)} className="text-xs capitalize">
                  {approver.status}
                </Badge>
                {approver.status === 'pending' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600" onClick={() => resolveApprover(approver.id, 'approved')}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600" onClick={() => resolveApprover(approver.id, 'rejected')}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
