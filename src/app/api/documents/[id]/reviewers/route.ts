import { NextRequest, NextResponse } from 'next/server';
import { addExternalReviewer, getExternalReviewers, removeExternalReviewer } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const reviewers = await getExternalReviewers(id);
    return NextResponse.json(reviewers);
  } catch (error) {
    console.error('Error fetching external reviewers:', error);
    return NextResponse.json({ error: 'Failed to fetch external reviewers' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { email, name } = body;
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const reviewer = await addExternalReviewer(id, email, name);
    return NextResponse.json(reviewer);
  } catch (error) {
    console.error('Error adding external reviewer:', error);
    return NextResponse.json({ error: 'Failed to add external reviewer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewerId');
    const actorEmail = searchParams.get('actorEmail') || 'unknown';
    const actorName = searchParams.get('actorName') || 'Unknown';
    
    if (!reviewerId) {
      return NextResponse.json({ error: 'Missing reviewerId' }, { status: 400 });
    }
    
    await removeExternalReviewer(reviewerId, id, actorEmail, actorName);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing external reviewer:', error);
    return NextResponse.json({ error: 'Failed to remove external reviewer' }, { status: 500 });
  }
}
