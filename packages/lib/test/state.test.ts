import "react";
import BN from "bignumber.js";
import { initFixture, maker, tokens, withMockUsdPrice } from "./fixture";
import {
  allTokensListAtom,
  balanceGet,
  customFillDelayEnabledAtom,
  deadlineGet,
  deadlineUiGet,
  dstAmountGet,
  dstAmountUiGet,
  dstBalanceUiGet,
  dstMinAmountOutGet,
  dstMinAmountOutUiGet,
  dstTokenAtom,
  dstUsdUiGet,
  fillDelayAtom,
  gasPriceGet,
  isLimitOrderAtom,
  limitPriceGet,
  limitPriceUiAtom,
  marketPriceGet,
  maxDurationAtom,
  maxPossibleChunksGet,
  orderHistoryGet,
  resetAllSet,
  shouldWrapNativeGet,
  srcAmountGet,
  srcAmountPercentSet,
  srcAmountUiAtom,
  srcBalanceUiGet,
  srcChunkAmountGet,
  srcChunkAmountUiGet,
  srcTokenAtom,
  srcUsdUiGet,
  switchTokensSet,
  TimeResolution,
  tokenAllowanceGet,
  totalChunksAtom,
  twapLibAtom,
  usdGet,
} from "../src/state";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { act, renderHook, waitFor } from "@testing-library/react";
import { web3, zero, zeroAddress } from "@defi.org/web3-candies";
import { expect } from "chai";
import { Order, Configs, Status, TokenData, TWAPLib } from "@orbs-network/twap";

