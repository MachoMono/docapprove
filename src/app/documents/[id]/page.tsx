import Link from 'next/link';
import styles from './page.module.css';
import StatusBadge from '@/components/StatusBadge';
import DocumentSidebar from './DocumentSidebar';

const MOCK_DOCUMENT = {
  id: 'mock-doc-123',
  title: 'Q1 Product Documentation Update',
  content: `# Product Documentation Update - Q1 2026

## Overview
This document outlines the changes made to the product documentation for Q1 2026.

## Changes Made
1. Updated API reference documentation
2. Added new integration guides
3. Revised troubleshooting section
4. Added FAQ section

## Review Notes
- All technical content has been verified by the engineering team
- Legal has reviewed compliance sections
- Marketing has approved the brand guidelines usage

## Next Steps
- Final approval needed from product leadership
- Schedule release for March 15, 2026

---
Author: Documentation Team
Last Updated: February 24, 2026`,
  status: 'pending',
  author: 'Jane Smith',
  created_at: '2026-02-15T09:00:00Z',
  updated_at: '2026-02-24T14:30:00Z',
};

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const document = MOCK_DOCUMENT;

  const formattedDate = new Date(document.updated_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/documents" className={styles.backLink}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Documents
        </Link>
        
        <div className={styles.titleRow}>
          <h1>{document.title}</h1>
          <StatusBadge status={document.status} />
        </div>

        <div className={styles.meta}>
          <span>By {document.author}</span>
          <span>•</span>
          <span>Last updated {formattedDate}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.documentContent}>
          <pre className={styles.contentText}>{document.content}</pre>
        </div>

        <div className={styles.sidebar}>
          <DocumentSidebar document={document} />
        </div>
      </div>
    </div>
  );
}
