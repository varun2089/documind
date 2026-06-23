import { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
};

type ChatAreaProps = {
  messages: Message[];
  onSend: (message: string) => void;
};

const ChatArea = ({ messages, onSend }: ChatAreaProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full text-slate-400 text-sm">
            Ask a question about your indexed documents.
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              source={msg.source}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} />
    </div>
  );
};

export default ChatArea;
