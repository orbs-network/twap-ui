import TWAP from "./TWAP";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";
export interface SpiritSwapOrdersProps extends OrdersProps {
  getTokenImage: (token: any) => string;
  getProvider: () => any;
}
export interface SpiritSwapTWAPProps extends TWAPProps {
  getTokenImage: (token: any) => string;
  connect: () => void;
  getProvider: () => any;
  onSrcTokenSelected: (value: any) => void;
  onDstTokenSelected: (value: any) => void;
}
export { TWAP, Orders };
