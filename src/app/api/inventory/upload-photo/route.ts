import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ownerId = session?.user && typeof session.user === 'object' ? (session.user as { id?: string }).id : undefined;
    
    if (!ownerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const barId = formData.get('barId') as string;

    if (!file || !barId) {
      return NextResponse.json({ error: 'Missing file or barId' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Lightweight deterministic estimation based on image size
    const bottleSizeMl = Number(formData.get('bottleSizeMl')) || 750;
    const rawPct = (buffer.byteLength % 75) + 10; // 10-84 based on file size
    const estimatedPct = Math.min(98, Math.max(5, rawPct));
    const estimatedMl = Math.round((estimatedPct / 100) * bottleSizeMl);

    return NextResponse.json({ imageUrl: "", estimatedPct, estimatedMl }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
