import { FileText, Plus } from "lucide-react";

type SidebarProps = {
  documents: string[];
};

const Sidebar = ({ documents }: SidebarProps) => {
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
      </ul>

      <div className="p-3">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add document
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
