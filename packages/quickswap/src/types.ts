import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export type GetTokenLogoURL = (value: string) => string;

export interface QuickSwapOrdersProps extends OrdersProps {
  getTokenLogoURL: GetTokenLogoURL;
}

export interface QuickSwapTWAPProps extends TWAPProps {
  connect: () => void;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
  getTokenLogoURL: GetTokenLogoURL;
}
