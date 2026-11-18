import { getSupabaseClient, SupabaseConfigError } from "@/lib/supabase/server";
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

export class LibraryDataError extends Error {
  constructor(
    message = "No pudimos cargar la biblioteca en este momento.",
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "LibraryDataError";
  }
}

function mapFolder(row: FolderRow): LibraryFolder {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

function mapScores(
  rows: ScoreRow[],
  folders: LibraryFolder[]
): LibraryScore[] {
  const names = new Map(folders.map((folder) => [folder.id, folder.name]));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    originalFilename: row.original_filename,
    folderId: row.folder_id,
    folderName: row.folder_id ? (names.get(row.folder_id) ?? null) : null,
    sizeBytes: Number(row.file_size_bytes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function loadPublicLibrary(): Promise<LibrarySnapshot> {
  let client;
  try {
    client = getSupabaseClient();
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      console.error(
        "[biblioteca] Variables de Supabase ausentes:",
        error.missingVars
      );
    }
    throw new LibraryDataError(undefined, { cause: error });
  }

  const [foldersResult, scoresResult] = await Promise.all([
    client.from("folders").select("id, name, created_at"),
    client
      .from("scores")
      .select(
        "id, title, original_filename, folder_id, file_size_bytes, created_at, updated_at"
      ),
  ]);

  if (foldersResult.error || scoresResult.error) {
    const error = foldersResult.error ?? scoresResult.error;
    console.error(
      "[biblioteca] Error consultando Supabase:",
      error?.message ?? "sin detalle"
    );
    throw new LibraryDataError(undefined, { cause: error });
  }

  const folders = ((foldersResult.data ?? []) as FolderRow[]).map(mapFolder);
  folders.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return {
    folders,
    scores: mapScores((scoresResult.data ?? []) as ScoreRow[], folders),
  };
}
