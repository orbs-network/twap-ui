import { styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { TokenLogo } from "../base";
import { useTokenDisplay } from "./hooks";


export const TokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const { amount, token, usd, title } = useTokenDisplay(isSrc);

  return (
    <Container>
      <Title>{title}</Title>
      <StyledMiddle>
        <Amount>
          {amount} {token?.symbol}
        </Amount>
        <Logo logo={token?.logoUrl} />
      </StyledMiddle>
      <Usd>${usd}</Usd>
    </Container>
  );
};

const StyledMiddle = styled(StyledRowFlex)({
  width: "100%",
  justifyContent: "space-between",
});

const Usd = styled(StyledText)({
  opacity: 0.7,
  fontSize: 14,
});

const Amount = styled(StyledText)({
  fontSize: 29,
  lineHeight: "30px",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const Logo = styled(TokenLogo)({
  width: 36,
  height: 36,
});
const Title = styled(StyledText)({
  opacity: 0.7,
  fontSize: 14,
});
const Container = styled(StyledColumnFlex)({
  alignItems: "flex-start",
  gap: 4,
});
