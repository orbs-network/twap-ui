import { TWAPProps } from "@orbs-network/twap-ui";
import { createContext, FC, JSXElementConstructor, ReactNode, useContext } from "react";

export interface PancakeProps extends TWAPProps {
  dappTokens?: { [key: string]: any };
  isDarkTheme?: boolean;
  ConnectButton: JSXElementConstructor<any>;
  useTokenModal?: any;
  nativeToken: any;
  connector?: any;
  isMobile?: boolean;
  useTooltip?: any;
  Button: FC<{ isLoading: boolean; disabled: boolean; children: ReactNode; onClick: () => void }>;
  ApproveModalContent?: any;
  SwapTransactionErrorContent?: any;
  SwapPendingModalContent?: any;
  SwapTransactionReceiptModalContent?: any;
  AddToWallet?: any;
  TradePrice?: any;
  TradePriceToggle: FC<{ onClick: () => void; loading: boolean }>;
  children?: ReactNode;
  Modal: FC<{ open: boolean; onClose?: () => void; children: ReactNode; title?: string; className?: string; disableBackdropClick?: boolean; header?: ReactNode }>;
  srcToken?: any;
  dstToken?: any;
}

const AdapterContext = createContext({} as PancakeProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
