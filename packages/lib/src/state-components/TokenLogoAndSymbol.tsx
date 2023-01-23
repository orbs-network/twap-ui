import React from "react";
import TokenDisplay from "../components/TokenDisplay";
import { useTwapStore } from "../store";

interface ComponentsProps {
  hideIfNullToken?: boolean;
}

function SrcToken({ hideIfNullToken }: ComponentsProps) {
  const token = useTwapStore((state) => state.srcToken);
  if (!token && hideIfNullToken) return null;
  return <TokenDisplay logo={token?.logoUrl} symbol={token?.symbol} />;
}

function DstToken({ hideIfNullToken }: ComponentsProps) {
  const token = useTwapStore((state) => state.dstToken);
  if (!token && hideIfNullToken) return null;
  return <TokenDisplay logo={token?.logoUrl} symbol={token?.symbol} />;
}

interface Props extends ComponentsProps {
  isSrc?: boolean;
}


//remove
function TokenLogoAndSymbol({ isSrc, hideIfNullToken }: Props) {
  if (isSrc) {
    return <SrcToken hideIfNullToken={hideIfNullToken} />;
  }
  return <DstToken hideIfNullToken={hideIfNullToken} />;
}

export default TokenLogoAndSymbol;
