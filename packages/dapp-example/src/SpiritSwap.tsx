import { StyledLayoutSpiritswap } from "./styles";
import { Orders, Twap } from "@orbs-network/twap-ui-spiritswap";
import { useOrdersDefaultProps, useTwapDefaultProps } from "./defaults";
import { OrdersProps, TWAPProps } from "@orbs-network/twap-ui";

const Dapp = () => {
  const defaultOrdersProps = useOrdersDefaultProps();
  const defaultTwapProps = useTwapDefaultProps();

  const twapProps: TWAPProps = { ...defaultTwapProps, srcToken: "WFTM", dstToken: "ORBS" };
  const ordersProps: OrdersProps = defaultOrdersProps;

  return (
    <>
      <StyledLayoutSpiritswap>
        <Twap {...twapProps} />
      </StyledLayoutSpiritswap>
      <StyledLayoutSpiritswap>
        <Orders {...ordersProps} />
      </StyledLayoutSpiritswap>
    </>
  );
};

export default Dapp;
