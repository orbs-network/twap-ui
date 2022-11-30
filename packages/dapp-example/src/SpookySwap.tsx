import { StyledLayoutSpookyswap } from "./styles";
import { Orders, Twap } from "@orbs-network/twap-ui-spookyswap";
import { useOrdersDefaultProps, useTwapDefaultProps } from "./defaults";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

const Dapp = () => {
  const defaultOrdersProps = useOrdersDefaultProps();
  const defaultTwapProps = useTwapDefaultProps();

  const ordersProps: OrdersProps = defaultOrdersProps;
  const twapProps: TWAPProps = { ...defaultTwapProps, srcToken: "WFTM", dstToken: "ORBS" };

  return (
    <>
      <StyledLayoutSpookyswap>
        <Twap {...twapProps} />
      </StyledLayoutSpookyswap>
      <StyledLayoutSpookyswap>
        <Orders {...ordersProps} />
      </StyledLayoutSpookyswap>
    </>
  );
};

export default Dapp;
