import TWAP from "./TWAP";
import Orders from "./Orders";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PangolinOrdersProps extends OrdersProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PangolinTWAPProps extends TWAPProps {}

export { TWAP, Orders };
