import { NextRequest, NextResponse } from 'next/server';
import { resolveApprover } from '@/lib/documents';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; approverId: string }> }
) {
  const { id, approverId } = await params;
  try {
    const body = await request.json();
    const { status, comment, actorEmail, actorName } = body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    await resolveApprover(approverId, id, status, comment || null, actorEmail || 'unknown', actorName || 'Unknown');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving approver:', error);
    return NextResponse.json({ error: 'Failed to resolve approver' }, { status: 500 });
  }
}
