'use client';

import ApprovalActions from './ApprovalActions';
import ApprovalChainPanel from '@/components/ApprovalChainPanel';
import ExternalReviewersPanel from '@/components/ExternalReviewersPanel';
import DeadlinePanel from '@/components/DeadlinePanel';
import AuditLogPanel from '@/components/AuditLogPanel';

interface Document {
  id: string;
  status: string;
}

const MOCK_DOCUMENT_ID = 'mock-doc-123';

export default function DocumentSidebar({ document }: { document: Document }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <ApprovalActions document={document} />
      <DeadlinePanel documentId={MOCK_DOCUMENT_ID} mockDeadline="2026-03-01T17:00:00" />
      <ApprovalChainPanel 
        documentId={MOCK_DOCUMENT_ID} 
        mockData={[
          { id: '1', approver_email: 'john@company.com', approver_name: 'John Smith', order: 1, status: 'approved', comment: 'Looks good!', resolved_at: '2026-02-20T10:00:00Z' },
          { id: '2', approver_email: 'sarah@company.com', approver_name: 'Sarah Johnson', order: 2, status: 'pending', comment: null, resolved_at: null },
          { id: '3', approver_email: 'mike@company.com', approver_name: 'Mike Wilson', order: 3, status: 'pending', comment: null, resolved_at: null },
        ]}
      />
      <ExternalReviewersPanel 
        documentId={MOCK_DOCUMENT_ID}
        mockData={[
          { id: '1', email: 'client@external.com', name: 'Client Rep', token: 'abc123', status: 'pending', comment: null, resolved_at: null },
          { id: '2', email: 'legal@partner.com', name: 'Legal Team', token: 'def456', status: 'approved', comment: 'Legal review complete', resolved_at: '2026-02-21T14:00:00Z' },
        ]}
      />
      <AuditLogPanel 
        documentId={MOCK_DOCUMENT_ID}
        mockData={[
          { id: '1', action: 'DOCUMENT_CREATED', actor_email: 'author@company.com', actor_name: 'Author Name', details: 'Document created', created_at: '2026-02-15T09:00:00Z' },
          { id: '2', action: 'SUBMITTED_FOR_REVIEW', actor_email: 'author@company.com', actor_name: 'Author Name', details: 'Submitted for approval', created_at: '2026-02-18T11:30:00Z' },
          { id: '3', action: 'APPROVER_ADDED', actor_email: 'admin@company.com', actor_name: 'Admin User', details: 'Added approver: John Smith (john@company.com)', created_at: '2026-02-18T14:00:00Z' },
          { id: '4', action: 'DEADLINE_SET', actor_email: 'system', actor_name: 'System', details: 'Deadline set: 2026-03-01', created_at: '2026-02-19T10:00:00Z' },
          { id: '5', action: 'EXTERNAL_REVIEWER_ADDED', actor_email: 'admin@company.com', actor_name: 'Admin User', details: 'Added external reviewer: Client Rep (client@external.com)', created_at: '2026-02-20T09:00:00Z' },
          { id: '6', action: 'APPROVER_APPROVED', actor_email: 'john@company.com', actor_name: 'John Smith', details: 'Looks good!', created_at: '2026-02-20T10:00:00Z' },
          { id: '7', action: 'EXTERNAL_REVIEWER_APPROVED', actor_email: 'legal@partner.com', actor_name: 'Legal Team', details: 'Legal review complete', created_at: '2026-02-21T14:00:00Z' },
        ]}
      />
    </div>
  );
}
