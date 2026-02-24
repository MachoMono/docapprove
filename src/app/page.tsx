import Link from 'next/link';
import styles from './page.module.css';

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/stats`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return { total: 0, pending: 0, approved: 0, thisWeek: 0 };
    return res.json();
  } catch {
    return { total: 0, pending: 0, approved: 0, thisWeek: 0 };
  }
}

async function getRecentApproved() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/documents?status=approved`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    const docs = await res.json();
    return docs.slice(0, 5);
  } catch {
    return [];
  }
}

export default async function Home() {
  const stats = await getStats();
  const recentApproved = await getRecentApproved();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <Link href="/documents/new" className={styles.newButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Document
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Documents</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <span className={styles.statLabel}>Pending Review</span>
          <span className={styles.statValue}>{stats.pending}</span>
        </div>
        <div className={`${styles.statCard} ${styles.approved}`}>
          <span className={styles.statLabel}>Approved</span>
          <span className={styles.statValue}>{stats.approved}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Approved This Week</span>
          <span className={styles.statValue}>{stats.thisWeek}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recently Approved</h2>
          <Link href="/documents?status=approved" className={styles.viewAll}>View All</Link>
        </div>
        
        {recentApproved.length === 0 ? (
          <div className={styles.empty}>
            <p>No approved documents yet.</p>
          </div>
        ) : (
          <div className={styles.docList}>
            {recentApproved.map((doc: { id: string; title: string; status: string; author: string; updated_at: string }) => (
              <Link key={doc.id} href={`/documents/${doc.id}`} className={styles.docItem}>
                <div className={styles.docInfo}>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docMeta}>{doc.author} • {new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
                <span className={`${styles.status} ${styles.approved}`}>
                  {doc.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
