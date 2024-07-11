import { Box, styled } from "@mui/material";
import { useState } from "react";
import Order, { OrderLoader } from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { useTwapContext } from "../context/context";
import _ from "lodash";
import { usePagination } from "../hooks";
import { StyledColumnFlex } from "../styles";
import { Pagination } from "../components/base";
import { HistoryOrder } from "../types";

function OrdersList({ orders, status, isLoading }: { orders?: HistoryOrder[]; status?: string; isLoading: boolean }) {
  const { uiPreferences } = useTwapContext();
  const paginationChunks = uiPreferences.orders?.paginationChunks || 5;
  const showPagination = _.size(orders) > paginationChunks;

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

const PaginationList = ({ orders, status }: { orders?: HistoryOrder[]; status?: string }) => {
  const paginationChunks = useTwapContext().uiPreferences.orders?.paginationChunks;

  const { list, nextPage, hasNextPage, prevPage, hasPrevPage, text } = usePagination(orders, paginationChunks);

  return (
    <StyledColumnFlex>
      <List orders={list} status={status} />
      <Pagination text={text} hasPrevPage={hasPrevPage} onNext={nextPage} onPrev={prevPage} hasNextPage={hasNextPage} />
    </StyledColumnFlex>
  );
};

const List = ({ orders, status }: { orders?: HistoryOrder[]; status?: string }) => {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const { translations, state } = useTwapContext();

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };

  if (!_.size(orders)) {
    return (
      <StyledContainer className="twap-orders-list">
        <StyledEmptyList className="twap-orders-empty-list">
          {!status ? "You currently don't have orders" : `${translations.noOrdersFound} ${(translations as any)["noOrdersFound_" + status]} ${translations.noOrdersFound1}`}
        </StyledEmptyList>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer className="twap-orders-list">
      {orders?.map((order, index) => {
        return <Order order={order} key={index} expanded={order.id === selected} onExpand={() => onSelect(order.id)} />;
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
  gap: 20,
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
