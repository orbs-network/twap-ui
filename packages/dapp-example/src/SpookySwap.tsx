import { StyledLayoutSpookyswap } from "./styles";
import { Orders, Twap } from "@orbs-network/twap-ui-spookyswap";
import { useDefaultProps } from "./defaults";

const Dapp = () => {
  const defaultProps = useDefaultProps();
  const props = {
    ...defaultProps,
  };
  return (
    <>
      <StyledLayoutSpookyswap>
        <Twap {...props} />
      </StyledLayoutSpookyswap>
      <StyledLayoutSpookyswap>
        <Orders {...props} />
      </StyledLayoutSpookyswap>
    </>
  );
};

export default Dapp;
