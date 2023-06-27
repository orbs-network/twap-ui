import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface ThenaOrdersProps extends OrdersProps {
  dappTokens: ThenaRawToken[];
}

export interface ThenaTWAPProps extends TWAPProps {
  connect: () => void;
  dappTokens: ThenaRawToken[];
  isDarkTheme?: boolean;
}

export interface ThenaRawToken {
  address: string;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
}
