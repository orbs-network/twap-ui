import { styled } from "styled-components";
import { TokenData } from "@orbs-network/twap";
import { Button, Loader } from ".";
import { useFormatNumber } from "../../hooks";
import { StyledRowFlex, StyledText } from "../../styles";
import Icon from "./Icon";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import { FaExchangeAlt } from "@react-icons/all-files/fa/FaExchangeAlt";

export interface Props {
  leftToken?: TokenData;
  rightToken?: TokenData;
  price?: string | number;
  className?: string;
  toggleInverted: () => void;
  loading?: boolean;
}

function TokenPriceCompare({ leftToken, rightToken, price, className = "", toggleInverted, loading }: Props) {
  const _toggleInverted = () => {
    toggleInverted();
  };

  if (loading) {
    return (
      <StyledContainer>
        <Loader width={120} height={30} />
      </StyledContainer>
    );
  }

  if (!leftToken || !rightToken) {
    return (
      <StyledContainer className="twap-price-compare">
        <StyledText>-</StyledText>
      </StyledContainer>
    );
  }
  return (
    <StyledContainer className={`twap-price-compare ${className}`}>
      <LeftToken token={leftToken} />
      <Button onClick={_toggleInverted}>
        <FaExchangeAlt />
      </Button>
      <RightToken price={price} token={rightToken} />
    </StyledContainer>
  );
}

const LeftToken = ({ token }: { token?: TokenData }) => {
  return (
    <StyledRowFlex style={{ width: "auto", gap: 5 }} className="left-token">
      <TokenLogo logo={token?.logoUrl} />
      <StyledText className="value">1</StyledText>
      <TokenName name={token?.symbol} />
    </StyledRowFlex>
  );
};

const RightToken = ({ token, price }: { token?: TokenData; price?: string | number }) => {
  const formattedValue = useFormatNumber({ value: price });
  return (
    <StyledRowFlex style={{ width: "auto", gap: 5 }} className="right-token">
      <TokenLogo logo={token?.logoUrl} />
      <StyledRowFlex width="auto" gap={5}>
        <span className="value"> {`${formattedValue} `}</span>
        <span className="symbol"> {token?.symbol}</span>
      </StyledRowFlex>
    </StyledRowFlex>
  );
};
export default TokenPriceCompare;

TokenPriceCompare.LeftToken = LeftToken;
TokenPriceCompare.RightToken = RightToken;

const StyledContainer = styled("div")({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "flex",
  justifyContent: "space-between",
  gap: 3,
  alignItems: "center",
  "& * ": {
    fontSize: 14,
  },
  svg: {
    fontSize: "20px",
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
    minWidth: 22,
    minHeight: 22,
  },
});
