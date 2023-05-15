import { StyledText } from "../../styles";

function TokenName({ name, hideNull }: { name?: string; hideNull?: boolean }) {
  if (!name && hideNull) return null;

  return <StyledText className="twap-token-name">{name || "-"}</StyledText>;
}

export default TokenName;
