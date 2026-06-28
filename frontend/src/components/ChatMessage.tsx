import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import ThinkingIndicator from "./ThinkingIndicator";

type ChildrenProp = { children?: React.ReactNode };

const classNames: Record<string, string> = {
  p: "mb-3 last:mb-0",
  strong: "font-semibold text-slate-800",
  ul: "mb-3 last:mb-0 ml-4 list-disc space-y-1",
  ol: "mb-3 last:mb-0 ml-4 list-decimal space-y-1",
  li: "",
  table: "my-3 last:my-0 w-full text-left border-collapse",
  th: "border border-slate-300 px-2 py-1 bg-slate-50 font-semibold",
  td: "border border-slate-300 px-2 py-1",
};

const markdownComponents: Components = Object.fromEntries(
    Object.entries(classNames).map(([tag, className]) => [
      tag,
      ({ children }: ChildrenProp) => React.createElement(tag, { className }, children),
    ])
) as Components;

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  source?: string;
  isThinking?: boolean;
};

const ChatMessage = ({ role, content, source, isThinking }: ChatMessageProps) => {
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
          {isThinking ? (
            <ThinkingIndicator />
          ) : isUser ? (
            content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          )}
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
