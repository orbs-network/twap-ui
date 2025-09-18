import React, { createContext } from "react";
import { useChunksPanel } from "./hooks/use-chunks";

type Panels = {
  chunks: ReturnType<typeof useChunksPanel>;
};

type UserContextType = {
  panels: Panels;
};

const Context = createContext({} as UserContextType);

export function UserContext({ children }: { children: React.ReactNode }) {
  const chunks = useChunksPanel();
  return <Context.Provider value={{ panels: { chunks } }}>{children}</Context.Provider>;
}
