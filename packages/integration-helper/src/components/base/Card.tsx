import { styled } from "styled-components";
import { CSSProperties, ReactNode } from "react";

const Card = ({ children, className = "", style = {}, onClick = () => {} }: { children: ReactNode; className?: string; style?: CSSProperties; onClick?: () => void }) => {
  return (
    <StyledContainer onClick={onClick} style={style} className={`twap-card ${className}`}>
      {children}
    </StyledContainer>
  );
};

export default Card;

const StyledContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  width: "100%",
});
