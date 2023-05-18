import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface ChronosOrdersProps extends OrdersProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: any[];
}

export interface ChronosTWAPProps extends TWAPProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: any[];
  connect?: () => void;
}

export interface ChronosRawToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}
