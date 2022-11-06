import { Box, styled } from "@mui/system";
import React from "react";
import { TbArrowsRightLeft } from "react-icons/tb";
import { TokenInfo } from "../types";
import Icon from "./Icon";
import IconButton from "./IconButton";
import NumberDisplay from "./NumberDisplay";
import SmallLabel from "./SmallLabel";
import Text from "./Text";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import Tooltip from "./Tooltip";

export interface Props {
  leftTokenInfo: TokenInfo;
  rightTokenInfo: TokenInfo;
  price?: string;
  className?: string;
  toggleInverted: () => void;
  isMarketOrder: boolean;
}

function PriceDisplay({ leftTokenInfo, rightTokenInfo, price, className, toggleInverted, isMarketOrder }: Props) {
  return (
    <StyledContainer className={className}>
      <SmallLabel>{isMarketOrder ? "Market order" : "Limit order"}</SmallLabel>
      <StyledRight>
        <TokenLogo logo={leftTokenInfo?.logoUrl} />
        <Text>1</Text>
        <TokenName name={leftTokenInfo?.symbol} />
        <IconButton onClick={toggleInverted}>
          <Icon icon={<TbArrowsRightLeft />} />
        </IconButton>

        <TokenLogo logo={rightTokenInfo?.logoUrl} />
        <Tooltip text={price?.toString()}>
          <Text>
            <NumberDisplay value={price?.toString()} />
          </Text>
        </Tooltip>
        <TokenName name={rightTokenInfo?.symbol} />
      </StyledRight>
    </StyledContainer>
  );
}

export default PriceDisplay;

const StyledContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});

const StyledRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
  "& * ": {
    fontSize: 14,
  },
  "& .twap-token-logo": {
    width: 22,
    height: 22,
  },
});
