import { styled } from "@mui/system";
import { useTwapContext } from "../context";
import { StyledOneLineText } from "../styles";
import Icon from "./Icon";
import { IoIosArrowDown } from "react-icons/io";
import Tooltip from "./Tooltip";
import { useTwapStore } from "../store";

interface Props {
  onClick: () => void;
  className?: string;
}

function TokenSelectButton({ className = "", onClick }: Props) {
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
        <StyledOneLineText>{translations.selectToken}</StyledOneLineText>
        <Icon icon={<IoIosArrowDown size={20} />} />
      </StyledContainer>
    </Tooltip>
  );
}

export default TokenSelectButton;

const StyledContainer = styled("div")({});
