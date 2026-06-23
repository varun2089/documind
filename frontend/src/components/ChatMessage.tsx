type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const ChatMessage = ({ role, content, source }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[600px] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <span className="text-xs font-medium text-slate-400 px-1">
          {isUser ? "You" : "Documind"}
        </span>
        <div
          className={`px-4 py-3 text-sm leading-relaxed border ${
            isUser
              ? "bg-user-bg border-indigo-200 text-slate-800"
              : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          {content}
        </div>
        {source && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-source-bg text-source-text">
            Source: {source}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
