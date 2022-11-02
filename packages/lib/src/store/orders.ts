import { contract, eqIgnoreCase, Abi, BigNumber, Token, zero, convertDecimals, block } from "@defi.org/web3-candies";
import _ from "lodash";
import { useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TwapContext } from "../context";
import { Order, OrderStatus, TokenInfo } from "../types";
import { getBigNumberToUiAmount, getIntervalForUi, getToken, useGetBigNumberToUiAmount, useUsdValue, useWeb3 } from "./store";
import lensAbi from "./lens-abi.json";
import moment from "moment";
import twapAbi from "./twap-abi.json";
import { txHandler } from "..";

const getTokenFromList = (tokensList: TokenInfo[], address?: string) => {
  if (!address) {
    return {} as TokenInfo;
  }
  return tokensList.find((it) => eqIgnoreCase(it.address, address)) || ({} as TokenInfo);
};

export const useTokenFromTokensList = (address?: string) => {
  const { tokensList } = useContext(TwapContext);
  return getTokenFromList(tokensList, address);
};

export const useOrdersUsdValueToUi = (token?: Token, amount?: BigNumber) => {
  const { data, isLoading } = useUsdValue(token);
  const result = data?.times(amount || 0).div(1e18);

  return { data: useGetBigNumberToUiAmount(token, result), isLoading };
};

function parseStatus(status: number) {
  if (status === 1) return OrderStatus.Canceled;
  if (status === 2) return OrderStatus.Filled;
  if (status < Date.now() / 1000) return OrderStatus.Expired;
  return OrderStatus.Open;
}

const getAllUsdValuesCallback = () => {
  const { getUsdPrice, tokensList } = useContext(TwapContext);

  return useMutation(async (tokens: string[]) => {
    const result = await Promise.all(
      tokens.map(async (address) => {
        const decimals = tokensList.find((t) => eqIgnoreCase(t.address, address))?.decimals;
        return { address, value: await getUsdPrice(address, decimals!) };
      })
    );

    return Object.fromEntries(result.map((v) => [v.address, v.value]));
  });
};

export const useOrders = () => {
  const { account, config, web3 } = useWeb3();
  const tokensList = useContext(TwapContext).tokensList;
  const { mutateAsync: getUsdValues } = getAllUsdValuesCallback();

  return useQuery(
    ["useOrders", account],
    async () => {
      const lens = contract(lensAbi as Abi, config.lensAddress);
      const orders = await lens.methods.makerOrders(account).call();
      const srcAddresses = _.keys(_.groupBy(orders, "ask.srcToken"));
      const dstAddresses = _.keys(_.groupBy(orders, "ask.dstToken"));

      const usdValues = await getUsdValues(_.uniq([...dstAddresses, ...srcAddresses]));

      const arr = await Promise.all(
        _.map(orders, async (o) => {
          const srcTokenInfo = getTokenFromList(tokensList, o.ask.srcToken);
          const dstTokenInfo = getTokenFromList(tokensList, o.ask.dstToken);
          const srcToken = getToken(srcTokenInfo);
          const dstToken = getToken(dstTokenInfo);
          const srcTokenAmount = BigNumber(o.ask.srcAmount);
          const srcFilledAmount = BigNumber(o.srcFilledAmount);
          const tradeSize = BigNumber(o.ask.srcBidAmount);
          const dstMinAmount = BigNumber(o.ask.dstMinAmount);
          const isMarketOrder = dstMinAmount.eq(1);
          const dstLimitPrice = isMarketOrder
            ? usdValues[srcTokenInfo.address].div(usdValues[dstTokenInfo.address])
            : dstMinAmount.div(convertDecimals(tradeSize, srcTokenInfo.decimals, dstTokenInfo.decimals));
          const dstAmount = convertDecimals(srcTokenAmount, srcTokenInfo.decimals, dstTokenInfo.decimals).times(dstLimitPrice);
          const srcRemainingAmount = srcTokenAmount.minus(srcFilledAmount);
          const status = parseStatus(parseInt(o.status));

          return {
            srcTokenAmount,
            tradeSize,
            dstMinAmount,
            delay: parseInt(o.ask.delay),
            tradeIntervalUi: getIntervalForUi(parseInt(o.ask.delay) * 1000),
            id: o.id,
            status,
            time: parseInt(o.ask.time),
            createdAtUi: moment(parseInt(o.ask.time) * 1000).format("DD/MM/YY HH:mm"),
            deadline: parseInt(o.ask.deadline),
            deadlineUi: moment(parseInt(o.ask.deadline) * 1000).format("DD/MM/YY HH:mm"),
            srcToken,
            dstToken,
            progress: srcFilledAmount.div(srcTokenAmount).times(100).toNumber() || 1,
            srcFilledAmount,
            srcRemainingAmount,
            isMarketOrder,
            dstLimitPrice,
            prefix: isMarketOrder ? "~" : "≥",
            dstAmount,
            srcTokenInfo,
            dstTokenInfo,
            srcUsdValueUi: await getBigNumberToUiAmount(srcToken, srcTokenAmount.times(usdValues[srcTokenInfo.address]).div(1e18)),
            dstUsdValueUi: await getBigNumberToUiAmount(dstToken, dstAmount.times(usdValues[dstTokenInfo.address]).div(1e18)),
            srcTokenAmountUi: await getBigNumberToUiAmount(srcToken, srcTokenAmount),
            dstTokenAmountUi: await getBigNumberToUiAmount(dstToken, dstAmount),
            tradeSizeAmountUi: await getBigNumberToUiAmount(srcToken, tradeSize),
            tradeSizeUsdValueUi: await getBigNumberToUiAmount(srcToken, tradeSize.times(usdValues[srcTokenInfo.address]).div(1e18)),
            srcFilledAmountUi: await getBigNumberToUiAmount(srcToken, srcFilledAmount),
            srcFilledUsdValueUi: await getBigNumberToUiAmount(srcToken, srcFilledAmount.times(usdValues[srcTokenInfo.address]).div(1e18)),
            srcRemainingAmountUi: await getBigNumberToUiAmount(srcToken, srcRemainingAmount),
            srcRemainingUsdValueUi: await getBigNumberToUiAmount(srcToken, srcRemainingAmount.times(usdValues[srcTokenInfo.address]).div(1e18)),
          };
        })
      );

      return _.groupBy(arr, "status");
    },
    {
      enabled: !!account && !!config && !!web3 && !!tokensList?.length,
      refetchInterval: 30_000,
    }
  );
};

export const useCancelCallback = () => {
  const { config, account } = useWeb3();
  const { refetch } = useOrders();

  return useMutation(async (orderId: string) => {
    const tx = async () => {
      const twap = contract(twapAbi as Abi, config.twapAddress);
      await twap.methods.cancel(orderId).send({ from: account });
    };
    await txHandler(tx, 4000);
    await refetch();
  });
};
