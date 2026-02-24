import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const logs = await getAuditLog(id);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
