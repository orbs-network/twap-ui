import { Config, TWAPLib } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useMemo } from "react";

interface ContextProps {
  lib?: TWAPLib;
}

const Context = createContext({} as ContextProps);

export const DappProvider = ({ children, config }: { config?: Config; children: React.ReactNode }) => {
  const { account, chainId, library } = useWeb3React();

  const lib = useMemo(() => {
    if (!account || !library || !config || chainId !== config.chainId) return;

    return new TWAPLib(config, account, library);
  }, [account, library, config, chainId]);

  return <Context.Provider value={{ lib }}>{children}</Context.Provider>;
};

export const useDappContext = () => useContext(Context);
