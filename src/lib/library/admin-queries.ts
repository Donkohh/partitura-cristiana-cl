import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LibraryFolder, LibraryScore, LibrarySnapshot } from "./types";

interface FolderRow {
  id: string;
  name: string;
  created_at: string;
}

interface ScoreRow {
  id: string;
  title: string;
  original_filename: string;
  folder_id: string | null;
  file_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export class AdminLibraryError extends Error {
  constructor(
    message = "No pudimos cargar el panel en este momento.",
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "AdminLibraryError";
  }
}

export async function loadAdminLibrary(): Promise<LibrarySnapshot> {
  const client = getSupabaseAdminClient();

  const [foldersResult, scoresResult] = await Promise.all([
    client.from("folders").select("id, name, created_at"),
    client
      .from("scores")
      .select(
        "id, title, original_filename, folder_id, file_size_bytes, created_at, updated_at"
      ),
  ]);

  if (foldersResult.error || scoresResult.error) {
    throw new AdminLibraryError(undefined, {
      cause: foldersResult.error ?? scoresResult.error,
    });
  }

  const folders: LibraryFolder[] = (
    (foldersResult.data ?? []) as FolderRow[]
  ).map((row) => ({ id: row.id, name: row.name, createdAt: row.created_at }));
  folders.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const names = new Map(folders.map((folder) => [folder.id, folder.name]));

  const scores: LibraryScore[] = ((scoresResult.data ?? []) as ScoreRow[]).map(
    (row) => ({
      id: row.id,
      title: row.title,
      originalFilename: row.original_filename,
      folderId: row.folder_id,
      folderName: row.folder_id ? (names.get(row.folder_id) ?? null) : null,
      sizeBytes: Number(row.file_size_bytes),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  );

  return { folders, scores };
}
