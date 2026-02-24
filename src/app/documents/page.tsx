import Link from 'next/link';
import styles from './page.module.css';
import StatusBadge from '@/components/StatusBadge';

async function getDocuments(status?: string) {
  try {
    const url = status 
      ? `${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents?status=${status}`
      : `${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams;
  const documents = await getDocuments(status);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Documents` : 'All Documents'}</h1>
        <Link href="/documents/new" className={styles.newButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className={styles.empty}>
          <p>No documents found.</p>
          <Link href="/documents/new" className={styles.emptyButton}>
            Create Document
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {documents.map((doc: { id: string; title: string; content: string; status: string; author: string; updated_at: string }) => (
            <Link key={doc.id} href={`/documents/${doc.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{doc.title}</h3>
                <StatusBadge status={doc.status as 'draft' | 'pending' | 'approved' | 'rejected'} />
              </div>
              <p className={styles.cardExcerpt}>
                {doc.content.slice(0, 120)}...
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.cardAuthor}>{doc.author}</span>
                <span className={styles.cardDate}>
                  {new Date(doc.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
