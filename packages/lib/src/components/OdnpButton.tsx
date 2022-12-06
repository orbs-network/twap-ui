import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useSendAnalyticsEvents } from "../analytics";
import { useTwapStore } from "../store";

console.debug = () => {};
const ODNP = require("@open-defi-notification-protocol/widget"); // eslint-disable-line

const odnp = new ODNP();
odnp.init();
odnp.hide();

odnp.mainDiv.classList = "odnp";

function OdnpButton({ className = "" }: { className?: string }) {
  const account = useTwapStore((state) => state.lib)?.maker;
  const onODNPClick = useSendAnalyticsEvents().onODNPClick;
  if (!account) return null;

  const onClick = () => {
    onODNPClick();
    odnp.show(account, "twap");
  };
  return (
    <StyledButton className={className} onClick={onClick}>
      <img src="https://open-defi-notifications.web.app/widget/assets/icon.png" />
      <Typography>Notify me</Typography>
    </StyledButton>
  );
}

export default OdnpButton;

const StyledButton = styled("button")({
  background: "transparent",
  borderRadius: "4px",
  border: "0.75px solid #26A7EF",
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
    color: "white",
  },
});
