import { SubmitOrderPanel } from "./submit-order-modal/submit-order-panel";
import { TwapProvider } from "../context";
import { TwapProps } from "../types";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL } from "../consts";
import { DEFAULT_DURATION_OPTIONS } from "./consts";
import { OrderHistory } from "./orders/Orders";
import { useTwap } from "../use-twap";

const TWAP = (props: TwapProps) => {
  return (
    <TwapProvider {...props}>
      <>{props.children}</>
    </TwapProvider>
  );
};

const Components = {
  SubmitOrderPanel,
  OrderHistory,
};

export { TWAP, ORBS_WEBSITE_URL, ORBS_LOGO, DEFAULT_DURATION_OPTIONS, DISCLAIMER_URL, useTwap, Components };
