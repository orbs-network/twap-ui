import { StyledText } from "../../styles";

function TokenName({ name, hideNull, onClick }: { name?: string; hideNull?: boolean; onClick?: () => void }) {
  if (!name && hideNull) return null;

  return (
    <StyledText onClick={onClick} className="twap-token-name">
      {name || "-"}
    </StyledText>
  );
}

export default TokenName;
