import { styled } from "@mui/system";
import { analytics } from "../analytics";
import { useOrdersContext } from "../context";
import { useTwapStore } from "../store";
import { StyledOneLineText } from "../styles";

console.debug = () => {};
const ODNP = require("@open-defi-notification-protocol/widget"); // eslint-disable-line

const odnp = new ODNP();
odnp.init();
odnp.hide();

odnp.mainDiv.classList = "odnp";

function OdnpButton({ className = "" }: { className?: string }) {
  const account = useTwapStore((state) => state.lib)?.maker;
  const translations = useOrdersContext().translations;
  if (!account) return null;

  const onClick = () => {
    analytics.onODNPClick();
    odnp.show(account, "twap");
  };
  return (
    <StyledButton className={`twap-odnp ${className}`} onClick={onClick}>
      <img src="https://open-defi-notifications.web.app/widget/assets/icon.png" />
      <StyledOneLineText>{translations.notify}</StyledOneLineText>
    </StyledButton>
  );
}

export default OdnpButton;

const StyledButton = styled("button")({
  borderRadius: "4px",
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0px 15px",
  cursor: "pointer",
  "& img": {
    width: 20,
  },
  "& p": {
    fontSize: 12,
    color: "inherit",
  },
});
