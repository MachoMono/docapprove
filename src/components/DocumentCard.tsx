import Link from 'next/link';
import StatusBadge from './StatusBadge';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  id: string;
  title: string;
  content: string;
  status: string;
  author: string;
  updated_at: string;
}

export default function DocumentCard({ id, title, content, status, author, updated_at }: DocumentCardProps) {
  const excerpt = content.slice(0, 150) + (content.length > 150 ? '...' : '');
  const date = new Date(updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/documents/${id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <StatusBadge status={status as 'draft' | 'pending' | 'approved' | 'rejected'} />
      </div>
      <p className={styles.excerpt}>{excerpt}</p>
      <div className={styles.footer}>
        <span className={styles.author}>{author}</span>
        <span className={styles.date}>{date}</span>
      </div>
    </Link>
  );
}
