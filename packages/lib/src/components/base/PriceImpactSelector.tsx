import { useState } from "react";
import { Box, fontSize, styled } from "@mui/system";
import { useTwapContext } from "../../context";
import NumericInput from "./NumericInput";
import { StyledPriceImpactText } from "../../styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

function PriceProtectionSelector({ value, onChange, disabled = false, className = "", onFocus, onBlur, placeholder = "0", icon = <IoIosArrowDown /> }: Props) {
  const [showList, setShowList] = useState(false);
  const translations = useTwapContext().translations;

  const onOpenListClick = () => {
    if (disabled) return;
    setShowList(true);
  };

  return (
    <StyledContainer className={`twap-price-impact-selector ${className}`} style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <StyledPriceImpactSelect onClick={onOpenListClick} className="twap-price-impact-selector-selected">
        <StyledTextAndIconContainer>
          <StyledInput>
            <NumericInput onBlur={onBlur} onFocus={onFocus} disabled={disabled} value={value} onChange={(v) => onChange(6)} placeholder={placeholder} />
          </StyledInput>
          <StyledPriceImpactText>%</StyledPriceImpactText>
        </StyledTextAndIconContainer>
        {icon}
      </StyledPriceImpactSelect>
    </StyledContainer>
  );
}

export default PriceProtectionSelector;

const StyledInput = styled(Box)({
  flex: "1 1 auto",
  display: "flex",
  alignItems: "center",
  ".twap-input": {
    width: "100%",
    input: {
      fontSize: 16,
      textAlign: "right",
      width: "100%",
      "&::placeholder": {
        color: "white",
      },
    },
  },
});

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flex: 1,
  gap: 2,
});

const StyledPriceImpactSelect = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: 12,
  gap: 8,
  maxWidth: 115,
  "& p": {
    fontSize: 16,
    fontWeight: 600,
  },
});

const StyledTextAndIconContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  width: "calc(100% - 24px)",
});
