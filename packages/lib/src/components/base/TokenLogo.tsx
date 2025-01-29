import { CSSProperties, useEffect, useState } from "react";
import { styled } from "styled-components";
import { AiFillQuestionCircle } from "@react-icons/all-files/ai/AiFillQuestionCircle";
import React from "react";
function TokenLogo({ logo, className = "", style = {}, alt = "Token logo" }: { logo?: string; className?: string; style?: CSSProperties; alt?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [logo]);

  return logo && !error ? (
    <StyledImg alt={alt} style={style} onError={() => setError(true)} className={`twap-token-logo ${className}`} src={logo} />
  ) : (
    <AiFillQuestionCircle style={{ width: 20, height: 20 }} className="twap-token-svg" />
  );
}

export default TokenLogo;

const StyledImg = styled("img")({
  borderRadius: "50%",
  overflow: "hidden",
});
