import { StyledText } from "../../styles";

function TokenName({ name }: { name?: string }) {
  return <StyledText className="twap-token-name">{name || "-"}</StyledText>;
}

export default TokenName;
