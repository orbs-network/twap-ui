import { Box, styled, Typography, Button } from "@mui/material";
import { useState } from "react";
import Order, { OrderLoader } from "./Order/Order";
import CircularProgress from "@mui/material/CircularProgress";
import { useTwapContext } from "../context";
import { ParsedOrder } from "../types";
import _ from "lodash";
import { usePagination } from "../hooks";
import { StyledColumnFlex } from "../styles";
import { Pagination } from "../components/base";
import { useTwapStore } from "../store";
import Bear from "./assets/components/Bear";
import ArrowOutward from "./assets/components/ArrowOutward";
import { Dex } from "../consts";

function OrdersList({ orders, status, isLoading, dex }: { orders?: ParsedOrder[]; status?: string; isLoading: boolean, dex?: Dex }) {
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

  switch (dex) {
    case Dex.TradingPost:
      return <List orders={orders} status={status}  useCustomComponent={true} CustomComponent={TradingPostListComponent}/>;
    default:
      return <List orders={orders} status={status} />;
  }
}

const PaginationList = ({ orders, status }: { orders?: ParsedOrder[]; status?: string }) => {
  const paginationChunks = useTwapContext().uiPreferences.orders?.paginationChunks;

  const { list, nextPage, hasNextPage, prevPage, hasPrevPage, text } = usePagination(orders, paginationChunks);

  return (
    <StyledColumnFlex>
      <List orders={list} status={status} />
      <Pagination text={text} hasPrevPage={hasPrevPage} onNext={nextPage} onPrev={prevPage} hasNextPage={hasNextPage} />
    </StyledColumnFlex>
  );
};

const List = ({ orders, status, useCustomComponent, CustomComponent }: { orders?: ParsedOrder[]; status?: string; useCustomComponent?: boolean; CustomComponent?: (props: { status?: string }) => React.ReactElement; }) => {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const { translations } = useTwapContext();
  const waitingForOrdersUpdate = useTwapStore((s) => s.waitingForOrdersUpdate);

  const onSelect = (value: number) => {
    setSelected((prevState) => (prevState === value ? undefined : value));
  };

  if (!_.size(orders)) {
    return waitingForOrdersUpdate ? (
      <OrderLoader status={status} />
    ) : useCustomComponent ? (
       <StyledContainer className="twap-orders-list">
        <StyledEmptyList className="twap-orders-empty-list">
        {CustomComponent && <CustomComponent status={status} />}
        </StyledEmptyList>
      </StyledContainer>
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
        return <Order order={order} key={index} expanded={order.order.id === selected} onExpand={() => onSelect(order.order.id)} />;
      })}
    </StyledContainer>
  );
};

const TradingPostListComponent = ({status}: {status?: string}) => {
  const { translations } = useTwapContext();
  return (
    <>
    <Bear />
    <StyledEmtpyListTitle>No Open Orders</StyledEmtpyListTitle>
    {!status ? "You currently don't have orders" : `${translations.noOrdersFound_Swap} ${(translations as any)["noOrdersFound_" + status]} ${translations.noOrdersFound1}`}
    <StyledEmptyListButton>
      Learn More
      <ArrowOutward />
    </StyledEmptyListButton>
    </>
  );
}

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

const StyledEmtpyListTitle = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
  fontFamily: "Slackey",
});

const StyledEmptyListButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginTop: 20,
  width: 200,
  height: 40,
  borderRadius: 16,
  backgroundColor: "transparent",
  color: theme.palette.mode === "dark" ? "#FBF4EF" : "#453936",
  border: `1px solid ${theme.palette.mode === "dark" ? "#353531" : "#D5BAA5"}`,
  fontFamily: "Slackey",
}));
