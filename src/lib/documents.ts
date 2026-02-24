import { query, queryOne, execute } from './db';
import { generateEmbedding } from './ollama';

export interface CreateDocumentInput {
  title: string;
  content: string;
  author?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  author?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export async function getAllDocuments() {
  return query(`
    SELECT id, title, content, status, author, created_at, updated_at
    FROM documents
    ORDER BY updated_at DESC
  `);
}

export async function getDocumentById(id: string) {
  return queryOne(`
    SELECT id, title, content, status, author, created_at, updated_at
    FROM documents
    WHERE id = $1
  `, [id]);
}

export async function getDocumentsByStatus(status: string) {
  return query(`
    SELECT id, title, content, status, author, created_at, updated_at
    FROM documents
    WHERE status = $1
    ORDER BY updated_at DESC
  `, [status]);
}

export async function createDocument(input: CreateDocumentInput) {
  const { title, content, author = 'Anonymous' } = input;
  
  let embeddingStr = 'NULL';
  try {
    const embedding = await generateEmbedding(content);
    if (embedding && embedding.length === 768) {
      const vectorValues = embedding.map(v => v.toFixed(6)).join(',');
      embeddingStr = `'[${vectorValues}]'::vector`;
    }
  } catch (e) {
    console.error('Embedding generation failed:', e);
  }
  
  const result = await queryOne(`
    INSERT INTO documents (title, content, author, embedding)
    VALUES ($1, $2, $3, ${embeddingStr})
    RETURNING id, title, content, status, author, created_at, updated_at
  `, [title, content, author]);
  
  return result;
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;
  
  if (input.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.content !== undefined) {
    let embeddingStr = 'NULL';
    try {
      const embedding = await generateEmbedding(input.content);
      if (embedding && embedding.length === 768) {
        const vectorValues = embedding.map(v => v.toFixed(6)).join(',');
        embeddingStr = `'[${vectorValues}]'::vector`;
      }
    } catch (e) {
      console.error('Embedding generation failed:', e);
    }
    updates.push(`content = $${paramIndex++}`);
    values.push(input.content);
    updates.push(`embedding = ${embeddingStr}`);
  }
  if (input.author !== undefined) {
    updates.push(`author = $${paramIndex++}`);
    values.push(input.author);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(input.status);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(id);
  
  const result = await queryOne(`
    UPDATE documents
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, title, content, status, author, created_at, updated_at
  `, values);
  
  return result;
}

export async function deleteDocument(id: string) {
  await execute(`DELETE FROM documents WHERE id = $1`, [id]);
}

export async function approveDocument(id: string) {
  return updateDocument(id, { status: 'approved' });
}

export async function rejectDocument(id: string) {
  return updateDocument(id, { status: 'rejected' });
}

export async function submitForReview(id: string) {
  return updateDocument(id, { status: 'pending' });
}

export async function getDocumentVersions(documentId: string) {
  return query(`
    SELECT id, document_id, content, version_number, created_at
    FROM document_versions
    WHERE document_id = $1
    ORDER BY version_number DESC
  `, [documentId]);
}

export async function createVersion(documentId: string, content: string) {
  const latestVersion = await queryOne<{ version_number: number }>(`
    SELECT version_number FROM document_versions
    WHERE document_id = $1
    ORDER BY version_number DESC
    LIMIT 1
  `, [documentId]);
  
  const versionNumber = (latestVersion?.version_number || 0) + 1;
  
  await execute(`
    INSERT INTO document_versions (document_id, content, version_number)
    VALUES ($1, $2, $3)
  `, [documentId, content, versionNumber]);
}

export async function searchDocuments(searchQuery: string) {
  let embeddingStr = 'NULL';
  try {
    const embedding = await generateEmbedding(searchQuery);
    if (embedding && embedding.length === 768) {
      const vectorValues = embedding.map(v => v.toFixed(6)).join(',');
      embeddingStr = `'[${vectorValues}]'::vector`;
    }
  } catch (e) {
    console.error('Embedding generation failed:', e);
    return [];
  }
  
  return query(`
    SELECT id, title, content, status, author, created_at, updated_at,
           1 - (embedding <=> ${embeddingStr}) as similarity
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}
    LIMIT 20
  `);
}

export async function getStats() {
  const total = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM documents`);
  const pending = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM documents WHERE status = 'pending'`);
  const approved = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM documents WHERE status = 'approved'`);
  const thisWeek = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM documents 
    WHERE status = 'approved' 
    AND updated_at > NOW() - INTERVAL '7 days'
  `);
  
  return {
    total: parseInt(total?.count || '0'),
    pending: parseInt(pending?.count || '0'),
    approved: parseInt(approved?.count || '0'),
    thisWeek: parseInt(thisWeek?.count || '0'),
  };
}

// Approval Chain Functions
export async function addApprover(documentId: string, email: string, name: string, order: number) {
  const result = await queryOne(`
    INSERT INTO approval_chains (document_id, approver_email, approver_name, "order", status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING id, document_id, approver_email, approver_name, "order", status, created_at
  `, [documentId, email, name, order]);
  
  await addAuditLog(documentId, 'APPROVER_ADDED', email, name, `Added approver: ${name} (${email})`);
  return result;
}

export async function removeApprover(approverId: string, documentId: string, actorEmail: string, actorName: string) {
  await execute(`DELETE FROM approval_chains WHERE id = $1`, [approverId]);
  await addAuditLog(documentId, 'APPROVER_REMOVED', actorEmail, actorName, `Removed approver ID: ${approverId}`);
}

