import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import NumericInput from "./NumericInput";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import PriceToggle from "./PriceToggle";
import { TokenData } from "@orbs-network/twap";

function LimitPrice({
  placeholder = "0.00",
  price,
  toggleInverted,
  onChange,
  leftToken,
  rightToken,
}: {
  placeholder?: string;
  price?: string;
  toggleInverted: () => void;
  leftToken?: TokenData;
  rightToken?: TokenData;
  onChange: (value?: string) => void;
}) {
  return (
    <StyledContainer className="twap-price">
      <StyledLeft>
        <Typography>1</Typography>
        <TokenName name={leftToken?.symbol} />
        <TokenLogo logo={leftToken?.logoUrl} />
        <Typography>=</Typography>
      </StyledLeft>
      <StyledNumeric>
        <NumericInput placeholder={placeholder} onChange={onChange} value={price} />
      </StyledNumeric>
      <StyledRight>
        <TokenName name={rightToken?.symbol} />
        <TokenLogo logo={rightToken?.logoUrl} />
        <PriceToggle onClick={toggleInverted} />
      </StyledRight>
    </StyledContainer>
  );
}

export { LimitPrice };

const StyledLeft = styled(Box)({
  display: "flex",
  gap: 10,
  alignItems: "center",
});

const StyledRight = styled(Box)({
  display: "flex",
  gap: 10,
  alignItems: "center",
});

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "100%",
  "& .twap-input": {
    fontSize: 16,
    textAlign: "left",
    width: "100%",
  },
});

const StyledNumeric = styled(Box)({
  flex: 1,
});
