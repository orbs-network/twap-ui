import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface ChronosOrdersProps extends OrdersProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: ChronosRawToken };
}

export interface ChronosTWAPProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: (address: string) => string;
  dappTokens: { [key: string]: ChronosRawToken };
}

export interface ChronosRawToken {
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
