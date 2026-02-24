import { NextResponse } from 'next/server';
import { approveDocument, getDocumentById } from '@/lib/documents';

interface Document {
  id: string;
  status: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id) as Document | null;
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    if (document.status !== 'pending') {
      return NextResponse.json({ error: 'Can only approve pending documents' }, { status: 400 });
    }
    
    const updated = await approveDocument(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error approving document:', error);
    return NextResponse.json({ error: 'Failed to approve document' }, { status: 500 });
  }
}
