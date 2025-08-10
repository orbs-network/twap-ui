import React from "react";
import { useTwapContext } from "../../context";

function Markdown({ children, components }: { children: string; components?: any }) {
  const { ReactMarkdown } = useTwapContext();
  if (!ReactMarkdown) return null;
  return <ReactMarkdown>{children}</ReactMarkdown>;
}

export default Markdown;
