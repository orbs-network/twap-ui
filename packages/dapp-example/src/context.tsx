import { Config, Configs } from "@orbs-network/twap-sdk";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useAppParams } from "./dapp/hooks";
import { Module } from "@orbs-network/twap-ui";

interface ContextProps {
  config: Config;
  setConfig: (config: Config) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  panel: Module;
  setPanel: (panel: Module) => void;
  slippage: number;
  setSlippage: (slippage: number) => void;
}
type ThemeMode = "light" | "dark";
const Context = createContext({} as ContextProps);

const getConfigKey = (config: Config) => {
  return `${config.name}_${config.chainId}`;
};

const useConfig = () => {
  const { chainId } = useAccount();
  const { partner } = useAppParams();

  const initialConfig = useMemo(() => {
    const configKey = localStorage.getItem("config-name");
    const config = Object.values(Configs).find((it) => getConfigKey(it as Config) === configKey);
    return config || Object.values(Configs).find((it) => it.chainId === chainId) || Configs.Thena;
  }, [chainId]);

  const initialPartner = useMemo(() => {
    if (partner) {
      const name = partner.split("_")[0];
      const chainName = partner.split("_")[1];

      return Object.values(Configs).find((it) => {
        return it.name.toLowerCase() === name && it.chainName.toLowerCase() === chainName;
      });
    }
    return initialConfig;
  }, [partner]);

  const [config, setConfig] = useState(initialPartner as any as Config);

  const onConfigChange = useCallback(
    (config: Config) => {
      localStorage.setItem("config-name", getConfigKey(config));
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
  const [panel, setPanel] = useState(Module.STOP_LOSS);
  const [theme, _setTheme] = useState<ThemeMode>((localStorage.getItem("theme") as ThemeMode) || "dark");
  const [slippage, setSlippage] = useState(0.5);
  const setTheme = useCallback(
    (theme: ThemeMode) => {
      _setTheme(theme);
      localStorage.setItem("theme", theme);
    },
    [_setTheme],
  );

  return <Context.Provider value={{ config, setConfig, theme, setTheme, panel, setPanel, slippage, setSlippage }}>{children}</Context.Provider>;
};

export const useDappContext = () => useContext(Context);
