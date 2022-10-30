import React from "react";
import { useWeb3 } from "../store/store";

const ODNP = require("@open-defi-notification-protocol/widget");

const odnp = new ODNP();
odnp.init();
odnp.hide();

function OdnpButton() {
  const { account } = useWeb3();
  if (!account) return null;
  return <button onClick={() => odnp.show(account, "twap")}>ODNP</button>;
}

export default OdnpButton;
