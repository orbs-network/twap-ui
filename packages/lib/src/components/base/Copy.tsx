import { styled } from "styled-components";
import { Md3DRotation } from "@react-icons/all-files/md/Md3DRotation";

import { copy } from "../../utils";
function Copy({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <StyledCopy onClick={() => copy(value)}>
      <Md3DRotation />
    </StyledCopy>
  );
}

export default Copy;

const StyledCopy = styled("button")({});