describe("State", function () {
  beforeEach(() => initFixture());

  describe("Using SpiritSwap", () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useSetAtom(twapLibAtom));
      await act(async () => result.current(new TWAPLib(Configs.SpiritSwap, maker, web3())));
    });

    afterEach(async () => {
      const { result } = renderHook(() => useSetAtom(resetAllSet));
      await act(async () => result.current());
    });

    it("stores observables", async () => {
      const { result, rerender } = renderHook(() => useAtomValue(srcTokenAtom));
      expect(result.current).to.be.undefined;

      const setter = renderHook(() => useSetAtom(srcTokenAtom)).result.current;
      await act(async () => setter(tokens[0]));

      expect(result.current).deep.eq(tokens[0]);
      rerender();
      expect(result.current).deep.eq(tokens[0]);
    });

    it("src and dst tokens", async () => {
      const { result: srcToken } = renderHook(() => useAtomValue(srcTokenAtom));
      const { result: dstToken } = renderHook(() => useAtomValue(dstTokenAtom));
      const { result: srcTokenSet } = renderHook(() => useSetAtom(srcTokenAtom));
      const { result: dstTokenSet } = renderHook(() => useSetAtom(dstTokenAtom));
      expect(srcToken.current).to.be.undefined;
      expect(dstToken.current).to.be.undefined;

      await act(async () => srcTokenSet.current(tokens[1]));
      expect(srcToken.current).deep.eq(tokens[1]);

      expect(dstToken.current).to.be.undefined;
      await act(async () => dstTokenSet.current(tokens[2]));
      expect(dstToken.current).deep.eq(tokens[2]);
    });

    describe("with tokens", () => {
      beforeEach(async () => {
        const { result: srcTokenSet } = renderHook(() => useSetAtom(srcTokenAtom));
        const { result: dstTokenSet } = renderHook(() => useSetAtom(dstTokenAtom));
        await act(async () => srcTokenSet.current(tokens[0]));
        await act(async () => dstTokenSet.current(tokens[1]));
        expect(tokens[0].decimals).eq(18);
        expect(tokens[1].decimals).eq(8);
        const { result: srcUsd } = renderHook(() => useAtomValue(usdGet(tokens[0])).value);
        const { result: dstUsd } = renderHook(() => useAtomValue(usdGet(tokens[1])).value);
        await withMockUsdPrice(tokens[0], 0.23);
        await withMockUsdPrice(tokens[1], 19542.153);
        await waitFor(() => expect(srcUsd.current).bignumber.eq(0.23));
        await waitFor(() => expect(dstUsd.current).bignumber.eq(19542.153));
      });

      it("src amount = src amount ui in token decimals", async () => {
        const { result: srcAmountUiSet } = renderHook(() => useSetAtom(srcAmountUiAtom));
        const { result: srcAmount } = renderHook(() => useAtomValue(srcAmountGet));
        expect(srcAmount.current).bignumber.eq(zero);

        await act(async () => srcAmountUiSet.current("123.456"));
        expect(tokens[0].decimals).eq(18);
        expect(srcAmount.current).bignumber.eq(BN(123.456).times(1e18));
      });

      it("dst amount = src amount * (src usd / dst usd)", async () => {
        const { result: srcAmountUiSet } = renderHook(() => useSetAtom(srcAmountUiAtom));
        await act(async () => srcAmountUiSet.current("123.456"));

        const { result: dstAmount } = renderHook(() => useAtomValue(dstAmountGet));
        const { result: dstAmountUi } = renderHook(() => useAtomValue(dstAmountUiGet));

        await waitFor(() => expect(dstAmount.current).bignumber.gt(zero));
        expect(dstAmount.current).bignumber.eq(145_300);
        expect(dstAmountUi.current).eq("0.001453");
      });

      it("deterministic market price", async () => {
        const { result: marketPrice } = renderHook(() => useAtomValue(marketPriceGet(false)));
        expect(marketPrice.current.marketPrice).bignumber.closeTo(0.00001176, 0.00000001);
        expect(marketPrice.current.marketPriceUi).matches(/^0\.00001176/);
      });

      it("deterministic market price inverted", async () => {
        const { result: marketPrice } = renderHook(() => useAtomValue(marketPriceGet(true)));
        expect(marketPrice.current.leftToken).deep.eq(tokens[1]);
        expect(marketPrice.current.rightToken).deep.eq(tokens[0]);
        expect(marketPrice.current.marketPrice).bignumber.closeTo(84_965.882, 0.001);
        expect(marketPrice.current.marketPriceUi).matches(/^84,965\.882/);
      });

      it("limit price", async () => {
        const { result: limitPrice } = renderHook(() => useAtomValue(limitPriceGet(false)));
        expect(limitPrice.current.leftToken).deep.eq(tokens[0]);
        expect(limitPrice.current.rightToken).deep.eq(tokens[1]);
        expect(limitPrice.current.limitPrice).bignumber.closeTo(0.00001176, 0.00000001);
        expect(limitPrice.current.limitPriceUi).matches(/^0\.00001176/);

        const { result: limitPriceUiSetter } = renderHook(() => useSetAtom(limitPriceUiAtom));
        await act(async () => limitPriceUiSetter.current({ price: "1.234", inverted: false }));
        expect(limitPrice.current.limitPrice).bignumber.eq(1.234);
        expect(limitPrice.current.limitPriceUi).eq("1.234");
      });

      it("limit price inverted", async () => {
        const { result: limitPrice } = renderHook(() => useAtomValue(limitPriceGet(true)));
        expect(limitPrice.current.leftToken).deep.eq(tokens[1]);
        expect(limitPrice.current.rightToken).deep.eq(tokens[0]);
        expect(limitPrice.current.limitPrice).bignumber.closeTo(84_965.882, 0.001);
        expect(limitPrice.current.limitPriceUi).matches(/^84,965\.882/);

        const { result: limitPriceUiSetter } = renderHook(() => useSetAtom(limitPriceUiAtom));
        await act(async () => limitPriceUiSetter.current({ price: "1.234", inverted: true }));
        expect(limitPrice.current.limitPrice).bignumber.eq(1.234);
        expect(limitPrice.current.limitPriceUi).eq("1.234");
      });

      it("limit price interchangble", async () => {
        const { result: limitPrice } = renderHook(() => useAtomValue(limitPriceGet(false)));
        const { result: limitPriceInverted } = renderHook(() => useAtomValue(limitPriceGet(true)));
        expect(limitPrice.current.limitPrice).bignumber.closeTo(0.00001176, 0.00000001);
        expect(limitPrice.current.limitPriceUi).matches(/^0\.00001176/);
        expect(limitPriceInverted.current.limitPrice).bignumber.closeTo(84_965.882, 0.001);
        expect(limitPriceInverted.current.limitPriceUi).matches(/^84,965\.882/);

        const { result: limitPriceUiSetter } = renderHook(() => useSetAtom(limitPriceUiAtom));
        await act(async () => limitPriceUiSetter.current({ price: "1.234", inverted: true }));
        expect(limitPriceInverted.current.limitPrice).bignumber.eq(1.234);
        expect(limitPriceInverted.current.limitPriceUi).eq("1.234");
        expect(limitPrice.current.limitPrice).bignumber.closeTo(0.8103, 0.0001);
        expect(limitPrice.current.limitPriceUi).matches(/^0\.8103/);

        await act(async () => limitPriceUiSetter.current({ price: "4.321", inverted: false }));
        expect(limitPrice.current.limitPrice).bignumber.eq(4.321);
        expect(limitPrice.current.limitPriceUi).eq("4.321");
        expect(limitPriceInverted.current.limitPrice).bignumber.closeTo(0.2314, 0.0001);
        expect(limitPriceInverted.current.limitPriceUi).matches(/^0\.2314/);
      });

      it("dstUsdUi", async () => {
        const { result } = renderHook(() => useAtomValue(dstUsdUiGet));
        expect(result.current).eq("0");
        const { result: setSrcAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        await act(async () => setSrcAmount.current("123.456"));
        expect(result.current).matches(/^28\.394/);
      });

      it("srcUsdUi", async () => {
        const { result } = renderHook(() => useAtomValue(srcUsdUiGet));
        expect(result.current).eq("0");
        const { result: setSrcAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        await act(async () => setSrcAmount.current("123.456"));
        expect(result.current).matches(/^28\.394/);
      });

      it("total chunks with max, chunk amount", async () => {
        const { result: setSrcAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        const { result: totalChunks } = renderHook(() => useAtom(totalChunksAtom));
        const { result: srcChunk } = renderHook(() => useAtomValue(srcChunkAmountGet));
        const { result: srcChunkUi } = renderHook(() => useAtomValue(srcChunkAmountUiGet));
        const { result: maxChunks } = renderHook(() => useAtomValue(maxPossibleChunksGet));

        await act(async () => totalChunks.current[1](12));
        expect(totalChunks.current[0]).eq(1);

        await act(async () => setSrcAmount.current("1234.56"));
        expect(maxChunks.current).eq(28);

        await act(async () => totalChunks.current[1](12));
        expect(totalChunks.current[0]).eq(12);

        await act(async () => totalChunks.current[1](100));
        expect(totalChunks.current[0]).eq(28);

        expect(srcChunk.current).bignumber.closeTo(44.091 * 1e18, 0.001 * 1e18);
        expect(srcChunkUi.current).matches(/^44\.091/);
      });

      it("switch tokens", async () => {
        const { result: switchTokens } = renderHook(() => useSetAtom(switchTokensSet));
        const { result: srcAmount } = renderHook(() => useAtom(srcAmountUiAtom));
        const { result: dstAmount } = renderHook(() => useAtomValue(dstAmountUiGet));
        const { result: srcToken } = renderHook(() => useAtomValue(srcTokenAtom));
        const { result: dstToken } = renderHook(() => useAtomValue(dstTokenAtom));

        await act(async () => srcAmount.current[1]("1234.56"));
        await act(async () => switchTokens.current());

        expect(srcToken.current).deep.eq(tokens[1]);
        expect(dstToken.current).deep.eq(tokens[0]);
        expect(srcAmount.current[0]).matches(/^0\.01453/);
        expect(dstAmount.current).matches(/^1,234\.55/);
      });

      it("should wrap native srcToken", async () => {
        const { result: shouldWrap } = renderHook(() => useAtomValue(shouldWrapNativeGet));
        const { result: setSrcToken } = renderHook(() => useSetAtom(srcTokenAtom));
        const { result: setSrcAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        expect(shouldWrap.current).eq(false);
        await act(async () => setSrcToken.current({ address: zeroAddress, symbol: "native", decimals: 1 }));
        await act(async () => setSrcAmount.current("123.456"));
        expect(shouldWrap.current).eq(true);
      });

      it("fill delay, max duration, custom fill, total chunks", async () => {
        const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        await act(async () => setAmount.current("12345.567"));

        const { result: totalChunks } = renderHook(() => useAtom(totalChunksAtom));
        const { result: maxDuration } = renderHook(() => useAtom(maxDurationAtom));
        const { result: fillDelay } = renderHook(() => useAtom(fillDelayAtom));
        const { result: customFill } = renderHook(() => useAtom(customFillDelayEnabledAtom));
        expect(totalChunks.current[0]).eq(1);
        expect(maxDuration.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 5 });
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 0 });

        await act(async () => totalChunks.current[1](3));
        expect(totalChunks.current[0]).eq(3);
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 0 });

        await act(async () => maxDuration.current[1]({ resolution: TimeResolution.Minutes, amount: 0 }));
        expect(maxDuration.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 1 });
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 0 });

        await act(async () => maxDuration.current[1]({ resolution: TimeResolution.Minutes, amount: 0.5 }));
        expect(maxDuration.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 1 });
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 0 });

        await act(async () => maxDuration.current[1]({ resolution: TimeResolution.Minutes, amount: 12 }));
        expect(maxDuration.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 12 });
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 2 });

        await act(async () => maxDuration.current[1]({ resolution: TimeResolution.Hours, amount: 1 }));
        expect(maxDuration.current[0]).deep.eq({ resolution: TimeResolution.Hours, amount: 1 });
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 18 });

        await act(async () => customFill.current[1](true));
        await act(async () => fillDelay.current[1]({ resolution: TimeResolution.Minutes, amount: 5 }));
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 5 });

        await act(async () => fillDelay.current[1]({ resolution: TimeResolution.Hours, amount: 5 }));
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Hours, amount: 5 });

        await act(async () => customFill.current[1](false));
        expect(fillDelay.current[0]).deep.eq({ resolution: TimeResolution.Minutes, amount: 18 });
      });

      it("deadline", async () => {
        const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        await act(async () => setAmount.current("1234.567"));
        const { result: maxDuration } = renderHook(() => useAtomValue(maxDurationAtom));
        const { result: totalChunks } = renderHook(() => useAtom(totalChunksAtom));
        const { result: deadline } = renderHook(() => useAtomValue(deadlineGet));
        const { result: deadlineUi } = renderHook(() => useAtomValue(deadlineUiGet));
        expect(maxDuration.current).deep.eq({ resolution: TimeResolution.Minutes, amount: 5 });
        await act(async () => totalChunks.current[1](3));
        expect(totalChunks.current[0]).eq(3);
        expect(deadlineUi.current).not.empty;
        const duration = 5 * 60 * 1000;
        const extraMinuteForConfirmation = 60 * 1000;
        expect(deadline.current).closeTo(Date.now() + duration + extraMinuteForConfirmation, 1000);
      });

      it("minAmountOut", async () => {
        const { result: price } = renderHook(() => useAtomValue(limitPriceGet(false)));
        const { result: dstMinAmount } = renderHook(() => useAtomValue(dstMinAmountOutGet));
        const { result: dstMinAmountUi } = renderHook(() => useAtomValue(dstMinAmountOutUiGet));
        const { result: srcChunkAmount } = renderHook(() => useAtomValue(srcChunkAmountGet));
        const { result: totalChunks } = renderHook(() => useSetAtom(totalChunksAtom));
        const { result: limitOrder } = renderHook(() => useSetAtom(isLimitOrderAtom));
        const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        expect(price.current.limitPrice).bignumber.closeTo(0.00001176, 0.00000001);
        await act(async () => setAmount.current("1234.567"));
        expect(dstMinAmount.current).bignumber.eq(1);
        expect(dstMinAmountUi.current).eq("");

        await act(async () => totalChunks.current(3));
        expect(srcChunkAmount.current).bignumber.closeTo(411.5223 * 1e18, 0.0001 * 1e18);
        expect(dstMinAmount.current).bignumber.eq(1);
        expect(dstMinAmountUi.current).eq("");

        await act(async () => limitOrder.current(true));
        expect(dstMinAmount.current).bignumber.closeTo(0.004843 * 1e8, 0.000001 * 1e8);
        expect(dstMinAmountUi.current).matches(/^0\.004843/);
      });

      it("set src token resets amount and limit", async () => {
        const { result: amount } = renderHook(() => useAtomValue(srcAmountUiAtom));
        const { result: price } = renderHook(() => useAtomValue(limitPriceGet(false)));
        const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
        const { result: setPrice } = renderHook(() => useSetAtom(limitPriceUiAtom));
        const { result: setSrcToken } = renderHook(() => useSetAtom(srcTokenAtom));
        await act(async () => setAmount.current("123.456"));
        await act(async () => setPrice.current({ price: "9876.123", inverted: false }));
        expect(amount.current).eq("123.456");
        expect(price.current.limitPriceUi).eq("9876.123");

        await act(async () => setSrcToken.current(tokens[3]));
        expect(amount.current).eq("");
        expect(price.current.limitPriceUi).eq("0");
      });

      it("set dst token resets limit", async () => {
        const { result: price } = renderHook(() => useAtomValue(limitPriceGet(false)));
        const { result: setPrice } = renderHook(() => useSetAtom(limitPriceUiAtom));
        const { result: setDstToken } = renderHook(() => useSetAtom(dstTokenAtom));
        await act(async () => setPrice.current({ price: "9876.123", inverted: false }));
        expect(price.current.limitPriceUi).eq("9876.123");

        await act(async () => setDstToken.current(tokens[3]));
        expect(price.current.limitPriceUi).eq("0");
      });

      [
        { name: "gasPrice input undefined", input: undefined },
        {
          name: "gasPrice input not undefined",
          input: { priorityFeePerGas: (11 * 1e9).toString(), maxFeePerGas: (30 * 1e9).toString() },
          expected: [11, 30],
        },
        {
          name: "gasPrice input priorityFeePerGas undefined",
          input: { priorityFeePerGas: undefined, maxFeePerGas: (30 * 1e9).toString() },
          expected: [undefined, 30],
        },
        {
          name: "gasPrice input all 0",
          input: { priorityFeePerGas: "0", maxFeePerGas: "" },
          expected: undefined,
        },
        {
          name: "gasPrice input maxFeePerGas undefined",
          input: { priorityFeePerGas: (11 * 1e9).toString(), maxFeePerGas: undefined },
          expected: [11, undefined],
        },
      ].map((c) =>
        it(c.name, async () => {
          const { result: gasPrice } = renderHook(() => useAtomValue(gasPriceGet(c.input)));
          await waitFor(async () => expect(gasPrice.current.maxFeePerGas).bignumber.not.zero);
          await waitFor(async () => expect(gasPrice.current.priorityFeePerGas).bignumber.not.zero);
          expect(gasPrice.current.priorityFeePerGas).bignumber.gt(1e9).lte(gasPrice.current.maxFeePerGas);
          if (c.expected) {
            c.expected[0] && expect(gasPrice.current.priorityFeePerGas).bignumber.eq(c.expected[0] * 1e9);
            c.expected[1] &&
              expect(gasPrice.current.maxFeePerGas)
                .bignumber.gte(c.expected[1] * 1e9)
                .gte(gasPrice.current.priorityFeePerGas);
          }
        })
      );

      it("using same usd price in case both tokens based on native", async () => {
        const { result: setSrcToken } = renderHook(() => useSetAtom(srcTokenAtom));
        const { result: srcToken } = renderHook(() => useAtomValue(srcTokenAtom));
        const { result: setDstToken } = renderHook(() => useSetAtom(dstTokenAtom));
        const { result: dstToken } = renderHook(() => useAtomValue(dstTokenAtom));
        const { result: lib } = renderHook(() => useAtomValue(twapLibAtom));
        const { result: srcUsd } = renderHook(() => useAtomValue(usdGet(srcToken.current)).value);
        const { result: dstUsd } = renderHook(() => useAtomValue(usdGet(dstToken.current)).value);

        const native = { ...tokens[0], address: zeroAddress };

        await act(async () => setSrcToken.current(native));
        await act(async () => setDstToken.current(lib.current?.config.wToken));
        expect(srcUsd.current).bignumber.eq(dstUsd.current);

        await act(async () => setSrcToken.current(lib.current?.config.wToken));
        await act(async () => setDstToken.current(native));
        expect(srcUsd.current).bignumber.eq(dstUsd.current);

        await act(async () => setSrcToken.current(lib.current?.config.wToken));
        await act(async () => setDstToken.current(tokens[1]));
        expect(srcUsd.current).bignumber.not.eq(dstUsd.current);
      });

      describe("with mock lib web3 results", () => {
        let lib: TWAPLib;
        beforeEach(async () => {
          const { result } = renderHook(() => useAtomValue(twapLibAtom));
          lib = result.current!;
          lib.makerBalance = (token: TokenData) => Promise.resolve(BN(1234.567 * 10 ** token.decimals));
          const { result: srcBalance } = renderHook(() => useAtomValue(balanceGet(tokens[0])).value);
          const { result: dstBalance } = renderHook(() => useAtomValue(balanceGet(tokens[1])).value);
          await waitFor(async () => expect(srcBalance.current).bignumber.not.zero);
          await waitFor(async () => expect(dstBalance.current).bignumber.not.zero);
        });

        it("maker balance", async () => {
          const { result: srcBalance } = renderHook(() => useAtomValue(balanceGet(tokens[0])).value);
          expect(srcBalance.current).bignumber.eq(1234.567 * 1e18);

          const { result: srcBalanceUi } = renderHook(() => useAtomValue(srcBalanceUiGet));
          const { result: dstBalanceUi } = renderHook(() => useAtomValue(dstBalanceUiGet));
          expect(srcBalanceUi.current).eq("1,234.567");
          expect(dstBalanceUi.current).eq("1,234.567");
        });

        it("src amount change percent of balance", async () => {
          const { result: srcAmount } = renderHook(() => useAtomValue(srcAmountGet));
          const { result: srcAmountUi } = renderHook(() => useAtomValue(srcAmountUiAtom));
          const { result: onChange } = renderHook(() => useSetAtom(srcAmountPercentSet));

          await act(async () => onChange.current(0.5));
          expect(srcAmountUi.current).eq("617.2835");
          expect(srcAmount.current).bignumber.eq(617.2835 * 1e18);
        });

        it("src amount change resets total chunks", async () => {
          const { result: totalChunks } = renderHook(() => useAtomValue(totalChunksAtom));
          const { result: setTotalChunks } = renderHook(() => useSetAtom(totalChunksAtom));
          const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
          await act(async () => setAmount.current("500"));
          await act(async () => setTotalChunks.current(5));
          expect(totalChunks.current).eq(5);
          await act(async () => setAmount.current("1000"));
          expect(totalChunks.current).eq(1);
        });

        it("src token change resets parameters", async () => {
          const { result: totalChunks } = renderHook(() => useAtomValue(totalChunksAtom));
          const { result: setTotalChunks } = renderHook(() => useSetAtom(totalChunksAtom));
          const { result: setSrcToken } = renderHook(() => useSetAtom(srcTokenAtom));
          const { result: srcToken } = renderHook(() => useAtomValue(srcTokenAtom));
          const { result: setAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
          const { result: srcAmountUi } = renderHook(() => useAtomValue(srcAmountUiAtom));
          const { result: limitPrice } = renderHook(() => useAtomValue(limitPriceGet(false)));
          const { result: marketPrice } = renderHook(() => useAtomValue(marketPriceGet(false)));

          await act(async () => setAmount.current("500"));
          await act(async () => setTotalChunks.current(5));
          expect(totalChunks.current).eq(5);
          await act(async () => setSrcToken.current(tokens[3]));
          expect(srcToken.current).deep.eq(tokens[3]);
          expect(totalChunks.current).eq(1);
          expect(srcAmountUi.current).eq("");
          expect(limitPrice.current.limitPrice).bignumber.eq(marketPrice.current.marketPrice);
        });

        it("limit price returns empty string if inserted value is 0 or empty string and not inverted", async () => {
          const { result: setLimitprice } = renderHook(() => useSetAtom(limitPriceUiAtom));
          const { result: limitPriceInverted } = renderHook(() => useAtomValue(limitPriceGet(true)));
          await act(async () => setLimitprice.current({ price: "", inverted: false }));
          expect(limitPriceInverted.current.limitPriceUi).eq("");
        });

        it("limit price returns empty string if inserted value is 0 or empty string and inverted", async () => {
          const { result: setLimitprice } = renderHook(() => useSetAtom(limitPriceUiAtom));
          const { result: limitPriceNotInverted } = renderHook(() => useAtomValue(limitPriceGet(false)));
          await act(async () => setLimitprice.current({ price: "", inverted: true }));
          expect(limitPriceNotInverted.current.limitPriceUi).eq("");
        });

        it("token allowance", async () => {
          const { result: setSrcAmount } = renderHook(() => useSetAtom(srcAmountUiAtom));
          await act(async () => setSrcAmount.current("10"));
          await act(async () => (lib.hasAllowance = () => Promise.resolve(true)));
          const { result: allowance } = renderHook(() => useAtomValue(tokenAllowanceGet));
          await waitFor(() => expect(allowance.current.hasAllowance).eq(true));
        });

        describe("order history", () => {
          let orders: Order[];
          beforeEach(async () => {
            orders = [
              {
                id: 123,
                srcFilledAmount: BN(123 * 1e18),
                filledTime: (Date.now() - 60_000) / 1000,
                status: 1,
                ask: {
                  time: (Date.now() - 10 * 60_000) / 1000,
                  deadline: Date.now() / 1000,
                  maker: lib.maker,
                  exchange: zeroAddress,
                  srcToken: tokens[0].address,
                  dstToken: tokens[1].address,
                  srcAmount: BN(500 * 1e18),
                  srcBidAmount: BN(123 * 1e18),
                  dstMinAmount: BN(10 * 1e8),
                  bidDelay: 60,
                  fillDelay: 120,
                },
                bid: { time: 0, dstFee: zero, taker: "", exchange: "", dstAmount: zero, data: "" },
              },
            ];
            await act(async () => (lib.getAllOrders = () => Promise.resolve(orders)));
          });

          it("order history", async () => {
            const { result: tokenList } = renderHook(() => useSetAtom(allTokensListAtom));
            await act(async () => tokenList.current(tokens));

            const { result: history } = renderHook(() => useAtomValue(orderHistoryGet));
            await waitFor(async () => expect(history.current.orders).not.undefined);

            expect(history.current.orders![Status.Canceled]).length(1);
            expect(history.current.orders![Status.Canceled][0].order).deep.eq(orders[0]);
            expect(history.current.orders![Status.Canceled][0].ui.status).eq("Canceled");
            expect(history.current.orders![Status.Canceled][0].ui.srcToken).deep.eq(tokens[0]);
            expect(history.current.orders![Status.Canceled][0].ui.dstToken).deep.eq(tokens[1]);
            expect(history.current.orders![Status.Canceled][0].ui.srcUsdUi).matches(/^0.23/);
            expect(history.current.orders![Status.Canceled][0].ui.dstUsdUi).matches(/^19,542.153/);
            expect(history.current.orders![Status.Canceled][0].ui.fillDelay).eq(120_000);
          });
        });
      });
    });
  });
});
