import React from "react";
import Avatar from "@mui/material/Avatar";

function TokenLogo({ logo }: { logo?: string }) {
  return <Avatar className="twap-token-logo" alt="token logo" src={logo} />;
}

export default TokenLogo;
