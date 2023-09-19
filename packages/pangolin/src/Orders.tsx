import { Box, styled, Typography } from "@mui/material";
import { Status } from "@orbs-network/twap";
import { hooks, OrderUI, Styles } from "@orbs-network/twap-ui";
import React from "react";

export function PangolinOrders() {
  //   const { data } = hooks.useOrdersHistoryQuery();

  //   console.log({ data });

  return (
    <StyledOrders>
      <List />
    </StyledOrders>
  );
}

const StyledOrders = styled(Box)({
  background: "#111111",
  padding: 20,
  width: "100%",
  color: "white",
});

const List = () => {
  const { data } = hooks.useOrdersHistoryQuery();

  const list = data?.Completed;

  return (
    <StyledList>
      {list?.map((o) => {
        return <ListItem key={o.order.id} order={o} />;
      })}
    </StyledList>
  );
};

const ListItem = ({ order }: { order: OrderUI }) => {
  return (
    <StyledListItem>
      <Typography>
        By {order.ui.dstToken.symbol} with {order.ui.srcToken.symbol}
      </Typography>
      <StyledListItemStatus>{getStatusName(order.ui.status)}</StyledListItemStatus>
    </StyledListItem>
  );
};

const getStatusName = (status: Status) => {
  switch (status) {
    case Status.Completed:
      return "Excecuted";

    default:
      return status;
  }
};

const StyledListItemStatus = styled(Typography)({
  color: "#FFC800",
});

const StyledListItem = styled(Styles.StyledRowFlex)({
  height: 64,
  borderBottom: "1px solid #282828",
  p: {
    fontSize: 12,
    fontWeight: 500,
  },
});

const StyledList = styled(Styles.StyledColumnFlex)({});
