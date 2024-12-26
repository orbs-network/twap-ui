import { styled } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { useMemo } from "react";
import { StyledRowFlex, StyledText } from "../../styles";
import { OrderUI } from "../../types";
import { CheckIcon } from "./icons";

export const OrderStatus = ({ order }: { order: OrderUI }) => {
  const icon = useMemo(() => {
    if (order?.ui.status === Status.Completed) {
      return <CheckIcon />;
    }
  }, [order?.ui.status]);

  return (
    <StyledStatus>
      <StyledRowFlex style={{ width: "auto" }}>
        <StyledText>{order?.ui.status}</StyledText>
        {icon}
      </StyledRowFlex>
    </StyledStatus>
  );
};

const StyledStatus = styled(StyledRowFlex)({
  gap: 8,
  width: "auto",
  svg: {
    width: 22,
    height: 22,
  },
  p: {
    fontSize: 14,
    fontWeight: 600,
  },
});
