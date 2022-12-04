import Twap from "./Twap";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

export interface SpookySwapOrdersProps extends OrdersProps {
  getTokenImage: (token: any) => string;
}
export interface SpookySwapTWAPProps extends TWAPProps {
  getTokenImage: (token: any) => string;
  connect: () => void;
  getProvider: () => any;
}

export { Twap, Orders };
