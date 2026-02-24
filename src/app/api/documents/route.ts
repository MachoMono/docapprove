import { NextResponse } from 'next/server';
import { getAllDocuments, getDocumentsByStatus, createDocument } from '@/lib/documents';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let documents;
    if (status) {
      documents = await getDocumentsByStatus(status);
    } else {
      documents = await getAllDocuments();
    }
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author } = body;
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const document = await createDocument({ title, content, author });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
