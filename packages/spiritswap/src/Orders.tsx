import React from "react";
import TWAPLib from "@orbs-network/twap-ui";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { colors } from "./styles";
import { ProviderWrapper, queryClient } from ".";
import text from "./text.json";

const { Orders } = TWAPLib;

function OrderHistory(props: { provider: any; connect: () => void; TokenSelectModal: any; tokensList: any[] }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWrapper {...props}>
        <StyledContainer>
          <Orders
            text={{
              tradeSizeTooltipText: text.tradeSize,
              tradeIntervalTooltipText: text.tradeInterval,
              deadlineTooltipText: text.maxDuration,
            }}
          />
        </StyledContainer>
      </ProviderWrapper>
    </QueryClientProvider>
  );
}

export default OrderHistory;

const StyledContainer = styled(Box)({
  "& *": {
    fontFamily: "inherit",
  },
  "& .twap-orders-lists": {
    maxHeight: 600,
  },
  "& .twap-order": {
    border: "1px solid rgb(55, 65, 81)",
  },
  "& .twap-order-main-progress-bar": {
    background: "#22353C",
    "& .MuiLinearProgress-bar ": {
      background: colors.light,
    },
  },
  "& .twap-orders-header": {
    "& .MuiTabs-root": {
      "& .MuiTabs-indicator": {
        backgroundColor: "rgba(96, 230, 197, 0.26)",
      },
      "& .MuiButtonBase-root": {
        color: "#FFFFFF",
        fontWeight: 400,
        fontSize: 14,
      },
      "& .Mui-selected": {
        color: "#60E6C5",
      },
    },
  },
});
