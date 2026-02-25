import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import StatusBadge from '@/components/StatusBadge';
import DocumentSidebar from './DocumentSidebar';

async function getDocument(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents/${id}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.document;
  } catch {
    return null;
  }
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

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