export async function getApprovalChain(documentId: string) {
  return query(`
    SELECT id, document_id, approver_email, approver_name, "order", status, comment, resolved_at, created_at
    FROM approval_chains
    WHERE document_id = $1
    ORDER BY "order" ASC
  `, [documentId]);
}

export async function resolveApprover(approverId: string, documentId: string, status: 'approved' | 'rejected', comment: string | null, actorEmail: string, actorName: string) {
  await queryOne(`
    UPDATE approval_chains 
    SET status = $1, comment = $2, resolved_at = NOW()
    WHERE id = $3
    RETURNING id
  `, [status, comment, approverId]);
  
  await addAuditLog(documentId, `APPROVER_${status.toUpperCase()}`, actorEmail, actorName, comment);
  
  const chain = await getApprovalChain(documentId);
  const allResolved = chain.every(a => a.status !== 'pending');
  const anyRejected = chain.some(a => a.status === 'rejected');
  
  if (allResolved) {
    if (anyRejected) {
      await updateDocument(documentId, { status: 'rejected' });
    } else {
      await updateDocument(documentId, { status: 'approved' });
    }
  }
}

// External Reviewer Functions
export async function addExternalReviewer(documentId: string, email: string, name: string) {
  const { randomBytes } = await import('crypto');
  const token = randomBytes(32).toString('hex');
  
  const result = await queryOne(`
    INSERT INTO external_reviewers (document_id, email, name, token, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING id, document_id, email, name, token, status, created_at
  `, [documentId, email, name, token]);
  
  await addAuditLog(documentId, 'EXTERNAL_REVIEWER_ADDED', email, name, `Added external reviewer: ${name} (${email})`);
  return result;
}

export async function removeExternalReviewer(reviewerId: string, documentId: string, actorEmail: string, actorName: string) {
  await execute(`DELETE FROM external_reviewers WHERE id = $1`, [reviewerId]);
  await addAuditLog(documentId, 'EXTERNAL_REVIEWER_REMOVED', actorEmail, actorName, `Removed external reviewer ID: ${reviewerId}`);
}

export async function getExternalReviewers(documentId: string) {
  return query(`
    SELECT id, document_id, email, name, status, comment, resolved_at, created_at
    FROM external_reviewers
    WHERE document_id = $1
    ORDER BY created_at ASC
  `, [documentId]);
}

export async function resolveExternalReviewer(token: string, status: 'approved' | 'rejected', comment: string | null) {
  const reviewer = await queryOne<{ id: string; document_id: string; email: string; name: string }>(
    `SELECT id, document_id, email, name FROM external_reviewers WHERE token = $1 AND status = 'pending'`,
    [token]
  );
  
  if (!reviewer) return null;
  
  await queryOne(`
    UPDATE external_reviewers 
    SET status = $1, comment = $2, resolved_at = NOW()
    WHERE id = $3
  `, [status, comment, reviewer.id]);
  
  await addAuditLog(reviewer.document_id, `EXTERNAL_REVIEWER_${status.toUpperCase()}`, reviewer.email, reviewer.name, comment);
  
  const reviewers = await getExternalReviewers(reviewer.document_id);
  const allResolved = reviewers.every(r => r.status !== 'pending');
  const anyRejected = reviewers.some(r => r.status === 'rejected');
  
  if (allResolved) {
    if (anyRejected) {
      await updateDocument(reviewer.document_id, { status: 'rejected' });
    } else {
      await updateDocument(reviewer.document_id, { status: 'approved' });
    }
  }
  
  return reviewer;
}

// Deadline Functions
export async function setDeadline(documentId: string, deadline: Date) {
  const result = await queryOne(`
    INSERT INTO approval_deadlines (document_id, deadline)
    VALUES ($1, $2)
    ON CONFLICT (document_id) DO UPDATE SET deadline = $2
    RETURNING id, document_id, deadline, created_at
  `, [documentId, deadline]);
  
  await addAuditLog(documentId, 'DEADLINE_SET', 'system', 'System', `Deadline set: ${deadline}`);
  return result;
}

export async function getDeadline(documentId: string) {
  return queryOne(`
    SELECT id, document_id, deadline, created_at
    FROM approval_deadlines
    WHERE document_id = $1
  `, [documentId]);
}

export async function removeDeadline(documentId: string) {
  await execute(`DELETE FROM approval_deadlines WHERE document_id = $1`, [documentId]);
  await addAuditLog(documentId, 'DEADLINE_REMOVED', 'system', 'System', `Deadline removed`);
}

// Audit Log Functions
export async function addAuditLog(documentId: string, action: string, actorEmail: string, actorName: string, details: string | null) {
  await execute(`
    INSERT INTO audit_logs (document_id, action, actor_email, actor_name, details)
    VALUES ($1, $2, $3, $4, $5)
  `, [documentId, action, actorEmail, actorName, details]);
}

export async function getAuditLog(documentId: string) {
  return query(`
    SELECT id, document_id, action, actor_email, actor_name, details, created_at
    FROM audit_logs
    WHERE document_id = $1
    ORDER BY created_at DESC
  `, [documentId]);
}

export async function getAllAuditLogs(limit = 100) {
  return query(`
    SELECT al.id, al.document_id, al.action, al.actor_email, al.actor_name, al.details, al.created_at,
           d.title as document_title
    FROM audit_logs al
    LEFT JOIN documents d ON al.document_id = d.id
    ORDER BY al.created_at DESC
    LIMIT $1
  `, [limit]);
}
