import React from "react";
import { useTwapStore } from "../store";
import Logo from "../components/TokenLogo";

interface Props {
  isSrc?: boolean;
}

function SrcLogo() {
  const token = useTwapStore((store) => store.srcToken);
  return <Logo logo={token?.logoUrl} />;
}

function DstLogo() {
  const token = useTwapStore((store) => store.dstToken);
  return <Logo logo={token?.logoUrl} />;
}

const TokenLogo = ({ isSrc }: Props) => {
  if (isSrc) {
    return <SrcLogo />;
  }
  return <DstLogo />;
};

export default TokenLogo;
