import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';

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

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToS3({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      folder: `bottles/${barId}`,
    });

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
