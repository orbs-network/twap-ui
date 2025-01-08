import { TWAPProps } from "@orbs-network/twap-ui";
import { createContext, FC, JSXElementConstructor, ReactNode, useContext } from "react";

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
  TransactionErrorContent: FC<{ message?: string; onClick: () => void }>;
  connectedChainId?: number;
  toast: ({ title, message, autoCloseMillis, variant }: ToastProps) => void;
  MobileDrawer?: FC<{
    children: ReactNode;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
  }>;
}

export type ToastProps = { title: string; message: ReactNode; autoCloseMillis?: number; variant: "success" | "warning" | "error" | "info" };

const AdapterContext = createContext({} as AdapterProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
export type WarningVariant = "error" | "warning" | "info";
