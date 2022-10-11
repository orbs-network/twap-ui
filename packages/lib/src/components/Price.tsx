import { IconButton, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import NumericInput from "../base-components/NumericInput";
import TokenLogo from "../base-components/TokenLogo";
import TokenName from "../base-components/TokenName";
import { TbArrowsRightLeft } from "react-icons/tb";
import { store } from "../store/store";

function Price({ placeholder = "0.00" }: { placeholder?: string }) {
  const { uiPrice, inverted, invertPrice, onChange, onFocus, onBlur } = store.usePrice();
  const { srcTokenAddress } = store.useSrcToken();
  const { dstTokenAddress } = store.useDstToken();

  const srcAddress = inverted ? dstTokenAddress : srcTokenAddress;
  const dstAddress = inverted ? srcTokenAddress : dstTokenAddress;

  return (
    <StyledContainer className="twap-price">
      <StyledLeft>
        <Typography>1</Typography>
        <TokenName address={srcAddress} />
        <TokenLogo address={srcAddress} />
        <Typography>=</Typography>
      </StyledLeft>
      <StyledNumeric>
        <NumericInput onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} onChange={onChange} value={uiPrice} />
      </StyledNumeric>
      <StyledRight>
        <TokenName address={dstAddress} />
        <TokenLogo address={dstAddress} />
        <IconButton onClick={invertPrice}>
          <TbArrowsRightLeft style={{ width: 20, height: 20 }} className="twap-price-icon" />
        </IconButton>
      </StyledRight>
    </StyledContainer>
  );
}

export default Price;

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
    textAlign: "center",
    width: "100%",
  },
});

const StyledNumeric = styled(Box)({
  flex: 1,
});
