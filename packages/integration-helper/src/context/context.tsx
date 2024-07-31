import { createContext, useContext, useMemo } from "react";
import { IntegrationProps } from "@orbs-network/twap-ui";
import Web3 from "web3";
import { Token } from "../types";

interface ContextType extends IntegrationProps {
  account?: string;
  web3?: Web3;
  minNativeTokenBalance?: number | string;
  maxFeePerGas?: number | string;
  priorityFeePerGas?: number | string;
  tokens?: Token[]
}

const Context = createContext({} as ContextType);

interface Props extends ContextType {
  children: React.ReactNode;
  provider?: any;
}

export const IntegrationHelperProvider = ({ children, ...rest }: Props) => {
  const web3 = useMemo(() => {
    return rest.provider ? new Web3(rest.provider) : undefined;
  }, [rest.provider]);

  return <Context.Provider value={{ ...rest, web3 }}></Context.Provider>;
};

export const useIntegrationHelperContext = () => {
  return useContext(Context);
};
