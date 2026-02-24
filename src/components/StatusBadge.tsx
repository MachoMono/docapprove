import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

const statusLabels = {
  draft: 'Draft',
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
