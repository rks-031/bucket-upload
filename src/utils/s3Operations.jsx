import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3Config';

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

export async function uploadFile(file) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `uploads/${Date.now()}-${file.name}`,
    Body: file,
    ContentType: file.type,
  });

  await s3Client.send(command);
  return command.input.Key;
}

export async function getFileUrl(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function listFiles() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: 'uploads/',
  });

  const response = await s3Client.send(command);
  return response.Contents || [];
}