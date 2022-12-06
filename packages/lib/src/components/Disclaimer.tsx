import styled from "@emotion/styled";
import { Box } from "@mui/system";
import { useTwapContext } from "../context";
import { useTwapStore } from "../store";
import { StyledText } from "../styles";

const Disclaimer = () => {
  const translations = useTwapContext().translations;
  const lib = useTwapStore((state) => state.lib);
  return (
    <StyledTradeInfoExplanation>
      <StyledText>{translations.disclaimer1}</StyledText>
      <StyledText>{translations.disclaimer2}</StyledText>
      <StyledText>{translations.disclaimer3}</StyledText>
      <StyledText>{translations.disclaimer4}</StyledText>
      <StyledText>{translations.disclaimer5.replace("{{dex}}", lib?.config.partner || "DEX")}</StyledText>

      <StyledText>
        {translations.disclaimer6}{" "}
        <a href="https://github.com/orbs-network/twap" target="_blank">
          {translations.link}
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          {translations.link}
        </a>
        .
      </StyledText>
    </StyledTradeInfoExplanation>
  );
};

export default Disclaimer;

const StyledTradeInfoExplanation = styled(Box)({
  maxHeight: 140,
  overflow: "auto",
  paddingRight: 30,
  display: "flex",
  flexDirection: "column",
  gap: 10,
});
