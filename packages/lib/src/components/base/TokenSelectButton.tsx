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
}

function TokenSelectButton({ className = "", onClick, hideArrow, customUi, customButtonElement }: Props) {
  const { translations, isWrongChain, lib } = useTwapContext();
  const maker = lib?.maker;

  const selectTokenWarning = () => {
    if (isWrongChain) {
      return translations.switchNetwork;
    }
    if (!maker) {
      return translations.connect;
    }
  };

  const warning = selectTokenWarning();

  const _onClick = () => {
    if (warning) return;
    onClick();
  };

  const Btn = customButtonElement || StyledContainer;

  return (
    <Tooltip text={warning}>
      <Btn className={`twap-token-select ${className}`} onClick={_onClick}>
        <StyledRowFlex>
          {customUi ? (
            <>{customUi}</>
          ) : (
            <>
              <StyledOneLineText>{translations.selectToken}</StyledOneLineText>
              {!hideArrow && <Icon icon={<IoIosArrowDown size={20} />} />}
            </>
          )}
        </StyledRowFlex>
      </Btn>
    </Tooltip>
  );
}

export default TokenSelectButton;

const StyledContainer = styled("div")({
  cursor: "pointer",
});
