import { Config, Configs } from "@orbs-network/twap-sdk";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAccount } from "wagmi";

export enum Panels {
  TWAP = "TWAP",
  LIMIT = "LIMIT",
}

interface ContextProps {
  config: Config;
  setConfig: (config: Config) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  panel: Panels;
  setPanel: (panel: Panels) => void;
}
type ThemeMode = "light" | "dark";
const Context = createContext({} as ContextProps);

const useConfig = () => {
  const { chainId } = useAccount();

  const initialConfig = useMemo(() => {
    const configName = localStorage.getItem("config-name");
    const config = Object.values(Configs).find((it) => it.name === configName);
    return config || Object.values(Configs).find((it) => it.chainId === chainId) || Configs.Lynex;
  }, [chainId]);
  const [config, setConfig] = useState(initialConfig as Config);

  const onConfigChange = useCallback(
    (config: Config) => {
      localStorage.setItem("config-name", config.name);
      setConfig(config);
    },
    [setConfig],
  );

  return {
    config,
    setConfig: onConfigChange,
  };
};

export const DappProvider = ({ children }: { children: React.ReactNode }) => {
  const { config, setConfig } = useConfig();
  const [panel, setPanel] = useState(Panels.TWAP);
  const [theme, _setTheme] = useState<ThemeMode>((localStorage.getItem("theme") as ThemeMode) || "dark");

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      _setTheme(theme);
      localStorage.setItem("theme", theme);
    },
    [_setTheme],
  );

  return <Context.Provider value={{ config, setConfig, theme, setTheme, panel, setPanel }}>{children}</Context.Provider>;
};

export const useDappContext = () => useContext(Context);
