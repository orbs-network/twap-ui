import { BigNumber, convertDecimals } from "@defi.org/web3-candies";
import { Box, styled } from "@mui/system";
import React, { useState } from "react";
import { IoMdLogIn } from "react-icons/io";
import { TbArrowsRightLeft } from "react-icons/tb";
import { usePrice } from "../store/store";
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
  srcToken: TokenInfo;
  dstToken: TokenInfo;
  srcTokenPrice: string;
  dstTokenPrice: string;
  className?: string;
}

function TokenPriceCompare({ srcToken, dstToken, srcTokenPrice, dstTokenPrice, className }: Props) {
  const { toggleInverted, leftTokenInfo, rightTokenInfo, price } = usePrice(srcToken, dstToken, BigNumber(srcTokenPrice), BigNumber(dstTokenPrice));

  return (
    <StyledContainer className={className}>
      <SmallLabel>Market</SmallLabel>
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

export default TokenPriceCompare;

const StyledContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
});

const StyledRight = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 5,
});
