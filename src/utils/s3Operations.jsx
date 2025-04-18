import { PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './s3Config';

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET_NAME;

export async function uploadFile(file, key) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
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


export async function listFiles(prefix) {
  const command = new ListObjectsV2Command({
    Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
    Prefix: prefix, // Ensure the prefix is applied here
  });

  try {
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('S3 List Error:', error);
    throw error;
  }
}


export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw error;
  }
}


export async function generateShareableLink(key) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  // Generate a URL that expires in 3 days for shared files
  return await getSignedUrl(s3Client, command, { expiresIn: 3 * 24 * 60 * 60 });
}
