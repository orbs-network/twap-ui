import TWAP from "./TWAP";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface SpookySwapOrdersProps extends OrdersProps {
  getTokenImageUrl: (symbol: string) => string;
  getProvider: () => any;
}
export interface SpookySwapTWAPProps extends TWAPProps {
  getTokenImageUrl: (symbol: string) => string;
  connect: () => void;
  getProvider: () => any;
}

export { TWAP, Orders };
