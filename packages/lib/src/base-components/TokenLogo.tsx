import React from "react";
import Avatar from "@mui/material/Avatar";
import { AiFillQuestionCircle } from "react-icons/ai";

function TokenLogo({ logo, className = "" }: { logo?: string; className?: string }) {
  return logo ? <Avatar className={`twap-token-logo ${className}`} alt="token logo" src={logo} /> : <AiFillQuestionCircle style={{ width: 20, height: 20 }} />;
}

export default TokenLogo;
