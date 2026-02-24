import { NextResponse } from 'next/server';
import { searchDocuments } from '@/lib/documents';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }
    
    const results = await searchDocuments(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json({ error: 'Failed to search documents' }, { status: 500 });
  }
}
