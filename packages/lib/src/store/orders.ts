import { contract, eqIgnoreCase, Abi, BigNumber, Token } from "@defi.org/web3-candies";
import _ from "lodash";
import { useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";
import { TwapContext } from "../context";
import { OrderStatus, TokenInfo } from "../types";
import { getBigNumberToUiAmount, getIntervalForUi, getToken, useGetBigNumberToUiAmount, useUsdValue, useWeb3 } from "./store";
import lensAbi from "./lens-abi.json";
import moment from "moment";

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

const useGetUsdValueCallback = () => {
  const client = useQueryClient();
  const { getUsdPrice } = useContext(TwapContext);

  return async (token: Token) => {
    const data = client.getQueryData(["useUsdValue", token.address]) as BigNumber;
    if (data) {
      return data.div(1e18);
    }

    const decimals = await token.decimals();
    const result = await getUsdPrice(token.address!, decimals);

    client.setQueryData(["useUsdValue", token.address], result);
    return result.div(1e18);
  };
};

export const useOrdersUsdValueToUi = (token?: Token, amount?: BigNumber) => {
  const { data } = useUsdValue(token);
  const resultUi = useGetBigNumberToUiAmount(token, amount);

  const result = data?.times(amount || 0);
  if (!result) {
    return "";
  }
  return resultUi;
};

function parseStatus(status: number, latestBlock: number) {
  if (status === 1) return OrderStatus.Canceled;
  if (status === 2) return OrderStatus.Filled;
  if (status < latestBlock) return OrderStatus.Expired;
  return OrderStatus.Open;
}

export const useOrders = () => {
  const { account, config, web3 } = useWeb3();
  const tokensList = useContext(TwapContext).tokensList;

  return useQuery(
    ["useOrders", account],
    async () => {
      const lens = contract(lensAbi as Abi, config.lensContract);
      const orders = await lens.methods.makerOrders(account).call();

      const latestBlock = await web3?.eth.getBlockNumber();
      const arr = await Promise.all(
        _.map(orders, async (o) => {
          const srcTokenInfo = getTokenFromList(tokensList, o.ask.srcToken);
          const srcToken = getToken(srcTokenInfo);
          const srcTokenAmount = BigNumber(o.ask.srcAmount);
          const srcFilledAmount = BigNumber(o.srcFilledAmount);
          const tradeSize = BigNumber(o.ask.srcBidAmount);
          const dstMinAmount = BigNumber(o.ask.dstMinAmount);

          return {
            srcToken: o.ask.srcToken,
            dstToken: o.ask.dstToken,
            srcTokenAmount, // left top (10 wbtc figma )
            srcTokenAmountUi: await getBigNumberToUiAmount(srcToken, srcTokenAmount),
            tradeSize,
            tradeSizeUi: await getBigNumberToUiAmount(srcToken, tradeSize),
            dstMinAmount,
            delay: parseInt(o.ask.delay),
            tradeIntervalUi: getIntervalForUi(parseInt(o.ask.delay) * 1000),
            id: o.id,
            status: parseStatus(parseInt(o.status), latestBlock!),
            srcFilledAmount,
            srcFilledAmountUi: await getBigNumberToUiAmount(srcToken, srcFilledAmount),
            time: parseInt(o.ask.time),
            createdAtUi: moment(parseInt(o.ask.time) * 1000).format("DD/MM/YY HH:mm"),
            deadline: parseInt(o.ask.deadline),
            deadlineUi: moment(parseInt(o.ask.deadline) * 1000).format("DD/MM/YY HH:mm"),

            // price:
          };
        })
      );

      return _.groupBy(arr, "status");
    },
    {
      enabled: !!account && !!config && !!web3,
      refetchInterval: 30_000,
      refetchOnWindowFocus: false,
    }
  );
};
