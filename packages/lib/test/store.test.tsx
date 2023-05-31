import { QueryClientProvider } from "@tanstack/react-query";
import { initFixture, maker, tokens } from "./fixture";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Configs, Order, TWAPLib } from "@orbs-network/twap";
import { web3, zero, zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, TimeResolution, useTwapStore } from "../src/store";
import { expect } from "chai";
import BN from "bignumber.js";
import { QueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { useOrdersHistoryQuery, usePrepareUSDValues } from "../src/hooks";
import { OrdersContext } from "../src/context";
import { OrderLibProps, OrderUI } from "../src/types";

const createQueryProvider = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const createQueryProviderWithOrdersContext = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <OrdersContext.Provider value={{ tokenList: tokens } as OrderLibProps}>{children}</OrdersContext.Provider>
    </QueryClientProvider>
  );
};

describe("store", () => {
  beforeEach(() => initFixture());

  let lib: TWAPLib;

  describe("Using TWAPLib with SpiritSwap config", () => {
    let { result: store } = renderHook(() => useTwapStore());

    beforeEach(async () => {
      const { result } = renderHook(() => useTwapStore());
      store = result;
      lib = new TWAPLib(Configs.SpiritSwap, maker, web3());
      await act(async () => store.current.setLib(lib));
      expect(store.current.lib).eq(lib);
    });

    afterEach(async () => {
      await act(async () => store.current.reset({}));
    });

    it("initial and observable state", async () => {
      expect(store.current.srcUsd).bignumber.eq(store.current.dstUsd).eq(0);
      expect(store.current.loading).false;
      await act(async () => store.current.setLoading(true));
      expect(store.current.loading).true;
    });
    it("setDstToken resets derivatives", async () => {
      expect(store.current.limitPriceUi.priceUi).eq("");

      await act(async () => store.current.setLimitPriceUi({ priceUi: "1.234", inverted: false }));
      expect(store.current.limitPriceUi.priceUi).eq("1.234");

      await act(async () => store.current.setDstToken(tokens[1]));
      expect(store.current.limitPriceUi.priceUi).eq("");
    });

    it("setDuration minimum of config bid delay x 2, affects customFillDelay", async () => {
      expect(store.current.getDurationUi()).deep.eq({ resolution: TimeResolution.Minutes, amount: 4 });
      expect(store.current.customFillDelay).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });
      expect(store.current.getIsPartialFillWarning()).eq(false);

      await act(async () => store.current.setDuration({ resolution: TimeResolution.Minutes, amount: 1 }));
      expect(store.current.customFillDelay).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });
      expect(store.current.getIsPartialFillWarning()).eq(true);

      await act(async () => store.current.setDuration({ resolution: TimeResolution.Minutes, amount: 5 }));
      expect(store.current.customFillDelay).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });
      expect(store.current.getIsPartialFillWarning()).eq(false);
    });

    it("isSameNativeBasedToken", async () => {
      expect(store.current.isSameNativeBasedToken()).false;
      await act(async () => store.current.setSrcToken(tokens[0]));
      await act(async () => store.current.setDstToken(tokens[1]));
      expect(store.current.isSameNativeBasedToken()).false;
      await act(async () => store.current.setSrcToken({ address: zeroAddress, decimals: 1, symbol: "" }));
      await act(async () => store.current.setDstToken(lib.config.wToken));
      expect(store.current.isSameNativeBasedToken()).true;
    });

    it("max possible chunks", async () => {
      expect(store.current.getMaxPossibleChunks()).eq(1);
      await act(async () => store.current.setSrcToken(tokens[0]));
      await act(async () => store.current.setSrcAmountUi("1234.5678"));
      await act(async () => (store.current.srcUsd = BN(1.23)));
      expect(store.current.getMaxPossibleChunks())
        .eq(151)
        .eq(Math.floor((1234.5678 * 1.23) / 10));

      await act(async () => store.current.setChunks(100));
      expect(store.current.getChunks()).eq(100);
      await act(async () => store.current.setChunks(200));
      expect(store.current.getChunks()).eq(151);
    });

    it("getChunks with suggested chunks for 100 usd", async () => {
      expect(store.current.getChunks()).eq(1);
      await act(async () => store.current.setSrcToken(tokens[0]));
      await act(async () => (store.current.srcUsd = BN(1)));
      await act(async () => store.current.setSrcAmountUi("1"));
      expect(store.current.getMaxPossibleChunks()).eq(1);
      expect(store.current.getChunks()).eq(1);
      await act(async () => store.current.setSrcAmountUi("10"));
      expect(store.current.getMaxPossibleChunks()).eq(1);
      expect(store.current.getChunks()).eq(1);
      await act(async () => store.current.setSrcAmountUi("50"));
      expect(store.current.getMaxPossibleChunks()).eq(5);
      expect(store.current.getChunks()).eq(1);
      await act(async () => store.current.setSrcAmountUi("100"));
      expect(store.current.getMaxPossibleChunks()).eq(10);
      expect(store.current.getChunks()).eq(1);
      await act(async () => store.current.setSrcAmountUi("500"));
      expect(store.current.getMaxPossibleChunks()).eq(50);
      expect(store.current.getChunks()).eq(5);
      await act(async () => store.current.setSrcAmountUi("5000"));
      expect(store.current.getMaxPossibleChunks()).eq(500);
      expect(store.current.getChunks()).eq(50);
    });
  });

  describe("Orders History", () => {
    let { result: store } = renderHook(() => useTwapStore());
    let mockOrder: Order;

    beforeEach(async () => {
      const { result } = renderHook(() => useTwapStore());
      store = result;
      lib = new TWAPLib(Configs.SpiritSwap, maker, web3());
      await act(async () => store.current.setLib(lib));
      expect(store.current.lib).eq(lib);

      mockOrder = {
        id: 123,
        status: (Date.now() + 1e6) / 1000,
        filledTime: 0,
        srcFilledAmount: BN(900 * 10 ** tokens[0].decimals),
        maker: lib.maker,
        time: Date.now() / 1000,
        ask: {
          deadline: (Date.now() + 1e6) / 1000,
          srcToken: tokens[0].address,
          dstToken: tokens[1].address,
          srcAmount: BN(1000 * 10 ** tokens[0].decimals),
          srcBidAmount: BN(100 * 10 ** tokens[0].decimals),
          dstMinAmount: BN(1),
          bidDelay: 60,
          fillDelay: 0,

          exchange: zeroAddress,
        },
        bid: {
          time: 0,
          taker: zeroAddress,
          exchange: zeroAddress,
          dstAmount: zero,
          dstFee: zero,
          data: "",
        },
      };
    });

    afterEach(async () => {
      await act(async () => store.current.reset({}));
    });

    it("prepare orders tokens", async () => {
      const prepareOrdersTokensWithUsd = renderHook(() => usePrepareUSDValues(async (t) => (t === tokens[0] ? BN(123.5) : BN(456.7))), {
        wrapper: createQueryProvider(),
      });

      const result = await prepareOrdersTokensWithUsd.result.current(tokens);
      expect(result).length(tokens.length);
      expect(result[0].address).eq(tokens[0].address);
      expect(result[0].usd).bignumber.eq(123.5);
      expect(result[1].address).eq(tokens[1].address);
      expect(result[1].usd).bignumber.eq(456.7);
    });

    it("parseOrderUi", async () => {
      const prepareOrdersTokensWithUsd = renderHook(() => usePrepareUSDValues(async (t) => (t === tokens[0] ? BN(123.456) : BN(456.789))), {
        wrapper: createQueryProvider(),
      });

      const parsed = parseOrderUi(lib, await prepareOrdersTokensWithUsd.result.current(tokens), mockOrder);
      expect(parsed.order).deep.eq(mockOrder);
      expect(parsed.ui.srcUsdUi).eq("123.456");
      expect(parsed.ui.dstUsdUi).eq("456.789");
      expect(parsed.ui.isMarketOrder).true;
      expect(parsed.ui.dstPriceFor1Src).bignumber.closeTo(0.2702, 0.0001);
      expect(parsed.ui.dstAmountUi).matches(/^270.2/);
      expect(parsed.ui.prefix).eq("~");
    });

    it("ordersSorting", async () => {
      lib.getAllOrders = async (): Promise<Order[]> => [
        {
          ...mockOrder,
          id: 1,
          time: 0,
        },
        {
          ...mockOrder,
          id: 2,
          time: 10,
        },
      ];

      const { result } = renderHook(() => useOrdersHistoryQuery(async (t) => (t === tokens[0] ? BN(123.5) : BN(456.7))), { wrapper: createQueryProviderWithOrdersContext() });

      await waitFor(() => expect(result.current.status).eq("success"));

      expect(result.current.data?.Open)?.length(2);
      expect(result.current.orders.Open?.[0].order.id).eq(2);
      expect(result.current.orders.Open?.[1].order.id).eq(1);
    });
  });
});
