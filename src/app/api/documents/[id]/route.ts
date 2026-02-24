import { NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument, getDocumentVersions, createVersion } from '@/lib/documents';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    const versions = await getDocumentVersions(id);
    
    return NextResponse.json({ document, versions });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const document = await updateDocument(id, body);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    if (body.content) {
      await createVersion(id, body.content);
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
