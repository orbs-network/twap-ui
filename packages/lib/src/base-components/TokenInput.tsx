import { Box, styled } from "@mui/system";
import { StyledBorderWrapper, StyledBoxWithDetails, StyledShadowContainer, StyledSmallTextDetail } from "../styles";
import AmountInput from "./AmountInput";
import TokenDisplay from "./TokenDisplay";
import { FiEdit } from "react-icons/fi";
import Icon from "./Icon";
import { Typography } from "@mui/material";
import CustomButton from "./CustomButton";
import { parsebn } from "@defi.org/web3-candies";

export type Props = {
  address?: string;
  amount?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

const TokenInput = ({ address = "", amount = "", onChange, disabled }: Props) => {
  return (
    <StyledContainer>
      <StyledTop>
        <TokenInputSelect address={address} />
        <StyledAmount>
          <AmountInput disabled={disabled} value={amount} onChange={(values) => onChange?.(values.toString())} />
        </StyledAmount>
        {!disabled && (
          <StyledMaxButton>
            <CustomButton onClick={() => {}}>Max</CustomButton>
          </StyledMaxButton>
        )}
      </StyledTop>
      <StyledBottom>
        <StyledBalance>
          <StyledBalanceFigure />
          <StyledSmallTextDetail>
            Balance: <span>1</span>
          </StyledSmallTextDetail>
        </StyledBalance>
        <StyledUsdPrice>{/* $ {usdPrice} */}</StyledUsdPrice>
      </StyledBottom>
    </StyledContainer>
  );
};

export default TokenInput;

const TokenInputSelect = ({ address }: { address?: string }) => {
  return !address ? (
    <StyledTokenSelect>
      <Typography>Select token</Typography>
    </StyledTokenSelect>
  ) : (
    <StyledTokenSelected>
      <TokenDisplay address={address} />
      <StyledIcon>
        <Icon icon={FiEdit} style={{ width: 22, height: 22 }} />
      </StyledIcon>
    </StyledTokenSelected>
  );
};

const StyledUsdPrice = styled(Typography)({});

const StyledBalance = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});

const StyledMaxButton = styled(Box)({
  width: 60,
  height: "100%",
});

const StyledBalanceFigure = styled(Box)({
  width: 10,
  height: 10,
  background: "#FBD6F5",
  borderRadius: "50%",
  position: "relative",
  " &::after": {
    position: "absolute",
    left: "50%",
    transform: "translate(-50%, -50%)",
    top: "50%",
    content: "''",
    background: "#FF7884",
    width: 5,
    height: 5,
    borderRadius: "50%",
  },
});

const StyledContainer = styled(StyledBoxWithDetails)({
  width: "100%",
});

const StyledTop = styled(StyledBorderWrapper)({});

const StyledBottom = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});

const StyledAmount = styled(Box)({
  flex: 1,
  height: "100%",
});

const StyledTokenSelected = styled(StyledShadowContainer)({
  justifyContent: "space-between",
  paddingRight: 12,
  cursor: "pointer",
});

const StyledTokenSelect = styled(StyledShadowContainer)({
  justifyContent: "center",
  padding: 0,
  cursor: "pointer",
});

const StyledIcon = styled("span")({
  marginLeft: 10,
  display: "flex",
  alignItems: "center",
});
