import { StyledLayoutSpiritswap, StyledLayoutSpookyswap } from "./styles";
import { Orders, Twap } from "@orbs-network/twap-ui-spiritswap";
import { useDefaultProps } from "./defaults";

const Dapp = () => {
  const defaultProps = useDefaultProps();
  const props = {
    ...defaultProps,
  };
  return (
    <>
      <StyledLayoutSpiritswap>
        <Twap {...props} />
      </StyledLayoutSpiritswap>
      <StyledLayoutSpiritswap>
        <Orders {...props} />
      </StyledLayoutSpiritswap>
    </>
  );
};

export default Dapp;
