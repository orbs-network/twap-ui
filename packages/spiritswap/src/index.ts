import Twap from "./Twap";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";
export interface SpiritSwapOrdersProps extends OrdersProps {
  getTokenImage: (token: any) => string;
}
export interface SpiritSwapTWAPProps extends TWAPProps {
  getTokenImage: (token: any) => string;
  connect: () => void;
  getProvider: () => any;
}
export { Twap, Orders };
