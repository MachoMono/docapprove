import { NextRequest, NextResponse } from 'next/server';
import { addApprover, getApprovalChain, removeApprover } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const chain = await getApprovalChain(id);
    return NextResponse.json(chain);
  } catch (error) {
    console.error('Error fetching approval chain:', error);
    return NextResponse.json({ error: 'Failed to fetch approval chain' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { email, name, order } = body;
    
    if (!email || !name || order === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const approver = await addApprover(id, email, name, order);
    return NextResponse.json(approver);
  } catch (error) {
    console.error('Error adding approver:', error);
    return NextResponse.json({ error: 'Failed to add approver' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const approverId = searchParams.get('approverId');
    const actorEmail = searchParams.get('actorEmail') || 'unknown';
    const actorName = searchParams.get('actorName') || 'Unknown';
    
    if (!approverId) {
      return NextResponse.json({ error: 'Missing approverId' }, { status: 400 });
    }
    
    await removeApprover(approverId, id, actorEmail, actorName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing approver:', error);
    return NextResponse.json({ error: 'Failed to remove approver' }, { status: 500 });
  }
}
