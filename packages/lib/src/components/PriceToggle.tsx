import { IconButton } from "@mui/material";
import React from "react";
import { TbArrowsRightLeft } from "react-icons/tb";

function PriceToggle({ onClick }: { onClick: () => void }) {
  return (
    <IconButton onClick={onClick}>
      <TbArrowsRightLeft style={{ width: 20, height: 20 }} className="twap-price-toggle" />
    </IconButton>
  );
}

export default PriceToggle;
