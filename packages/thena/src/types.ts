import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface QuickSwapOrdersProps extends OrdersProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: QuickSwapRawToken };
}

export interface QuickSwapTWAPProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: QuickSwapRawToken };
  isProMode?: boolean;
}

export interface QuickSwapRawToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  tokenInfo: {
    address: string;
    chainId: number;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
  };
}
