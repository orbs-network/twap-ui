import { styled } from "@mui/material";
import React from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { copy } from "../../utils";
function Copy({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <StyledCopy onClick={() => copy(value)}>
      <MdOutlineContentCopy />
    </StyledCopy>
  );
}

export default Copy;

const StyledCopy = styled("button")({});
