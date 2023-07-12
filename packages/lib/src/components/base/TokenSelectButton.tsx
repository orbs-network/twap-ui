import { styled } from "@mui/material";
import Icon from "./Icon";
import { IoIosArrowDown } from "react-icons/io";
import Tooltip from "./Tooltip";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../store";
import { StyledOneLineText, StyledRowFlex } from "../../styles";
import { ReactNode } from "react";

interface Props {
  onClick: () => void;
  className?: string;
  hideArrow?: boolean;
  customUi: ReactNode;
}

function TokenSelectButton({ className = "", onClick, hideArrow, customUi }: Props) {
  const translations = useTwapContext().translations;
  const wrongNetwork = useTwapStore((state) => state.wrongNetwork);
  const maker = useTwapStore((state) => state.lib?.maker);

  const selectTokenWarning = () => {
    if (wrongNetwork) {
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

  return (
    <Tooltip text={warning}>
      <StyledContainer className={`twap-token-select ${className}`} onClick={_onClick}>
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
      </StyledContainer>
    </Tooltip>
  );
}

export default TokenSelectButton;

const StyledContainer = styled("div")({
  cursor: "pointer",
});
