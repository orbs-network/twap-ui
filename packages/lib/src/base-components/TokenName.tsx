import { Box, styled } from "@mui/system";

function TokenName({ name }: { name?: string }) {
  return <StyledName className="twap-token-name">{name || "-"}</StyledName>;
}

export default TokenName;

const StyledName = styled(Box)({});
