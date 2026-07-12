"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type MediaItem = {
  objectKey: string;
  fileName: string;
  folder: string;
  url: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
};

type MediaListResponse = {
  success: boolean;
  data: {
    folder: string | null;
    prefix: string | null;
    count: number;
    isTruncated: boolean;
    nextContinuationToken: string | null;
    items: MediaItem[];
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001/api/v1";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [folder, setFolder] = useState("assets");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready to browse media.");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function loadMedia(nextFolder = folder) {
    setIsLoading(true);
    setError("");
    setStatus(nextFolder ? `Loading media for ${nextFolder}...` : "Loading all media...");

    try {
      const url = nextFolder
        ? `${apiBaseUrl}/media?folder=${encodeURIComponent(nextFolder)}`
        : `${apiBaseUrl}/media`;

      const response = await fetch(url);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Failed to load media.");
      }

      const payload = (await response.json()) as MediaListResponse;
      setItems(payload.data.items);
      setLastUpdated(new Date().toLocaleString());
      setStatus(
        payload.data.items.length > 0
          ? `Loaded ${payload.data.items.length} item${payload.data.items.length === 1 ? "" : "s"}.`
          : "No media found for this folder."
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load media.");
      setStatus("Unable to load media.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(objectKey: string) {
    const confirmed = window.confirm(`Delete ${objectKey}?`);

    if (!confirmed) {
      return;
    }

    setDeletingKey(objectKey);
    setError("");
    setStatus(`Deleting ${objectKey}...`);

    try {
      const response = await fetch(`${apiBaseUrl}/media/${encodeURIComponent(objectKey)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Failed to delete media.");
      }

      setItems((currentItems) => currentItems.filter((item) => item.objectKey !== objectKey));
      setStatus(`Deleted ${objectKey}.`);
      setLastUpdated(new Date().toLocaleString());
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete media.");
      setStatus("Delete failed.");
    } finally {
      setDeletingKey(null);
    }
  }

  async function handleOpen(objectKey: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/media/download?key=${encodeURIComponent(objectKey)}`);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Failed to generate download link.");
      }

      const payload = await response.json();
      window.open(payload.data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Failed to open media item.");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadMedia(folder.trim());
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.kicker}>Media manager</p>
        <h1>Browse and delete media</h1>
        <p className={styles.description}>
          Use this page to inspect uploaded files, filter by folder, and remove objects from S3.
        </p>
      </section>

      <section className={styles.toolbar}>
        <form className={styles.filter} onSubmit={handleSubmit}>
          <label>
            <span>Folder</span>
            <input
              type="text"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="assets"
            />
          </label>

          <div className={styles.actions}>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Load folder"}
            </button>
            <button type="button" onClick={() => void loadMedia("")} disabled={isLoading}>
              Browse all
            </button>
            <button type="button" onClick={() => void loadMedia(folder.trim())} disabled={isLoading}>
              Refresh
            </button>
          </div>
        </form>

        <aside className={styles.meta}>
          <p>
            <strong>API:</strong> {apiBaseUrl}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Total items:</strong> {items.length}
          </p>
          <p>
            <strong>Last updated:</strong> {lastUpdated ?? "Never"}
          </p>
        </aside>
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}

      <section className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.empty}>No media found.</div>
        ) : (
          items.map((item) => (
            <article key={item.objectKey} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h2>{item.fileName}</h2>
                  <p>{item.objectKey}</p>
                </div>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => void handleDelete(item.objectKey)}
                  disabled={deletingKey === item.objectKey}
                >
                  {deletingKey === item.objectKey ? "Deleting..." : "Delete"}
                </button>
              </div>

              <dl className={styles.details}>
                <div>
                  <dt>Folder</dt>
                  <dd>{item.folder || "-"}</dd>
                </div>
                <div>
                  <dt>Size</dt>
                  <dd>{formatFileSize(item.size)}</dd>
                </div>
                <div>
                  <dt>Modified</dt>
                  <dd>{item.lastModified ? new Date(item.lastModified).toLocaleString() : "-"}</dd>
                </div>
                <div>
                  <dt>Public URL</dt>
                  <dd>
                    <button type="button" className={styles.linkButton} onClick={() => void handleOpen(item.objectKey)}>
                      Open file
                    </button>
                  </dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </section>
    </main>
  );
}