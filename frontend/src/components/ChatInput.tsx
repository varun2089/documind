import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-slate-200 bg-white px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-md bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors shrink-0 cursor-pointer"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
