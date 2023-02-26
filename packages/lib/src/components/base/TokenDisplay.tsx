import { styled } from "@mui/system";
import { StyledRowFlex, StyledText } from "../../styles";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";

interface Props {
  symbol?: string;
  logo?: string;
  className?: string;
  reverse?: boolean;
  singleToken?: boolean;
}

function TokenDisplay({ symbol, logo, className = "", reverse, singleToken }: Props) {
  return (
    <StyledContainer className={`twap-token-display ${className}`}>
      {reverse ? (
        <>
          {singleToken && <StyledText>1</StyledText>}
          <TokenName name={symbol} />
          <TokenLogo logo={logo} />
        </>
      ) : (
        <>
          <TokenLogo logo={logo} />
          {singleToken && <StyledText>1</StyledText>}
          <TokenName name={symbol} />
        </>
      )}
    </StyledContainer>
  );
}

export default TokenDisplay;

const StyledContainer = styled(StyledRowFlex)({
  gap: 8,
  width: "fit-content",
});
