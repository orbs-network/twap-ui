import { styled } from "@mui/system";
import { StyledRowFlex } from "../../styles";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";

interface Props {
  symbol?: string;
  logo?: string;
  className?: string;
  reverse?: boolean;
}

function TokenDisplay({ symbol, logo, className = "", reverse }: Props) {
  return (
    <StyledContainer className={`twap-token-display ${className}`}>
      {reverse ? (
        <>
          <TokenName name={symbol} />
          <TokenLogo logo={logo} />
        </>
      ) : (
        <>
          <TokenLogo logo={logo} />
          <TokenName name={symbol} />
        </>
      )}
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(StyledRowFlex)({
  gap: 10,
  width: "fit-content",
});
