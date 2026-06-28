import { useState, useEffect } from "react";

const ThinkingIndicator = () => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-slate-400">
      Documind is thinking{".".repeat(dotCount)}
    </span>
  );
};

export default ThinkingIndicator;
