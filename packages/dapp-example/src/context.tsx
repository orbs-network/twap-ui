import { Config } from "@orbs-network/twap-sdk";
import { createContext, useContext, useMemo } from "react";

interface ContextProps {
  config: Config;
}

const Context = createContext({} as ContextProps);

export const DappProvider = ({ children, config }: { config: Config; children: React.ReactNode }) => {
  return <Context.Provider value={{ config }}>{children}</Context.Provider>;
};

export const useDappContext = () => useContext(Context);
