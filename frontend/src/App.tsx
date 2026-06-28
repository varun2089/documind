import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
  isThinking?: boolean;
};

const API_BASE = "http://localhost:3001";

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const thinkingId = crypto.randomUUID();
    const thinkingMsg: Message = {
      id: thinkingId,
      role: "assistant",
      content: "",
      isThinking: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();
      const source = (data.sources as string[])?.length > 0
        ? (data.sources as string[]).join(", ")
        : undefined;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, content: data.answer, source, isThinking: false }
            : m
        )
      );
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, content: `Error: ${errorText}`, isThinking: false }
            : m
        )
      );
    }
  };

  const handleAddDocuments = async (files: FileList) => {
    const names = Array.from(files).map((f) => f.name);
    setPendingFiles(names);
    setIsUploading(true);

    const body = new FormData();
    for (const file of files) {
      body.append("files", file);
    }

    try {
      const res = await fetch(`${API_BASE}/ingest`, {
        method: "POST",
        body,
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();
      const results: { fileName: string; chunksAdded?: number; error?: string }[] = data.results;

      const succeeded = results.filter((r) => r.chunksAdded !== undefined);
      const failed = results.filter((r) => r.error);

      if (succeeded.length > 0) {
        setDocuments((prev) => {
          const newDocs = succeeded
            .map((r) => r.fileName)
            .filter((name) => !prev.includes(name));
          return [...prev, ...newDocs];
        });
      }

      if (failed.length > 0) {
        const summary = failed
          .map((r) => `${r.fileName}: ${r.error}`)
          .join("\n");
        alert(`Some files failed to ingest:\n${summary}`);
      }
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to ingest documents: ${errorText}`);
    } finally {
      setIsUploading(false);
      setPendingFiles([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface font-sans text-slate-800">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          documents={documents}
          pendingFiles={pendingFiles}
          isUploading={isUploading}
          onAddDocuments={handleAddDocuments}
        />
        <ChatArea
          messages={messages}
          onSend={handleSend}
          hasDocuments={documents.length > 0}
        />
      </div>
    </div>
  );
};

export default App;
