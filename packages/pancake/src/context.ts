import { BalanceProps, InputProps, Translations } from "@orbs-network/twap-ui";
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
  FlipButton?: FC<{ onClick: () => void }>;
  MobileDrawer?: FC<{
    children: ReactNode;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
  }>;
  Input?: FC<InputProps>;
  CurrencyLogo: FC<{ address?: string }>;
  Balance?: FC<BalanceProps>;
  translations?: Partial<Translations>;
  ReactMarkdown: FC<{ children: string; components?: any }>;
}

export type ToastProps = { title: string; message: ReactNode; autoCloseMillis?: number; variant: "success" | "warning" | "error" | "info" };

const AdapterContext = createContext({} as AdapterProps);

export const AdapterContextProvider = AdapterContext.Provider;

export const useAdapterContext = () => useContext(AdapterContext);
export type WarningVariant = "error" | "warning" | "info";
