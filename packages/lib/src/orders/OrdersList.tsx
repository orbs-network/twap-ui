import { Box, styled } from "@mui/material";
import { useMemo, useState } from "react";
import { OrderLoader, ListOrder } from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { useTwapContext } from "../context";
import _ from "lodash";
import { useOrdersHistoryQuery, usePagination } from "../hooks";
import { StyledColumnFlex } from "../styles";
import { Pagination } from "../components/base";
import { useTwapStore } from "../store";
import { Order } from "../order";
import { Status } from "@orbs-network/twap";

function OrdersList({ orders, status, isLoading, onCancelSuccess }: { orders?: Order[]; status?: Status; isLoading: boolean; onCancelSuccess?: (orderId: number) => void }) {
  const { uiPreferences } = useTwapContext();

  const showPagination = uiPreferences.orders?.paginationChunks && _.size(orders) > uiPreferences.orders?.paginationChunks;

  if (isLoading) {
    return (
      <StyledLoader>
        <CircularProgress className="twap-spinner" />
      </StyledLoader>
    );
  }
  if (showPagination) {
    return <PaginationList onCancelSuccess={onCancelSuccess} orders={orders} status={status} />;
  }
  return <List onCancelSuccess={onCancelSuccess} orders={orders} status={status} />;
}

const PaginationList = ({ orders, status, onCancelSuccess }: { orders?: Order[]; status?: Status; onCancelSuccess?: (orderId: number) => void }) => {
  const paginationChunks = useTwapContext().uiPreferences.orders?.paginationChunks;

  const { list, nextPage, hasNextPage, prevPage, hasPrevPage, text } = usePagination(orders, paginationChunks);

  return (
    <StyledColumnFlex>
      <List onCancelSuccess={onCancelSuccess} orders={list} status={status} />
      <Pagination text={text} hasPrevPage={hasPrevPage} onNext={nextPage} onPrev={prevPage} hasNextPage={hasNextPage} />
    </StyledColumnFlex>
  );
};

const List = ({ orders, status, onCancelSuccess }: { orders?: Order[]; status?: Status; onCancelSuccess?: (orderId: number) => void }) => {
  const { translations } = useTwapContext();
  const waitingForOrderId = useTwapStore((state) => state.waitingForOrderId);
  const { data } = useOrdersHistoryQuery();
  const waitForOrderLoader = useMemo(() => {
    if (!waitingForOrderId || !data?.length) return false;
    return waitingForOrderId && !data?.find((it) => it.id === waitingForOrderId);
  }, [data, waitingForOrderId]);

  if (!_.size(orders)) {
    return waitForOrderLoader ? (
      <OrderLoader />
    ) : (
      <StyledContainer className="twap-orders-list">
        <StyledEmptyList className="twap-orders-empty-list">
          {!status ? "You currently don't have orders" : `${translations.noOrdersFound} ${(translations as any)["noOrdersFound_" + status]} ${translations.noOrdersFound1}`}
        </StyledEmptyList>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer className="twap-orders-list">
      {waitForOrderLoader && <OrderLoader />}
      {orders?.map((order, index) => {
        return <ListOrder onCancelSuccess={onCancelSuccess} order={order} key={index} />;
      })}
    </StyledContainer>
  );
};

export default OrdersList;

const StyledEmptyList = styled(Box)({
  textAlign: "center",
  paddingTop: 40,
  marginBottom: 40,
});

const StyledContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const StyledLoader = styled(StyledContainer)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 110,
  "& .twap-spinner": {
    color: "white",
  },
});
