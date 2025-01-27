import { styled } from "@mui/system";
import { TokenData } from "@orbs-network/twap";
import { StyledRowFlex, StyledText } from "../../styles";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";

interface Props {
  symbol?: string;
  logo?: string;
  className?: string;
  reverse?: boolean;
  singleToken?: boolean;
  hideSymbol?: boolean;
  token?: TokenData;
  size?: string;
}

function TokenDisplay({ symbol, logo, className = "", reverse, singleToken, hideSymbol, token, size }: Props) {
  return (
    <StyledContainer className={`twap-token-display ${className}`}>
      {reverse ? (
        <>
          {singleToken && <StyledText>1</StyledText>}
          {!hideSymbol && <TokenName name={symbol} />}
          <TokenLogo size={size} logo={logo} token={token} />
        </>
      ) : (
        <>
          <TokenLogo size={size} logo={logo} token={token} />
          {singleToken && <StyledText>1</StyledText>}
          {!hideSymbol && <TokenName name={symbol} />}
        </>
      )}
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(StyledRowFlex)({
  gap: 12,
  width: "fit-content",
});
