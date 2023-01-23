import React from "react";
import { BaseComponentProps } from "..";
import { NumericInput } from "../components";
import { useLoadingState } from "../hooks";
import { useTwapStore } from "../store";

interface InputProps extends BaseComponentProps {
  placeholder?: string;
}

function SrcTokenInput({ placeholder, className }: InputProps) {
  const decimalScale = useTwapStore((store) => store.srcToken?.decimals);
  const usdLoading = useLoadingState().srcUsdLoading;
  const amount = useTwapStore((store) => store.srcAmountUi);
  const setSrcAmountUi = useTwapStore((store) => store.setSrcAmountUi);
  const inputLoading = (!!amount || amount !== "0") && usdLoading;
  return (
    <NumericInput
      className={className}
      decimalScale={decimalScale}
      prefix=""
      loading={inputLoading}
      disabled={false}
      placeholder={placeholder || "0.0"}
      onChange={setSrcAmountUi}
      value={amount}
    />
  );
}

function DstTokenInput({ placeholder, className }: InputProps) {
  const decimalScale = useTwapStore((store) => store.dstToken?.decimals);
  const usdLoading = useLoadingState().dstUsdLoading;
  const amount = useTwapStore((store) => store.getDstAmountUi());
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const inputLoading = (!!amount || amount !== "0") && usdLoading;
  return (
    <NumericInput
      className={className}
      decimalScale={decimalScale}
      prefix={isLimitOrder ? "≥" : "~"}
      loading={inputLoading}
      disabled={true}
      placeholder={placeholder || "0.0"}
      onChange={() => {}}
      value={amount}
    />
  );
}

interface Props extends InputProps {
  isSrc?: boolean;
}

const TokenInput = ({ isSrc, className, placeholder }: Props) => {
  if (isSrc) {
    return <SrcTokenInput className={className} placeholder={placeholder} />;
  }
  return <DstTokenInput className={className} placeholder={placeholder} />;
};

export default TokenInput;
