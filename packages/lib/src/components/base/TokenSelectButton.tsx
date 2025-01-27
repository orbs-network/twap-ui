import { styled } from "styled-components";
import Icon from "./Icon";
import { useWidgetContext } from "../../context/context";
import { StyledOneLineText, StyledRowFlex } from "../../styles";
import React, { FC, ReactNode } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { Tooltip } from "../Components";

interface Props {
  onClick: () => void;
  className?: string;
  hideArrow?: boolean;
  customUi: ReactNode;
  customButtonElement?: FC;
}

function TokenSelectButton({ className = "", onClick, hideArrow, customUi, customButtonElement }: Props) {
  const { translations, isWrongChain, account } = useWidgetContext();
  const maker = account;

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
    <Tooltip tooltipText={warning}>
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
