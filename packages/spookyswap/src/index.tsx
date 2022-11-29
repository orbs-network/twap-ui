import Twap from "./Twap";
import Orders from "./Orders";
import { AdapterProps, TwapAdapter } from "@orbs-network/twap-ui";
import { Configs } from "@orbs-network/twap";
import translations from "./i18n/en.json";

export const SpookySwapAdapter = (props: AdapterProps) => {
  const { children, twapProps } = props;
  return (
    <TwapAdapter translations={translations} twapProps={twapProps} config={Configs.SpookySwap}>
      {children}
    </TwapAdapter>
  );
};

export { Twap, Orders };
