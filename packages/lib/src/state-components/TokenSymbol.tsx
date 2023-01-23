import React from "react";
import { useTwapStore } from "../store";
import { StyledText } from "../styles";

interface Props {
  isSrc?: boolean;
}

function SrcSymbol() {
  const token = useTwapStore((store) => store.srcToken);
  return <StyledText className="twap-token-symbol">{token?.symbol}</StyledText>;
}

function DstSymbol() {
  const token = useTwapStore((store) => store.dstToken);
  return <StyledText className="twap-token-symbol">{token?.symbol}</StyledText>;
}

const TokenSymbol = ({ isSrc }: Props) => {
  if (isSrc) {
    return <SrcSymbol />;
  }
  return <DstSymbol />;
};

export default TokenSymbol;
