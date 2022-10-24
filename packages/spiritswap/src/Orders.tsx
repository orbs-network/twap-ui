import React from "react";
import TWAPLib from "@orbs-network/twap-ui";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";

const { Orders } = TWAPLib;
const { OrdersProvider } = TWAPLib;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

function OrderHistory({ tokensList, provider }: { tokensList: any[]; provider: any }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersProvider tokensList={tokensList} provider={provider}>
        <Orders />
      </OrdersProvider>
    </QueryClientProvider>
  );
}

export default OrderHistory;

const StyledContainer = styled(Box)({});
