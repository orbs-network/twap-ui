import React, { ReactNode } from "react";
import { styled } from "styled-components";

function Layout({ children }: { children: ReactNode }) {
  return <StyledContainer>{children}</StyledContainer>;
}

export default Layout;

const StyledContainer = styled("div")({
  background: "#FFFFFF",
  boxShadow: "0px 10px 100px rgba(85, 94, 104, 0.1)",
  borderRadius: 30,
  minHeight: 200,
  padding: 22,
  gap: 20,
  minWidth: 400,
});
