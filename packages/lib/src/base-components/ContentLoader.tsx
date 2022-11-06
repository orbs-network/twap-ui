import { styled } from "@mui/system";
import React, { ReactNode } from "react";
import Loader from "./Loader";

function ContentLoader({ children, loading }: { children: ReactNode; loading: boolean }) {
  return <>{loading ? <StyledLoader /> : children}</>;
}

export default ContentLoader;

const StyledLoader = styled(Loader)({
  position: "absolute",
  width: "100%",
  left: 0,
  top: "50%",
  transform: "translate(0, -50%)",
});
