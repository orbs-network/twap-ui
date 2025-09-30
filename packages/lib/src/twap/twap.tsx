import { SubmitOrderPanel } from "./components/submit-order-panel";
import { TwapProvider } from "../context/twap-context";
import { TwapProps } from "../types";
import { DISCLAIMER_URL, ORBS_LOGO, ORBS_WEBSITE_URL } from "../consts";
import { DEFAULT_DURATION_OPTIONS } from "./consts";
import { Orders } from "./components/orders/orders";
import { UserProvider, useUserContext } from "../context/user-context";

const TWAP = (props: TwapProps) => {
  return (
    <TwapProvider {...props}>
      <UserProvider>{props.children}</UserProvider>
    </TwapProvider>
  );
};

const Components = {
  SubmitOrderPanel,
  Orders,
};

export { TWAP, ORBS_WEBSITE_URL, ORBS_LOGO, DEFAULT_DURATION_OPTIONS, DISCLAIMER_URL, useUserContext as useTwap, Components };
