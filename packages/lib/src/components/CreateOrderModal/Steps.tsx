import { useSwapSteps } from "../../hooks";
import { Border } from "./Components";
import _ from "lodash";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { styled } from "@mui/material";
import { Spinner } from "../base";
import { Step, SwapState } from "../../types";
import { useTwapStore } from "../../store";

export const Steps = () => {
  const { steps } = useSwapSteps();
  return (
    <StepsContainer>
      <StyledSteps>
        {steps.map((step, index) => (
          <StepComponent key={step.title} step={step} />
        ))}
      </StyledSteps>
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

interface Props {
  step: Step;
}

export function StepComponent({ step }: Props) {
  return (
    <StepContainer className="twap-step" selected={step.status !== "disabled" ? 1 : 0}>
      <StyledStep>
        <Logo step={step} />
        <StyledTitleAndLink>
          <StyledTitle className="twap-step-title">{step.title}</StyledTitle>
          {step.link && (
            <StyledLink href={step.link.url} target="_blank" className="twap-step-link">
              {step.link.text}
            </StyledLink>
          )}
        </StyledTitleAndLink>
        {step.status === "completed" && (
          <StyledSuccess>
            <FaCheck />
          </StyledSuccess>
        )}
      </StyledStep>
      <StepDivider className="twap-step-divider" />
    </StepContainer>
  );
}

const StepContainer = styled(StyledColumnFlex)<{ selected: number }>(({ selected }) => ({
  gap: 0,
  "&:last-child": {
    ".twap-step-divider": {
      display: "none",
    },
  },
  ".twap-step-title": {
    color: selected ? "white" : "rgb(155, 155, 155)",
  },
  ".twap-step-icon": {
    filter: `grayScale(${selected ? 0 : 1})`,
    opacity: selected ? 1 : 0.5,
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
  const { swapState } = useTwapStore((s) => ({
    swapState: s.swapState,
  }));

  return (
    <StyledStepLogo className="twap-step-logo">
      {swapState === "loading" ? <Spinner size={26} /> : step.image ? <img src={step.image} alt={step.title} /> : step.Icon ? <step.Icon className="twap-step-icon" /> : null}
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
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
  .twap-step-icon {
    width: 26px;
    height: 26px;
    fill: rgb(76, 130, 251);
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
