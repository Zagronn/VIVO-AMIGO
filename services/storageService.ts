import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const BUCKET_NAME = 'vivo-amigo-voice-notes';
const CDN_ORIGIN = 'https://cdn.vivoamigo.com/voice-notes';

export interface R2BucketBinding {
  put(key: string, value: ArrayBuffer | ArrayBufferView | ReadableStream | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('Cloudflare R2 credentials are required');

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
}

function safeObjectKey(fileName: string): string {
  const normalized = fileName.trim().replaceAll('\\', '/').split('/').pop() || '';
  if (!normalized || normalized === '.' || normalized === '..' || normalized.includes('..')) throw new Error('fileName must be a safe object name');
  return normalized;
}

export async function uploadVoiceNoteToR2(audioBuffer: Buffer, fileName: string): Promise<string> {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) throw new Error('audioBuffer must contain audio data');
  const objectKey = safeObjectKey(fileName);

  await getR2Client().send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Body: audioBuffer,
    ContentType: 'audio/webm'
  }));

  return `${CDN_ORIGIN}/${encodeURIComponent(objectKey)}`;
}

export async function uploadVoiceNoteToR2Binding(bucket: R2BucketBinding, audioBuffer: Buffer, fileName: string): Promise<string> {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) throw new Error('audioBuffer must contain audio data');
  const objectKey = safeObjectKey(fileName);
  await bucket.put(objectKey, audioBuffer, { httpMetadata: { contentType: 'audio/webm' } });
  return `${CDN_ORIGIN}/${encodeURIComponent(objectKey)}`;
}
