import { Box, styled } from "@mui/system";
import { TokenData } from "@orbs-network/twap";
import { TbArrowsRightLeft } from "react-icons/tb";
import { Loader, Tooltip } from ".";
import { useFormatNumber } from "../../hooks";
import { StyledText, StyledOneLineText } from "../../styles";
import Icon from "./Icon";
import IconButton from "./IconButton";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";

export interface Props {
  leftToken?: TokenData;
  rightToken?: TokenData;
  price?: string;
  className?: string;
  toggleInverted: () => void;
  loading?: boolean;
}

function TokenPriceCompare({ leftToken, rightToken, price, className, toggleInverted, loading }: Props) {
  const formattedValue = useFormatNumber({ value: price });
  const formattedValueTooltip = useFormatNumber({ value: price, decimalScale: 18 });

  if (loading) {
    return (
      <StyledContainer>
        <Loader width={120} height={30} />
      </StyledContainer>
    );
  }

  if (!leftToken || !rightToken) {
    return (
      <StyledContainer>
        <StyledText>-</StyledText>
      </StyledContainer>
    );
  }
  return (
    <StyledContainer className={`twap-price-compare ${className}`}>
      <TokenLogo logo={leftToken?.logoUrl} />
      <StyledText>1</StyledText>
      <TokenName name={leftToken?.symbol} />
      <IconButton onClick={toggleInverted}>
        <Icon icon={<TbArrowsRightLeft />} />
      </IconButton>

      <TokenLogo logo={rightToken?.logoUrl} />
      <Tooltip text={`${formattedValueTooltip} ${rightToken.symbol}`}>
        {`${formattedValue} `}
        {rightToken?.symbol}
      </Tooltip>
    </StyledContainer>
  );
}

export default TokenPriceCompare;

const StyledContainer = styled(Box)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "flex",
  justifyContent: "space-between",
  gap: 5,
  alignItems: "center",
  "& * ": {
    fontSize: 14,
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});
