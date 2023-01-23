import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { TbArrowsRightLeft } from "react-icons/tb";
import { IconButton, NumericInput } from "../components";
import TokenDisplay from "../components/TokenDisplay";
import { useLimitPrice } from "../hooks";
import { useTwapStore } from "../store";

function LimitPrice({ placeholder = "0.00" }: { placeholder?: string }) {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = useLimitPrice();

  if (!isLimitOrder) return null;
  return (
    <StyledContainer className="twap-price">
      <StyledLeft>
        <Typography>1</Typography>
        <TokenDisplay symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />
        <Typography>=</Typography>
      </StyledLeft>
      <StyledNumeric>
        <NumericInput placeholder={placeholder} onChange={onChange} value={limitPrice} />
      </StyledNumeric>
      <StyledRight>
        <TokenDisplay symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />

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
