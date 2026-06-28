import React, { useRef } from "react";
import { FileText, Plus, Loader2 } from "lucide-react";

type SidebarProps = {
  documents: string[];
  pendingFiles: string[];
  isUploading: boolean;
  onAddDocuments: (files: FileList) => void;
};

const Sidebar = ({ documents, pendingFiles, isUploading, onAddDocuments }: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddDocuments(files);
    }
    e.target.value = "";
  };

  return (
    <aside className="w-[260px] bg-sidebar flex flex-col shrink-0">
      <div className="px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Indexed Documents
        </h2>
      </div>

      <ul className="flex-1 overflow-y-auto px-2 space-y-1">
        {documents.map((doc) => (
          <li key={doc}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-text hover:bg-sidebar-hover transition-colors cursor-default">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{doc}</span>
            </div>
          </li>
        ))}
        {pendingFiles.map((name) => (
          <li key={`pending-${name}`}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-500 opacity-60">
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              <span className="truncate">{name}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add document
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
