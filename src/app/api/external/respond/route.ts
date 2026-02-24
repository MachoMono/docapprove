import { NextRequest, NextResponse } from 'next/server';
import { resolveExternalReviewer } from '@/lib/documents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, status, comment } = body;
    
    if (!token || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const reviewer = await resolveExternalReviewer(token, status, comment || null);
    
    if (!reviewer) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, documentId: reviewer.document_id });
  } catch (error) {
    console.error('Error resolving external reviewer:', error);
    return NextResponse.json({ error: 'Failed to resolve review' }, { status: 500 });
  }
}
