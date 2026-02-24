import { NextRequest, NextResponse } from 'next/server';
import { getDeadline, setDeadline, removeDeadline } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deadline = await getDeadline(id);
    return NextResponse.json(deadline || { deadline: null });
  } catch (error) {
    console.error('Error fetching deadline:', error);
    return NextResponse.json({ error: 'Failed to fetch deadline' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { deadline } = body;
    
    if (!deadline) {
      return NextResponse.json({ error: 'Missing deadline' }, { status: 400 });
    }
    
    const result = await setDeadline(id, new Date(deadline));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error setting deadline:', error);
    return NextResponse.json({ error: 'Failed to set deadline' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await removeDeadline(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing deadline:', error);
    return NextResponse.json({ error: 'Failed to remove deadline' }, { status: 500 });
  }
}
