import { Box, styled } from "@mui/system";
import React from "react";
import { useToken } from "../store/store";

function TokenName({ address }: { address?: string }) {
  const { token } = useToken(address);

  return <StyledName className="twap-token-name">{token?.name || "-"}</StyledName>;
}

export default TokenName;

const StyledName = styled(Box)({});
