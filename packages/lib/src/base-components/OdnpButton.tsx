import { Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import React from "react";
import { useWeb3 } from "../store/store";

console.debug = () => {};
const ODNP = require("@open-defi-notification-protocol/widget");
const odnp = new ODNP();
odnp.init();
odnp.hide();

function OdnpButton({ className = "" }: { className?: string }) {
  const { account } = useWeb3();
  if (!account) return null;
  return (
    <StyledButton className={className} onClick={() => odnp.show(account, "twap")}>
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
  padding: "0px 20px",
  cursor: "pointer",
  "& p": {
    fontSize: 12,
    color: "white",
  },
});
