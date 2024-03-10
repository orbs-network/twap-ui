import { styled, Typography } from "@mui/material";
import React from "react";
import { StyledRowFlex } from "../../styles";
import { HiArrowRight } from "@react-icons/all-files/hi/HiArrowRight";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";

import IconButton from "./IconButton";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  text: string;
}

function Pagination({ onPrev, onNext, className = "", hasNextPage, hasPrevPage, text }: Props) {
  return (
    <Container className={className}>
      <StyledIconButton hasNext={!hasPrevPage ? 1 : 0} onClick={onPrev}>
        <HiArrowLeft />
      </StyledIconButton>
      <StyledText>{text}</StyledText>
      <StyledIconButton hasNext={!hasNextPage ? 1 : 0} onClick={onNext}>
        <HiArrowRight />
      </StyledIconButton>
    </Container>
  );
}

const StyledIconButton = styled("button")<{ hasNext: number }>(({ hasNext }) => {
  return {
    cursor: hasNext ? "not-allowed" : "pointer",
    color: "inherit",
    opacity: hasNext ? 0.5 : 1,
    backgroundColor: "transparent",
    border: "none",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    svg: {
      width: 20,
      height: 20,
    },
  };
});

export default Pagination;

const StyledText = styled(Typography)({
  fontSize: 14,
});

const Container = styled(StyledRowFlex)({
  gap: 20,
  marginTop: 20,
});
