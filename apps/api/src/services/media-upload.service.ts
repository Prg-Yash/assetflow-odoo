import { randomUUID } from "crypto";
import path from "path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/index.js";
import { ApiError } from "../middleware/error.middleware.js";

export interface CreateUploadUrlInput {
  originalFileName: string;
  mimeType: string;
  folder: string;
}

export interface CreateUploadUrlResult {
  uploadUrl: string;
  objectKey: string;
  fileUrl: string;
  bucket: string;
  region: string;
  expiresInSeconds: number;
  method: "PUT";
  headers: {
    "Content-Type": string;
  };
}

export interface MediaObjectItem {
  objectKey: string;
  fileName: string;
  folder: string;
  url: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
}

export interface ListMediaObjectsResult {
  folder: string | null;
  prefix: string | null;
  count: number;
  isTruncated: boolean;
  nextContinuationToken: string | null;
  items: MediaObjectItem[];
}

export interface PresignedDownloadResult {
  objectKey: string;
  downloadUrl: string;
  expiresInSeconds: number;
  method: "GET";
}

export interface DeleteMediaObjectResult {
  objectKey: string;
  deleted: boolean;
}

const SIGNED_URL_TTL_SECONDS = 900;
const VALID_FOLDER_PATTERN = /^[a-z0-9][a-z0-9/_-]*$/i;
const VALID_MIME_TYPE_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;

function assertAwsConfig(): {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
} {
  const { region, bucketName, accessKeyId, secretAccessKey, publicBaseUrl } = config.aws;

  if (!region || !bucketName || !accessKeyId || !secretAccessKey) {
    throw new ApiError(
      500,
      "AWS storage configuration is incomplete. Check S3_REGION, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY."
    );
  }

  return {
    region,
    bucketName,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
  };
}

function normalizeFolder(folder: string): string {
  const trimmedFolder = folder.trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/");

  if (!trimmedFolder || !VALID_FOLDER_PATTERN.test(trimmedFolder)) {
    throw new ApiError(
      400,
      "Invalid folder value. Use a folder name with letters, numbers, dashes, underscores, or slashes."
    );
  }

  return trimmedFolder;
}

function normalizePrefix(folder?: string): string | null {
  if (!folder) {
    return null;
  }

  return `${normalizeFolder(folder)}/`;
}

function normalizeObjectKey(objectKey: string): string {
  const cleanedKey = objectKey.trim().replace(/^\/+/, "").replace(/\\/g, "/");

  if (!cleanedKey) {
    throw new ApiError(400, "objectKey is required.");
  }

  const pathSegments = cleanedKey.split("/");

  if (pathSegments.some((segment) => segment.length === 0 || segment === "..")) {
    throw new ApiError(400, "objectKey is invalid.");
  }

  return cleanedKey;
}

function splitObjectKey(objectKey: string): { folder: string; fileName: string } {
  const lastSeparatorIndex = objectKey.lastIndexOf("/");

  if (lastSeparatorIndex === -1) {
    return {
      folder: "",
      fileName: objectKey,
    };
  }

  return {
    folder: objectKey.slice(0, lastSeparatorIndex),
    fileName: objectKey.slice(lastSeparatorIndex + 1),
  };
}

function buildPublicFileUrl(baseUrl: string | undefined, bucket: string, region: string, objectKey: string): string {
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  if (baseUrl) {
    return `${baseUrl.replace(/\/+$/g, "")}/${encodedKey}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

function createS3Client() {
  const awsConfig = assertAwsConfig();

  return new S3Client({
    region: awsConfig.region,
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    },
  });
}

function getPublicFileUrl(objectKey: string): string {
  const awsConfig = assertAwsConfig();
  return buildPublicFileUrl(awsConfig.publicBaseUrl, awsConfig.bucketName, awsConfig.region, objectKey);
}

export async function createPresignedUploadUrl(
  input: CreateUploadUrlInput
): Promise<CreateUploadUrlResult> {
  const awsConfig = assertAwsConfig();
  const s3Client = createS3Client();
  const originalFileName = input.originalFileName.trim();
  const mimeType = input.mimeType.trim();
  const folder = normalizeFolder(input.folder);

  if (!originalFileName) {
    throw new ApiError(400, "originalFileName is required.");
  }

  if (!mimeType || !VALID_MIME_TYPE_PATTERN.test(mimeType)) {
    throw new ApiError(400, "mimeType is required and must be a valid MIME type.");
  }

  const fileExtension = path.extname(originalFileName);
  const objectKey = `${folder}/${randomUUID()}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: objectKey,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });

  return {
    uploadUrl,
    objectKey,
    fileUrl: buildPublicFileUrl(awsConfig.publicBaseUrl, awsConfig.bucketName, awsConfig.region, objectKey),
    bucket: awsConfig.bucketName,
    region: awsConfig.region,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
  };
}

export async function listMediaObjects(input?: {
  folder?: string;
  continuationToken?: string;
  maxKeys?: number;
}): Promise<ListMediaObjectsResult> {
  const awsConfig = assertAwsConfig();
  const s3Client = createS3Client();
  const prefix = normalizePrefix(input?.folder);

  const command = new ListObjectsV2Command({
    Bucket: awsConfig.bucketName,
    Prefix: prefix ?? undefined,
    ContinuationToken: input?.continuationToken,
    MaxKeys: input?.maxKeys,
  });

  const response = await s3Client.send(command);

  return {
    folder: input?.folder ? normalizeFolder(input.folder) : null,
    prefix,
    count: response.KeyCount ?? 0,
    isTruncated: response.IsTruncated ?? false,
    nextContinuationToken: response.NextContinuationToken ?? null,
    items:
      response.Contents?.flatMap((entry) => {
        if (!entry.Key) {
          return [];
        }

        const objectKey = entry.Key;
        const { folder, fileName } = splitObjectKey(objectKey);

        return [
          {
            objectKey,
            fileName,
            folder,
            url: getPublicFileUrl(objectKey),
            size: entry.Size ?? 0,
            lastModified: entry.LastModified?.toISOString() ?? null,
            etag: entry.ETag ?? null,
          },
        ];
      }) ?? [],
  };
}

export async function createPresignedDownloadUrl(objectKey: string): Promise<PresignedDownloadResult> {
  const awsConfig = assertAwsConfig();
  const s3Client = createS3Client();
  const normalizedObjectKey = normalizeObjectKey(objectKey);

  const command = new GetObjectCommand({
    Bucket: awsConfig.bucketName,
    Key: normalizedObjectKey,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });

  return {
    objectKey: normalizedObjectKey,
    downloadUrl,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
    method: "GET",
  };
}

export async function deleteMediaObject(objectKey: string): Promise<DeleteMediaObjectResult> {
  const awsConfig = assertAwsConfig();
  const s3Client = createS3Client();
  const normalizedObjectKey = normalizeObjectKey(objectKey);

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: normalizedObjectKey,
    })
  );

  return {
    objectKey: normalizedObjectKey,
    deleted: true,
  };
}