import TWAP from "./TWAP";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";
export interface QuickSwapOrdersProps extends OrdersProps {
  getTokenImageUrl: (symbol: string) => string;
  getProvider: () => any;
}
export interface QuickSwapTWAPProps extends TWAPProps {
  getTokenImageUrl: (symbol: string) => string;
  connect: () => void;
  getProvider: () => any;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
}
export { TWAP, Orders };
