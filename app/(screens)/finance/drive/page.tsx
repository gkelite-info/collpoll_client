"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useMemo, useState } from "react";
import ActionBar from "./components/actionBar";
import FilesTable from "./components/allFilesTable";
import { FolderCard } from "./components/folderCard";
import RecentFileCard from "./components/recentFileCard";
import RenameFolderModal from "./components/modal/renameFolderModal";
import DeleteFolderModal from "./components/modal/deleteFolderModal";
import NewFolderModal from "./components/modal/newFolderModal";

import { allFilesMock, foldersMock, recentFilesMock } from "./mockData";

type SortOption = "latest" | "name" | "size";

export type FolderItemProps = {
  id: number;
  name: string;
  filesCount: number;
  sizeLabel: string;
  color: string;
};

export type FileItemProps = {
  id: number;
  name: string;
  type: "PDF" | "PPTX" | "ZIP" | "DOCX" | "PNG" | "TXT";
  sizeLabel: string;
  sizeMb: number;
  uploadedOnLabel: string;
  uploadedOn: string;
};

const Page = () => {
  const [files, setFiles] = useState<FileItemProps[]>(
    allFilesMock as FileItemProps[]
  );

  const [folders, setFolders] = useState<FolderItemProps[]>(foldersMock);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const [folderToRename, setFolderToRename] = useState<FolderItemProps | null>(
    null
  );
  const [folderToDelete, setFolderToDelete] = useState<FolderItemProps | null>(
    null
  );
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  const sortedFiles = useMemo(() => {
    const cloned = [...files];
    if (sortBy === "latest") {
      return cloned.sort(
        (a, b) =>
          new Date(b.uploadedOn).getTime() - new Date(a.uploadedOn).getTime()
      );
    }
    if (sortBy === "name") {
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "size") {
      return cloned.sort((a, b) => b.sizeMb - a.sizeMb);
    }
    return cloned;
  }, [files, sortBy]);

  const handleDeleteFile = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDownloadFile = (file: FileItemProps) => {
    console.log("Download", file.name);
  };

  const handleSaveFolderName = (newName: string) => {
    if (!folderToRename) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderToRename.id ? { ...f, name: newName } : f
      )
    );
    setFolderToRename(null);
  };

  const handleConfirmDeleteFolder = () => {
    if (!folderToDelete) return;
    setFolders((prev) => prev.filter((f) => f.id !== folderToDelete.id));
    setFolderToDelete(null);
  };

  const handleCreateFolder = (data: { name: string; color: string }) => {
    setFolders((prev) => {
      const maxId = prev.reduce((m, f) => Math.max(m, f.id), 0);
      const newFolder: FolderItemProps = {
        id: maxId + 1,
        name: data.name,
        color: data.color,
        filesCount: 0,
        sizeLabel: "0 MB",
      };
      return [...prev, newFolder];
    });
    setIsNewFolderOpen(false);
  };

  return (
    <main className="p-4">
      <NewFolderModal
        open={isNewFolderOpen}
        onCancel={() => setIsNewFolderOpen(false)}
        onSave={handleCreateFolder}
      />

      <section className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#282828]">Drive</h1>
          <p className="text-[#282828]">Manage and share materials</p>
        </div>

        <article className="flex w-[32%] justify-end">
          <CourseScheduleCard style="w-[320px]" />
        </article>
      </section>

      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl">
          <ActionBar
            sortBy={sortBy}
            onSort={(val) => setSortBy(val as SortOption)}
            onNew={() => setIsNewFolderOpen(true)}
            onFilters={() => console.log("Filters")}
          />

          <section className="mt-6">
            <h2 className="text-md font-semibold text-[#282828]">Folders</h2>
            <div className="mt-2 flex gap-4 overflow-x-auto">
              {folders.map((f) => (
                <FolderCard
                  key={f.id}
                  {...f}
                  onRename={() => setFolderToRename(f)}
                  onDelete={() => setFolderToDelete(f)}
                />
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-md font-semibold text-[#282828]">Recent</h2>
            <div className="mt-2 flex gap-4 overflow-x-scroll pb-1">
              {recentFilesMock.map((file) => (
                <RecentFileCard
                  key={file.id}
                  name={file.name}
                  type={file.type}
                  sizeLabel={file.sizeLabel}
                  date={file.uploadedOnLabel}
                />
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-md font-semibold text-[#282828]">All Files</h2>
            <FilesTable
              files={sortedFiles}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
            />
          </section>
        </div>
      </div>

      <RenameFolderModal
        open={!!folderToRename}
        currentName={folderToRename?.name || ""}
        onCancel={() => setFolderToRename(null)}
        onSave={handleSaveFolderName}
      />

      <DeleteFolderModal
        open={!!folderToDelete}
        folderName={folderToDelete?.name || ""}
        onCancel={() => setFolderToDelete(null)}
        onConfirm={handleConfirmDeleteFolder}
      />
    </main>
  );
};

export default Page;
