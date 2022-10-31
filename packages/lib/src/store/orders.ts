import { contract, eqIgnoreCase, Abi, BigNumber, Token, zero } from "@defi.org/web3-candies";
import _ from "lodash";
import { useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TwapContext } from "../context";
import { Order, OrderStatus, TokenInfo } from "../types";
import { getBigNumberToUiAmount, getIntervalForUi, getToken, useGetBigNumberToUiAmount, useUsdValue, useWeb3 } from "./store";
import lensAbi from "./lens-abi.json";
import moment from "moment";
import twapAbi from "./twap-abi.json";

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
      console.log(orders);

      const arr = _.map(orders, (o) => {
        const srcTokenInfo = getTokenFromList(tokensList, o.ask.srcToken);
        const dstTokenInfo = getTokenFromList(tokensList, o.ask.dstToken);
        const srcToken = getToken(srcTokenInfo);
        const dstToken = getToken(dstTokenInfo);
        const srcTokenAmount = BigNumber(o.ask.srcAmount);
        const srcFilledAmount = BigNumber(o.srcFilledAmount);
        const tradeSize = BigNumber(o.ask.srcBidAmount);
        const dstMinAmount = BigNumber(o.ask.dstMinAmount);

        return {
          srcTokenAmount, // left top (10 wbtc figma )
          tradeSize,
          dstMinAmount,
          delay: parseInt(o.ask.delay),
          tradeIntervalUi: getIntervalForUi(parseInt(o.ask.delay) * 1000),
          id: o.id,
          status: parseStatus(parseInt(o.status), latestBlock!),
          time: parseInt(o.ask.time),
          createdAtUi: moment(parseInt(o.ask.time) * 1000).format("DD/MM/YY HH:mm"),
          deadline: parseInt(o.ask.deadline),
          deadlineUi: moment(parseInt(o.ask.deadline) * 1000).format("DD/MM/YY HH:mm"),
          srcToken,
          dstToken,
          progress: srcFilledAmount.div(srcTokenAmount).times(100).toNumber(),
          srcFilledAmount,
          srcRemainingAmount: srcTokenAmount.minus(srcFilledAmount),

          // price:
        };
      });

      return _.groupBy(arr, "status");
    },
    {
      enabled: !!account && !!config && !!web3,
      refetchInterval: 30_000,
    }
  );
};

// dstMinAmount.eq(1) , market order, same logic as twap
// limit price of dest token (for 1 src token) =  destMinAmount.div(convertDecimals(tradeSzie, srcToken, dstToken ))

export const useCancelCallback = () => {
  const client = useQueryClient();
  const { config, account } = useWeb3();
  const { refetch } = useOrders();

  return useMutation(
    async (orderId: string) => {
      const twap = contract(twapAbi as Abi, config.twapAddress);
      await twap.methods.cancel(orderId).send({ from: account });
      await refetch();
    },
    {
      onSuccess: (_result, orderId) => {
        client.setQueryData(["useOrders", account], (prevData: any) => {
          const index = prevData.findIndex((e: Order) => e.id === orderId);
          prevData[index].status = 1;
          return prevData;
        });
      },
    }
  );
};
