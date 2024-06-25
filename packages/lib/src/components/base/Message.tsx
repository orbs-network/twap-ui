import { styled, Typography } from "@mui/material";
import { AiOutlineWarning } from "@react-icons/all-files/ai/AiOutlineWarning";
import { ReactNode } from "react";

export function Message({ text, className = "", type }: { text: ReactNode; className?: string; type?: "warning" }) {
  if (type === "warning") {
    return (
      <StyledWarning className={`${className} twap-message twap-warning`}>
        <AiOutlineWarning />
        {` ${text}`}
      </StyledWarning>
    );
  }

  return <StyledMessage className={`${className} twap-message`}>{text}</StyledMessage>;
}

const Shared = styled("p")({
  margin: 0,
  marginTop: 7,
});

const StyledMessage = styled(Shared)({});

const StyledWarning = styled(Shared)({
  svg: {
    position: "relative",
    top: 2,
  },
});
