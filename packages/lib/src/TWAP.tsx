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
import { useWeb3Provider } from "./store/store";
import CustomButton from "./base-components/CustomButton";
import SwapButton from "./components/SwapButton";
import PriceInput from "./components/PriceInput";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: 0,
    }, // TODO how do we log each state change?
  },
});

export const TWAP = ({ provider }: { provider: any }) => {
  
  useWeb3Provider(provider || (window as any).ethereum);

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <StyledContainer>
        <StyledColumnGap gap={11}>
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

const StyledContainer = styled(StyledColumnGap)({
  background: "#FFFFFF",
  boxShadow: "0px 10px 100px rgba(85, 94, 104, 0.1)",
  borderRadius: 30,
  minHeight: 200,
  padding: 22,
  gap: 20,
});
