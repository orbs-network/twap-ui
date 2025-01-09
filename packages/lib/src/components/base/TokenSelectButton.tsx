import { styled } from "@mui/material";
import Icon from "./Icon";
import Tooltip from "./Tooltip";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../store";
import { StyledOneLineText, StyledRowFlex } from "../../styles";
import { FC, ReactNode } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";

interface Props {
  onClick: () => void;
  className?: string;
  hideArrow?: boolean;
  customUi: ReactNode;
  customButtonElement?: FC;
  CustomArrow?: any;
}

function TokenSelectButton({ className = "", onClick, hideArrow, customUi, customButtonElement, CustomArrow = IoIosArrowDown }: Props) {
  const translations = useTwapContext().translations;

  const Btn = customButtonElement || StyledContainer;

  return (
    <Btn className={`twap-token-select ${className}`} onClick={onClick}>
      <StyledRowFlex>
        {customUi ? (
          <>{customUi}</>
        ) : (
          <>
            <StyledOneLineText>{translations.selectToken}</StyledOneLineText>
            {!hideArrow && <CustomArrow size={20} />}
          </>
        )}
      </StyledRowFlex>
    </Btn>
  );
}

export default TokenSelectButton;

const StyledContainer = styled("div")({
  cursor: "pointer",
});
