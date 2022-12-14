import { initFixture, maker, tokens } from "./fixture";
import { act, renderHook } from "@testing-library/react";
import { Configs, TWAPLib } from "@orbs-network/twap";
import { web3, zero, zeroAddress } from "@defi.org/web3-candies";
import { parseOrderUi, prepareOrdersTokensWithUsd, TimeResolution, useTwapStore } from "../src/store";
import { expect } from "chai";
import BN from "bignumber.js";
import _ from "lodash";

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
      await act(async () => store.current.reset());
    });

    it("initial and observable state", async () => {
      expect(store.current.srcUsd).bignumber.eq(store.current.dstUsd).eq(0);
      expect(store.current.loading).false;
      await act(async () => store.current.setLoading(true));
      expect(store.current.loading).true;
    });

    it("setSrcToken resets derivatives", async () => {
      await act(async () => store.current.setSrcAmountUi("2.345"));
      await act(async () => store.current.setChunks(10));
      await act(async () => store.current.setLimitPriceUi({ priceUi: "1.234", inverted: false }));

      await act(async () => store.current.setSrcToken(tokens[0]));

      expect(store.current.limitPriceUi.priceUi).eq("");
      expect(store.current.chunks).eq(1);
      expect(store.current.srcAmountUi).eq("");
    });

    it("setDstToken resets derivatives", async () => {
      expect(store.current.limitPriceUi.priceUi).eq("");

      await act(async () => store.current.setLimitPriceUi({ priceUi: "1.234", inverted: false }));
      expect(store.current.limitPriceUi.priceUi).eq("1.234");

      await act(async () => store.current.setDstToken(tokens[1]));
      expect(store.current.limitPriceUi.priceUi).eq("");
    });

    it("setSrcAmountUi resets derivatives", async () => {
      await act(async () => store.current.setSrcToken(tokens[0]));
      await act(async () => store.current.setSrcAmountUi("1234.5678"));
      await act(async () => (store.current.srcUsd = BN(1.23)));
      await act(async () => store.current.setChunks(10));
      expect(store.current.chunks).eq(10);
      await act(async () => store.current.setSrcAmountUi("2.345"));
      expect(store.current.chunks).eq(1);
    });

    it("setDuration minimum of config bid delay x 2, affects fillDelay", async () => {
      expect(store.current.duration).deep.eq({ resolution: TimeResolution.Minutes, amount: 10 });
      expect(store.current.getFillDelay()).deep.eq({ resolution: TimeResolution.Minutes, amount: 0 });

      await act(async () => store.current.setDuration({ resolution: TimeResolution.Minutes, amount: 1 }));
      expect(store.current.duration).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });
      await act(async () => store.current.setDuration({ resolution: TimeResolution.Minutes, amount: 0.5 }));
      expect(store.current.duration).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });
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
      expect(store.current.chunks).eq(100);
      await act(async () => store.current.setChunks(200));
      expect(store.current.chunks).eq(151);
    });
  });

  describe("Orders History", () => {
    let { result: store } = renderHook(() => useTwapStore());
    let mockOrder: any;

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
        ask: {
          time: Date.now() / 1000,
          deadline: (Date.now() + 1e6) / 1000,
          srcToken: tokens[0].address,
          dstToken: tokens[1].address,
          srcAmount: BN(1000 * 10 ** tokens[0].decimals),
          srcBidAmount: BN(100 * 10 ** tokens[0].decimals),
          dstMinAmount: BN(1),
          bidDelay: 60,
          fillDelay: 0,
          maker: lib.maker,
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
      await act(async () => store.current.reset());
    });

    it("prepare orders tokens", async () => {
      const result = await prepareOrdersTokensWithUsd(tokens, [mockOrder, mockOrder, mockOrder], async (t) => (t === tokens[0] ? BN(123.5) : BN(456.7)));
      expect(_.keys(result)).length(2);
      expect(result[tokens[0].address].usd).bignumber.eq(123.5);
      expect(result[tokens[1].address].usd).bignumber.eq(456.7);
    });

    it("parseOrderUi", async () => {
      const parsed = await parseOrderUi(
        lib,
        await prepareOrdersTokensWithUsd(tokens, [mockOrder, mockOrder, mockOrder], async (t) => (t === tokens[0] ? BN(123.456) : BN(456.789))),
        mockOrder
      );
      expect(parsed.order).deep.eq(mockOrder);
      expect(parsed.ui.srcUsdUi).eq("123.456");
      expect(parsed.ui.dstUsdUi).eq("456.789");
      expect(parsed.ui.isMarketOrder).true;
      expect(parsed.ui.dstPriceFor1Src).bignumber.closeTo(0.2702, 0.0001);
      expect(parsed.ui.dstAmountUi).matches(/^270.2/);
      expect(parsed.ui.prefix).eq("~");
    });
  });
});
