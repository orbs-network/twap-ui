import React from "react";
import Avatar from "@mui/material/Avatar";
import { AiFillQuestionCircle } from "react-icons/ai";

function TokenLogo({ logo }: { logo?: string }) {
  return logo ? <Avatar className="twap-token-logo" alt="token logo" src={logo} /> : <AiFillQuestionCircle style={{ width: 20, height: 20 }} />;
}

export default TokenLogo;
