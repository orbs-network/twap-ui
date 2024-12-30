import { TWAPProps } from "@orbs-network/twap-ui";
import { createContext, FC, JSXElementConstructor, useContext } from "react";
import { Config } from "@orbs-network/twap";

export interface AdapterProps extends TWAPProps {
  dappTokens?: { [key: string]: any };
  isDarkTheme?: boolean;
  ConnectButton: JSXElementConstructor<any>;
  useTokenModal: any;
  nativeToken: any;
  connector?: any;
  isMobile?: boolean;
  useTooltip: any;
  Tooltip?: any;
  Button?: any;
  ApproveModalContent?: any;
  SwapTransactionErrorContent?: any;
  SwapPendingModalContent?: any;
  SwapTransactionReceiptModalContent?: any;
  AddToWallet?: any;
  connectedChainId?: number;
}

const AdapterContext = createContext({} as AdapterProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
export type WarningVariant = "error" | "warning" | "info";
