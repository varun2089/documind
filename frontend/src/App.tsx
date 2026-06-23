import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: string;
};

const MOCK_DOCUMENTS = ["sample_contract.pdf"];

const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What are the payment terms in this contract?",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "The contract specifies Net 30 payment terms. All invoices must be paid within 30 calendar days of receipt. Late payments are subject to a 1.5% monthly interest charge. The client may request an extension of up to 15 additional days with written notice.",
    source: "sample_contract.pdf",
  },
  {
    id: "3",
    role: "user",
    content: "Is there a termination clause?",
  },
  {
    id: "4",
    role: "assistant",
    content:
      "Yes. Either party may terminate the agreement with 60 days written notice. In the event of a material breach, the non-breaching party may terminate immediately upon written notice. Upon termination, all outstanding invoices become due within 10 business days.",
    source: "sample_contract.pdf",
  },
];

const App = () => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-surface font-sans text-slate-800">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar documents={MOCK_DOCUMENTS} />
        <ChatArea messages={messages} onSend={handleSend} />
      </div>
    </div>
  );
};

export default App;
