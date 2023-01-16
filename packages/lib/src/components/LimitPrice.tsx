import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import NumericInput from "./NumericInput";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import { TbArrowsRightLeft } from "react-icons/tb";
import { TokenData } from "@orbs-network/twap";
import IconButton from "./IconButton";

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
        <IconButton onClick={toggleInverted} icon={<TbArrowsRightLeft style={{ width: 20, height: 20 }} />}></IconButton>
      </StyledRight>
    </StyledContainer>
  );
}

export default LimitPrice;

const StyledLeft = styled(Box)({
  display: "flex",
  gap: 10,
  alignItems: "center",
  paddingLeft: 5,
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
  "& .twap-token-logo": {
    width: 28,
    height: 28,
  },
  "& .twap-token-name": {
    fontSize: 16,
  },
});

const StyledNumeric = styled(Box)({
  flex: 1,
  padding: "0px 10px",
});
