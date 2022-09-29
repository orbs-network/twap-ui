import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import NumericInput from "./NumericInput";
import TokenName from "./TokenName";

function PriceInput({ srcTokenAddress, dstTokenAddress, onChange }: { srcTokenAddress: string; dstTokenAddress: string; onChange: (value: string) => void }) {
  return (
    <StyledContainer className="twap-price">
      <Typography>1</Typography>
      <TokenName address={srcTokenAddress} />
      <Typography>=</Typography>
      <NumericInput placeholder="0.00" onChange={onChange} />
      <TokenName address={dstTokenAddress} />
    </StyledContainer>
  );
}

export default PriceInput;

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  justifyContent:   'flex-end',
  "& .twap-input":{
    flex:'unset'
  }
});
