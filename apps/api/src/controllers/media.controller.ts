import { NextFunction, Request, Response } from "express";
import { ApiError } from "../middleware/error.middleware.js";
import {
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  deleteMediaObject,
  listMediaObjects,
} from "../services/media-upload.service.js";

type PresignRequestBody = {
  originalFileName?: string;
  mimeType?: string;
  folder?: string;
  category?: string;
};

type ListMediaQuery = {
  folder?: string;
  continuationToken?: string;
  limit?: string;
};

type KeyParam = {
  key?: string;
};

type DownloadQuery = {
  key?: string;
};

export async function createUploadPresign(
  req: Request<unknown, unknown, PresignRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const originalFileName = req.body.originalFileName?.trim();
    const mimeType = req.body.mimeType?.trim();
    const folder = req.body.folder?.trim() || req.body.category?.trim();

    if (!originalFileName) {
      throw new ApiError(400, "originalFileName is required.");
    }

    if (!mimeType) {
      throw new ApiError(400, "mimeType is required.");
    }

    if (!folder) {
      throw new ApiError(400, "folder is required.");
    }

    const uploadData = await createPresignedUploadUrl({
      originalFileName,
      mimeType,
      folder,
    });

    res.status(200).json({
      success: true,
      data: uploadData,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAllMedia(
  req: Request<unknown, unknown, unknown, ListMediaQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (typeof limit === "number" && (!Number.isFinite(limit) || limit <= 0)) {
      throw new ApiError(400, "limit must be a positive number.");
    }

    const media = await listMediaObjects({
      folder: req.query.folder,
      continuationToken: req.query.continuationToken,
      maxKeys: limit,
    });

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    next(error);
  }
}

export async function listMediaByFolder(
  req: Request<{ folder: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const media = await listMediaObjects({
      folder: req.params.folder,
    });

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMediaDownloadUrl(
  req: Request<unknown, unknown, unknown, DownloadQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.query.key?.trim()) {
      throw new ApiError(400, "key is required.");
    }

    const downloadData = await createPresignedDownloadUrl(req.query.key);

    res.status(200).json({
      success: true,
      data: downloadData,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeMediaObject(
  req: Request<KeyParam>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const objectKey = req.params.key?.trim() || req.query.key?.toString().trim();

    if (!objectKey) {
      throw new ApiError(400, "key is required.");
    }

    const deletion = await deleteMediaObject(objectKey);

    res.status(200).json({
      success: true,
      data: deletion,
    });
  } catch (error) {
    next(error);
  }
}