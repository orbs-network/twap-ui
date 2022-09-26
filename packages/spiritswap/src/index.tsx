import { CssBaseline } from "@mui/material";
import { Box, styled } from "@mui/system";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { StyledColumnGap } from "./styles";
import DstToken from "./components/DstToken";
import SrcToken from "./components/SrcToken";
import TradeSize from "./components/TradeSize";
import MaxDuration from "./components/MaxDuration";
import TradeInterval from "./components/TradeInterval";
import SwitchTokens from "./components/SwitchTokens";
import SwapButton from "./components/SwapButton";
import PriceInput from "./components/PriceInput";
import TWAPLib from "@orbs-network/twap-ui";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

const TWAP = ({ provider }: { provider: any }) => {
  TWAPLib.actions.useWeb3Provider(provider);

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <StyledContainer>
        <StyledColumnGap gap={12}>
          <SrcToken />
          <SwitchTokens />
          <DstToken />
        </StyledColumnGap>
        <StyledColumnGap gap={20}>
          <PriceInput />
          <TradeSize />
          <MaxDuration />
          <TradeInterval />
          <SwapButton />
        </StyledColumnGap>
      </StyledContainer>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
};

export default TWAP;

const StyledContainer = styled(StyledColumnGap)({
  background: "#FFFFFF",
  boxShadow: "0px 10px 100px rgba(85, 94, 104, 0.1)",
  borderRadius: 30,
  minHeight: 200,
  padding: 22,
  gap: 20,
  minWidth: 400,
});
