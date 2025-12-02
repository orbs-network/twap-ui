import { Config, Configs, Partners } from "@orbs-network/twap-sdk";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useAppParams } from "./dapp/hooks";
import { Module } from "@orbs-network/twap-ui";
import { configToPartner } from "./utils";

interface ContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  slippage: number;
  setSlippage: (slippage: number) => void;
  module: Module;
  onModuleSelect: (module: Module) => void;
  partner: Partners;
  partnerSelect: (partner: Partners, chainId: number) => void;
  chainId: number;
}
type ThemeMode = "light" | "dark";
const Context = createContext({} as ContextProps);

const getConfigKey = (config: Config) => {
  return `${config.name}_${config.chainId}`;
};

export const DappProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, _setTheme] = useState<ThemeMode>((localStorage.getItem("theme") as ThemeMode) || "dark");
  const [slippage, setSlippage] = useState(5);
  const { module, onModuleSelect, partner, partnerSelect, chainId } = useAppParams();

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      _setTheme(theme);
      localStorage.setItem("theme", theme);
    },
    [_setTheme],
  );

  return <Context.Provider value={{ theme, setTheme, module, onModuleSelect, slippage, chainId, setSlippage, partner, partnerSelect }}>{children}</Context.Provider>;
};

export const useDappContext = () => useContext(Context);
