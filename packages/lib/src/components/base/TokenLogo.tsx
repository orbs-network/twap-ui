import { CSSProperties, useEffect, useState } from "react";
import { styled } from "@mui/material";
import { AiFillQuestionCircle } from "@react-icons/all-files/ai/AiFillQuestionCircle";
import { useTwapContext } from "../../context";
import { TokenData } from "@orbs-network/twap";

function TokenLogo({
  logo,
  size,
  className = "",
  style = {},
  alt = "Token logo",
  token,
}: {
  logo?: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  token?: TokenData;
  size?: string;
}) {
  const [error, setError] = useState(false);
  const CurrencyLogo = useTwapContext().CurrencyLogo;

  useEffect(() => {
    setError(false);
  }, [logo]);

  if (token && CurrencyLogo) {
    return <CurrencyLogo size={size} address={token.address} />;
  }

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
