import { styled } from "@mui/system";
import TokenSelectButton from "../components/TokenSelectButton";
import { useTwapStore } from "../store";
import { BaseComponentProps } from "../types";
import TokenLogoAndSymbol from "./TokenLogoAndSymbol";
import { IoIosArrowDown } from "react-icons/io";
import { Icon } from "../components";
import { StyledRowFlex } from "../styles";

interface SelectProps extends BaseComponentProps {
  onClick: () => void;
  hideArrow?: boolean;
}

interface Props extends SelectProps {
  isSrc?: boolean;
}

const StyledContainer = styled(StyledRowFlex)({
  cursor: "pointer",
  width: "fit-content",
});

const SelectedTokenButton = ({ onClick, isSrc, hideArrow = false }: Props) => {
  return (
    <StyledContainer onClick={onClick} className="twap-token-selected">
      <TokenLogoAndSymbol isSrc={isSrc} />
      {!hideArrow && <Icon icon={<IoIosArrowDown size={20} />} />}
    </StyledContainer>
  );
};

function SrcTokenSelect({ onClick, hideArrow }: SelectProps) {
  const token = useTwapStore((state) => state.srcToken);
  if (token) {
    return <SelectedTokenButton hideArrow={hideArrow} isSrc onClick={onClick} />;
  }
  return <TokenSelectButton onClick={onClick} />;
}

function DstTokenSelect({ onClick, hideArrow }: SelectProps) {
  const dstToken = useTwapStore((state) => state.dstToken);
  if (dstToken) {
    return <SelectedTokenButton hideArrow={hideArrow} onClick={onClick} />;
  }
  return <TokenSelectButton onClick={onClick} />;
}

const TokenSelect = ({ className, onClick, isSrc, hideArrow }: Props) => {
  if (isSrc) {
    return <SrcTokenSelect hideArrow={hideArrow} className={className} onClick={onClick} />;
  }
  return <DstTokenSelect hideArrow={hideArrow} className={className} onClick={onClick} />;
};

export default TokenSelect;
