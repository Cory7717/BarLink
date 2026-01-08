import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadToS3(params: {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<string> {
  const { file, fileName, contentType, folder = 'bottles' } = params;
  const key = `${folder}/${Date.now()}-${fileName}`;
  const bucket = process.env.AWS_S3_BUCKET || '';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL || `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
  return `${baseUrl}/${key}`;
}

export async function uploadBottlePhoto(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadToS3({
    file: buffer,
    fileName: file.name,
    contentType: file.type,
    folder: 'bottles',
  });
}
