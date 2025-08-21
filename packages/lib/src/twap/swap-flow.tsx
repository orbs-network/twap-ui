import React, { FC, ReactNode } from "react";
import { Step, SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { LinkProps, Token } from "../types";
import { useFormatNumber } from "../hooks/useFormatNumber";

export function SwapFlowComponent({
  failedContent,
  successContent,
  mainContent,
  LoadingView,
  totalSteps,
  currentStep,
  currentStepIndex,
  swapStatus,
  className = "",
  inToken,
  outToken,
  srcAmount,
  dstAmount,
  TokenLogo,
  Spinner,
  SuccessIcon,
  FailedIcon,
  Link,
}: {
  failedContent: React.ReactNode;
  successContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  LoadingView?: React.ReactNode;
  totalSteps?: number;
  currentStep?: Step;
  currentStepIndex?: number;
  swapStatus?: SwapStatus;
  className?: string;
  inToken?: Token;
  outToken?: Token;
  srcAmount?: string;
  dstAmount?: string;
  TokenLogo?: FC<{ token?: Token }>;
  Spinner?: ReactNode;
  SuccessIcon?: ReactNode;
  FailedIcon?: ReactNode;
  Link?: FC<LinkProps>;
}) {
  const srcAmountF = useFormatNumber({ value: srcAmount, decimalScale: 2 });
  const outAmountF = useFormatNumber({ value: dstAmount, decimalScale: 2 });
  return (
    <SwapFlow
      className={className}
      inAmount={srcAmountF}
      outAmount={outAmountF}
      swapStatus={swapStatus}
      totalSteps={totalSteps}
      currentStep={currentStep}
      currentStepIndex={currentStepIndex}
      inToken={inToken}
      outToken={outToken}
      components={{
        SrcTokenLogo: TokenLogo && <TokenLogo token={inToken} />,
        DstTokenLogo: TokenLogo && <TokenLogo token={outToken} />,
        Failed: failedContent,
        Success: successContent,
        Main: mainContent,
        Loader: Spinner,
        SuccessIcon: SuccessIcon,
        FailedIcon: FailedIcon,
        Link: Link,
        LoadingView,
      }}
    />
  );
}
