import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { LibraryError } from "./errors";
import type {
  FolderRecord,
  LibraryRepository,
  ScorePatch,
  ScoreRecord,
} from "./operations";

interface FolderRow {
  id: string;
  name: string;
  normalized_name: string;
  created_at: string;
}

interface ScoreRow {
  id: string;
  title: string;
  original_filename: string;
  folder_id: string | null;
  storage_path: string;
  file_size_bytes: number;
  sha256_hash: string;
  created_at: string;
  updated_at: string;
}

const FOLDER_COLUMNS = "id, name, normalized_name, created_at";
const SCORE_COLUMNS =
  "id, title, original_filename, folder_id, storage_path, file_size_bytes, sha256_hash, created_at, updated_at";

function mapFolder(row: FolderRow): FolderRecord {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    createdAt: row.created_at,
  };
}

function mapScore(row: ScoreRow): ScoreRecord {
  return {
    id: row.id,
    title: row.title,
    originalFilename: row.original_filename,
    folderId: row.folder_id,
    storagePath: row.storage_path,
    sizeBytes: Number(row.file_size_bytes),
    sha256Hash: row.sha256_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isUniqueViolation(code: string | undefined): boolean {
  return code === "23505";
}

function dbError(): LibraryError {
  return new LibraryError(
    "DB_FAILED",
    "No pudimos guardar los cambios. Inténtalo de nuevo."
  );
}

export function createSupabaseLibraryRepository(): LibraryRepository {
  const client = getSupabaseAdminClient();

  return {
    async getFolder(id) {
      const { data, error } = await client
        .from("folders")
        .select(FOLDER_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw dbError();
      return data ? mapFolder(data as FolderRow) : null;
    },

    async findFolderByNormalizedName(normalizedName) {
      const { data, error } = await client
        .from("folders")
        .select(FOLDER_COLUMNS)
        .eq("normalized_name", normalizedName)
        .maybeSingle();

      if (error) throw dbError();
      return data ? mapFolder(data as FolderRow) : null;
    },

    async insertFolder(folder) {
      const { data, error } = await client
        .from("folders")
        .insert({
          id: folder.id,
          name: folder.name,
          normalized_name: folder.normalizedName,
        })
        .select(FOLDER_COLUMNS)
        .single();

      if (error) {
        if (isUniqueViolation(error.code)) {
          throw new LibraryError(
            "FOLDER_EXISTS",
            "Ya existe una carpeta con ese nombre."
          );
        }
        throw dbError();
      }
      return mapFolder(data as FolderRow);
    },

    async updateFolder(id, name, normalizedName) {
      const { data, error } = await client
        .from("folders")
        .update({ name, normalized_name: normalizedName })
        .eq("id", id)
        .select(FOLDER_COLUMNS)
        .maybeSingle();

      if (error) {
        if (isUniqueViolation(error.code)) {
          throw new LibraryError(
            "FOLDER_EXISTS",
            "Ya existe otra carpeta con ese nombre."
          );
        }
        throw dbError();
      }
      if (!data) {
        throw new LibraryError("FOLDER_NOT_FOUND", "La carpeta ya no existe.");
      }
      return mapFolder(data as FolderRow);
    },

    async countScoresInFolder(folderId) {
      const { count, error } = await client
        .from("scores")
        .select("id", { count: "exact", head: true })
        .eq("folder_id", folderId);

      if (error) throw dbError();
      return count ?? 0;
    },

    async deleteFolderAndUncategorize(folderId, moveScores) {
      const { error } = await client.rpc("delete_library_folder", {
        p_folder_id: folderId,
        p_move_scores: moveScores,
      });

      if (!error) return;

      if (error.message.includes("FOLDER_NOT_EMPTY")) {
        throw new LibraryError(
          "FOLDER_NOT_EMPTY",
          "La carpeta contiene partituras. Elige moverlas a «Sin carpeta»."
        );
      }
      if (error.message.includes("FOLDER_NOT_FOUND")) {
        throw new LibraryError("FOLDER_NOT_FOUND", "La carpeta ya no existe.");
      }
      throw dbError();
    },

    async getScore(id) {
      const { data, error } = await client
        .from("scores")
        .select(SCORE_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw dbError();
      return data ? mapScore(data as ScoreRow) : null;
    },

    async insertScore(score) {
      const { error } = await client.from("scores").insert({
        id: score.id,
        title: score.title,
        original_filename: score.originalFilename,
        folder_id: score.folderId,
        storage_path: score.storagePath,
        file_size_bytes: score.sizeBytes,
        sha256_hash: score.sha256Hash,
      });

      if (error) throw dbError();
    },

    async updateScore(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.title !== undefined) row.title = patch.title;
      if (patch.folderId !== undefined) row.folder_id = patch.folderId;
      if (patch.originalFilename !== undefined) {
        row.original_filename = patch.originalFilename;
      }
      if (patch.storagePath !== undefined) row.storage_path = patch.storagePath;
      if (patch.sizeBytes !== undefined) row.file_size_bytes = patch.sizeBytes;
      if (patch.sha256Hash !== undefined) row.sha256_hash = patch.sha256Hash;

      const { data, error } = await client
        .from("scores")
        .update(row)
        .eq("id", id)
        .select(SCORE_COLUMNS)
        .maybeSingle();

      if (error) throw dbError();
      if (!data) {
        throw new LibraryError("SCORE_NOT_FOUND", "La partitura ya no existe.");
      }
      return mapScore(data as ScoreRow);
    },

    async deleteScore(id) {
      const { data, error } = await client
        .from("scores")
        .delete()
        .eq("id", id)
        .select(SCORE_COLUMNS)
        .maybeSingle();

      if (error) throw dbError();
      return data ? mapScore(data as ScoreRow) : null;
    },
  };
}

export type { ScorePatch };
