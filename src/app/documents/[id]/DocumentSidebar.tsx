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

export default function DocumentSidebar({ document }: { document: Document }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ApprovalActions document={document} />
      <DeadlinePanel documentId={document.id} />
      <ApprovalChainPanel documentId={document.id} />
      <ExternalReviewersPanel documentId={document.id} />
      <AuditLogPanel documentId={document.id} />
    </div>
  );
}
