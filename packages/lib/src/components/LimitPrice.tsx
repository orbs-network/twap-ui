import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import NumericInput from "../base-components/NumericInput";
import TokenLogo from "../base-components/TokenLogo";
import TokenName from "../base-components/TokenName";
import { store, validation } from "../store/store";
import PriceToggle from "../base-components/PriceToggle";
import Tooltip from "../base-components/Tooltip";
import Switch from "../base-components/Switch";

function LimitPrice({ placeholder = "0.00" }: { placeholder?: string }) {
  const { limitPriceUI, toggleInverted, onChange, leftTokenInfo, rightTokenInfo } = store.useLimitPrice();
  // TODO start from left input
  return (
    <StyledContainer className="twap-price">
      <StyledLeft>
        <Typography>1</Typography>
        <TokenName name={leftTokenInfo?.symbol} />
        <TokenLogo logo={leftTokenInfo?.logoUrl} />
        <Typography>=</Typography>
      </StyledLeft>
      <StyledNumeric>
        <NumericInput placeholder={placeholder} onChange={onChange} value={limitPriceUI?.toLocaleString()} />
      </StyledNumeric>
      <StyledRight>
        <TokenName name={rightTokenInfo?.symbol} />
        <TokenLogo logo={rightTokenInfo?.logoUrl} />
        <PriceToggle onClick={toggleInverted} />
      </StyledRight>
    </StyledContainer>
  );
}

export { LimitPrice };

export const LimitPriceSwitch = ({ className = "" }: { className?: string }) => {
  const { isLimitOrder, onToggleLimit } = store.useLimitPrice();
  const warning = validation.useLimitPriceToggleValidation();
  return (
    <Tooltip text={warning}>
      <Switch disabled={!!warning} className={className} value={!isLimitOrder} onChange={onToggleLimit} />
    </Tooltip>
  );
};

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
