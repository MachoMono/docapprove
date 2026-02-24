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
