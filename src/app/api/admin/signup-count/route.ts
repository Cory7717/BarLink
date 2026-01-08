import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.owner.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to fetch signup count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 }); // Default to 0 on error
  }
}
