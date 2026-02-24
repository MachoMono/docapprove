import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Document {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  author: string;
  created_at: Date;
  updated_at: Date;
  embedding: number[] | null;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  created_at: Date;
}

export interface ApprovalChain {
  id: string;
  document_id: string;
  approver_email: string;
  approver_name: string;
  order: number;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface ExternalReviewer {
  id: string;
  document_id: string;
  email: string;
  name: string;
  token: string;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface ApprovalDeadline {
  id: string;
  document_id: string;
  deadline: Date;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  document_id: string;
  action: string;
  actor_email: string;
  actor_name: string;
  details: string | null;
  created_at: Date;
}

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}

export async function execute(text: string, params?: unknown[]): Promise<void> {
  await pool.query(text, params);
}

export default pool;
