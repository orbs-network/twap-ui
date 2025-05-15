function TokenName({ name, hideNull, onClick }: { name?: string; hideNull?: boolean; onClick?: () => void }) {
  if (!name && hideNull) return null;

  return (
    <p onClick={onClick} className="twap-token-name">
      {name || "-"}
    </p>
  );
}

export default TokenName;
