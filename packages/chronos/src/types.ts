import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface ChronosOrdersProps extends OrdersProps {
  getTokenLogoURL: (address: string) => string;
  dappTokens: ChronosRawToken[];
}

export interface ChronosTWAPProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: (address: string) => string;
  dappTokens: ChronosRawToken[];
}

export interface ChronosRawToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  price_quote: number;
}
