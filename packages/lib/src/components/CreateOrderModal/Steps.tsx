import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { styled } from "styled-components";
import { Spinner } from "../base";
import { Step, SwapStep } from "../../types";
import { useMemo } from "react";
import { RiSwapFill } from "@react-icons/all-files/ri/RiSwapFill";
import { RiCheckboxCircleFill } from "@react-icons/all-files/ri/RiCheckboxCircleFill";
import { useTwapContext } from "../../context/context";
import { useNetwork } from "../../hooks";

export const Steps = () => {
  const steps = useTwapContext().state.swapSteps;
  return (
    <StepsContainer>
      <StyledSteps>{steps?.map((step, index) => <StepComponent key={step} stepType={step} />)}</StyledSteps>
    </StepsContainer>
  );
};

const StyledSteps = styled(StyledColumnFlex)({
  gap: 0,
});

const StepsContainer = styled(StyledColumnFlex)({
  position: "relative",
  gap: 0,
});

export function StepComponent({ stepType }: { stepType: SwapStep }) {
  const step = useStep(stepType);
  if (!step) return null;
  const selected = step.status !== "disabled" ? 1 : 0;
  return (
    <StepContainer className="twap-step" selected={selected}>
      <StyledStep>
        <Logo step={step} />
        <StyledTitleAndLink>
          <StyledTitle className={`twap-step-title ${selected ? "twap-step-title-selected" : ""}`}>{step.title}</StyledTitle>
          {step.link && (
            <StyledLink href={step.link.url} target="_blank" className="twap-step-link">
              {step.link.text}
            </StyledLink>
          )}
        </StyledTitleAndLink>
        <StepStatus step={step} />
      </StyledStep>
      <StepDivider className="twap-step-divider" />
    </StepContainer>
  );
}

const StepStatus = ({ step }: { step: Step }) => {
  if (step.status === "completed") {
    return (
      <StyledSuccess>
        <FaCheck />
      </StyledSuccess>
    );
  }

  if (step.status === "pending") {
    return <StyledSpinner />;
  }

  return null;
};

const StyledSpinner = styled(Spinner)({
  width: 27,
  height: 27,
});

const useStep = (step?: SwapStep) => {
  const { state, srcToken } = useTwapContext();
  const { createOrdertxHash, approveTxHash, wrapTxHash, swapStep, createOrderSuccess, wrapSuccess, approveSuccess, swapSteps } = state;
  const nativeToken = useNetwork()?.native;
  return useMemo((): Step | undefined => {
    if (!step) return;
    const isWrapPending = swapStep === "wrap" && !wrapTxHash && !wrapSuccess;
    const isWrapLoading = swapStep === "wrap" && wrapTxHash && !wrapSuccess;
    const isApprovePending = swapStep === "approve" && !approveTxHash && !approveSuccess;
    const isApproveLoading = swapStep === "approve" && approveTxHash && !approveSuccess;
    const isCreatePending = swapStep === "createOrder" && !createOrdertxHash && !createOrderSuccess;
    const isCreateLoading = swapStep === "createOrder" && createOrdertxHash && !createOrderSuccess;

    if (step === "wrap") {
      return {
        title: `Wrap ${nativeToken?.symbol}`,
        Icon: RiSwapFill,
        image: nativeToken?.logoUrl,
        status: wrapSuccess ? "completed" : isWrapLoading ? "loading" : isWrapPending ? "pending" : "disabled",
      };
    }

    if (step === "approve") {
      return {
        title: `Approve ${srcToken?.symbol}`,
        Icon: RiCheckboxCircleFill,
        status: approveSuccess ? "completed" : isApproveLoading ? "loading" : isApprovePending ? "pending" : "disabled",
      };
    }

    if (step === "createOrder") {
      return {
        title: "Create Order",
        Icon: RiSwapFill,
        status: createOrderSuccess ? "completed" : isCreateLoading ? "loading" : isCreatePending ? "pending" : "disabled",
      };
    }
  }, [step, nativeToken, srcToken, createOrdertxHash, approveTxHash, wrapTxHash, swapStep, createOrderSuccess, wrapSuccess, approveSuccess, swapSteps]);
};

const StepContainer = styled(StyledColumnFlex)<{ selected: number }>(({ selected }) => ({
  gap: 0,
  "&:last-child": {
    ".twap-step-divider": {
      display: "none",
    },
  },

  ".twap-step-icon": {
    svg: {
      filter: `grayScale(${selected ? 0 : 1})`,
      opacity: selected ? 1 : 0.5,
    },
  },
  img: {
    filter: `grayScale(${selected ? 0 : 1})!important`,
    opacity: selected ? 1 : 0.5,
  },
  ".twap-step-link": {
    opacity: selected ? 1 : 0.7,
  },
}));

const StyledTitleAndLink = styled(StyledColumnFlex)({
  flex: 1,
  gap: 0,
});

const Logo = ({ step }: { step: Step }) => {
  return (
    <StyledStepLogo className="twap-step-logo">
      {step.image ? (
        <img src={step.image} alt={step.title} />
      ) : step.Icon ? (
        <div className="twap-step-icon">
          <step.Icon />
        </div>
      ) : null}
    </StyledStepLogo>
  );
};

const StyledLink = styled("a")({
  color: "rgb(252, 114, 255)",
  fontSize: 12,
  lineHeight: "16px",
  textDecoration: "unset",
});

const StyledStep = styled(StyledRowFlex)`
  width: 100%;
  gap: 12px;
  justify-content: flex-start;
  height: 40px;
`;

const StyledStepLogo = styled("div")`
  position: relative;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
  .twap-step-icon {
    svg {
      width: 26px;
      height: 26px;
      fill: rgb(76, 130, 251);
    }
  }
`;

const StyledTitle = styled(StyledText)({
  fontSize: 14,
  lineHeight: "16px",
});
const StyledSuccess = styled("div")`
  margin-left: auto;
  color: white;
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StepDivider = styled("div")`
  width: 2px;
  height: 10px;
  background-color: rgb(94, 94, 94);
  margin-left: 12px;
`;
