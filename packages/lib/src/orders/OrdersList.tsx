import { Box, styled } from "@mui/material";
import { useState } from "react";
import { OrderLoader, ListOrder } from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { useTwapContext } from "../context";
import _ from "lodash";
import { usePagination } from "../hooks";
import { StyledColumnFlex } from "../styles";
import { Pagination } from "../components/base";
import { useTwapStore } from "../store";
import { Order } from "../order";

function OrdersList({ orders, status, isLoading }: { orders?: Order[]; status?: string; isLoading: boolean }) {
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
    return <PaginationList orders={orders} status={status} />;
  }
  return <List orders={orders} status={status} />;
}

const PaginationList = ({ orders, status }: { orders?: Order[]; status?: string }) => {
  const paginationChunks = useTwapContext().uiPreferences.orders?.paginationChunks;

  const { list, nextPage, hasNextPage, prevPage, hasPrevPage, text } = usePagination(orders, paginationChunks);

  return (
    <StyledColumnFlex>
      <List orders={list} status={status} />
      <Pagination text={text} hasPrevPage={hasPrevPage} onNext={nextPage} onPrev={prevPage} hasNextPage={hasNextPage} />
    </StyledColumnFlex>
  );
};

const List = ({ orders, status }: { orders?: Order[]; status?: string }) => {
  const { translations } = useTwapContext();
  const waitingForOrdersUpdate = useTwapStore((s) => s.waitingForOrdersUpdate);

  if (!_.size(orders)) {
    return waitingForOrdersUpdate ? (
      <OrderLoader status={status} />
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
      {waitingForOrdersUpdate && <OrderLoader status={status} />}
      {orders?.map((order, index) => {
        return <ListOrder order={order} key={index} />;
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
