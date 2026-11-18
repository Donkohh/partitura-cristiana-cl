export interface LibraryFolder {
  id: string;
  name: string;
  createdAt?: string;
}

export interface LibraryScore {
  id: string;
  title: string;
  originalFilename: string;
  folderId: string | null;
  folderName: string | null;
  sizeBytes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LibrarySnapshot {
  folders: LibraryFolder[];
  scores: LibraryScore[];
}
