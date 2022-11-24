import { Box, styled } from "@mui/system";
import { TokenData } from "@orbs-network/twap";
import { TbArrowsRightLeft } from "react-icons/tb";
import Icon from "./Icon";
import IconButton from "./IconButton";
import NumberDisplay from "./NumberDisplay";
import Text from "./Text";
import TokenLogo from "./TokenLogo";
import TokenName from "./TokenName";
import Tooltip from "./Tooltip";

export interface Props {
  leftToken?: TokenData;
  rightToken?: TokenData;
  price?: string;
  className?: string;
  toggleInverted: () => void;
}

function TokenPriceCompare({ leftToken, rightToken, price, className, toggleInverted }: Props) {
  return (
    <StyledContainer className={className}>
      <TokenLogo logo={leftToken?.logoUrl} />
      <Text>1</Text>
      <TokenName name={leftToken?.symbol} />
      <IconButton onClick={toggleInverted}>
        <Icon icon={<TbArrowsRightLeft />} />
      </IconButton>

      <TokenLogo logo={rightToken?.logoUrl} />
      <Tooltip text={price}>
        <Text>
          <NumberDisplay value={price} />
        </Text>
      </Tooltip>
      <TokenName name={rightToken?.symbol} />
    </StyledContainer>
  );
}

export default TokenPriceCompare;

const StyledContainer = styled(Box)({
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
