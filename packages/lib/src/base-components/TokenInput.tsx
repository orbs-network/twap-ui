import { Box, styled } from "@mui/system";
import { useState } from "react";
import { StyledBorderWrapper, StyledShadowContainer } from "../styles";
import AmountInput from "./AmountInput";
import TokenDisplay from "./TokenDisplay";
import { FiEdit } from "react-icons/fi";
import Icon from "./Icon";
import { Typography } from "@mui/material";
import CustomButton from "./CustomButton";

interface Props {
  address: string;
  amount: string;
  onChange: (value: string) => void;
}

// TODO
const TokenInput = ({ address, amount, onChange }: Props) => {
  const [value, setValue] = useState("");

  // const {data: usdPrice} = useTokenUsdPrice(tokenAddress)

  const onSelectClick = () => {};

  return (
    <StyledContainer>
      <StyledTop>
        {!address ? (
          <StyledTokenSelect>
            <Typography>Select token</Typography>
          </StyledTokenSelect>
        ) : (
          <StyledTokenSelected>
            <TokenDisplay address={""} />
            <StyledIcon>
              <Icon icon={FiEdit} style={{ width: 22, height: 22 }} />
            </StyledIcon>
          </StyledTokenSelected>
        )}
        <StyledAmount>
          <AmountInput value={amount} onChange={onChange} />
        </StyledAmount>
        <StyledMaxButton>
          <CustomButton onClick={() => {}}>Max</CustomButton>
        </StyledMaxButton>
      </StyledTop>
      <StyledBottom>
        <StyledBalance>
          <StyledBalanceFigure />
          <Typography>
            Balance: <span>1</span>
          </Typography>
        </StyledBalance>
        <StyledUsdPrice>{/* $ {usdPrice} */}</StyledUsdPrice>
      </StyledBottom>
    </StyledContainer>
  );
};

export default TokenInput;

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

const StyledContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 20,
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
