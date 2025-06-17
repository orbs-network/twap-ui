import { getNetwork, getOrderFillDelayMillis, getOrderLimitPriceRate } from "@orbs-network/twap-sdk";
import { TwapOrder, formatDecimals, fillDelayText, OrderStatus, OrdersProps } from "@orbs-network/twap-ui";
import { TableProps, Typography, Button, Table } from "antd";
import moment from "moment";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useDappContext } from "../context";
import { useGetToken } from "./hooks";

interface DataType {
  order: TwapOrder;
  cancelOrder: (order: TwapOrder) => Promise<string>;
  key: string;
}

const useOrderColumns = () => {
  const getToken = useGetToken();
  const { config } = useDappContext();
  const explorer = getNetwork(config.chainId)?.explorer;
  return useMemo(() => {
    const columns: TableProps<DataType>["columns"] = [
      {
        title: "ID",
        dataIndex: "order",
        key: "order",
        render: (order) => <Typography>{order.id}</Typography>,
      },
      {
        title: "Pair",
        dataIndex: "order",
        key: "order",
        render: (order) => {
          const srcToken = getToken(order.srcTokenAddress);
          const dstToken = getToken(order.dstTokenAddress);
          return (
            <Typography>
              {srcToken?.symbol} / {dstToken?.symbol}
            </Typography>
          );
        },
      },
      {
        title: "Limit Price",
        dataIndex: "order",
        key: "order",
        render: (order) => {
          const srcToken = getToken(order.srcTokenAddress);
          const dstToken = getToken(order.dstTokenAddress);
          const result = getOrderLimitPriceRate(order, srcToken?.decimals || 0, dstToken?.decimals || 0);
          return <Typography>{formatDecimals(result)}</Typography>;
        },
      },
      {
        title: "Create at",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => <Typography>{moment(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}</Typography>,
      },
      {
        title: "Expires at",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => <Typography>{moment(order.deadline).format("YYYY-MM-DD HH:mm:ss")}</Typography>,
      },
      {
        title: "Input amount",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          const srcToken = getToken(order.srcTokenAddress);

          return (
            <Typography>
              {formatDecimals(formatUnits(BigInt(order.srcAmount), srcToken?.decimals || 0).toString())} {srcToken?.symbol}
            </Typography>
          );
        },
      },
      {
        title: "Individual trade size",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          const srcToken = getToken(order.srcTokenAddress);
          return (
            <Typography>
              {formatDecimals(formatUnits(BigInt(order.srcAmountPerChunk), srcToken?.decimals || 0).toString())} {srcToken?.symbol}
            </Typography>
          );
        },
      },
      {
        title: "No. of trades",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          return <Typography>{order.chunks}</Typography>;
        },
      },
      {
        title: "Min. received",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          const dstToken = getToken(order.dstTokenAddress);

          if (order.dstMinAmount === "0") {
            return <Typography>-</Typography>;
          }
          return (
            <Typography>
              {formatDecimals(formatUnits(BigInt(order.dstMinAmount), dstToken?.decimals || 0).toString())} {dstToken?.symbol}
            </Typography>
          );
        },
      },
      {
        title: "Fill delay",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          return <Typography>{fillDelayText(getOrderFillDelayMillis(order, config))}</Typography>;
        },
      },
      {
        title: "Progress",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          return <Typography>{formatDecimals(order.progress.toFixed(2))}%</Typography>;
        },
      },
      {
        title: "Status",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => {
          return <Typography>{order.status}</Typography>;
        },
      },
      {
        title: "Tx hash",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder) => (
          <a target="_blank" href={`${explorer}/tx/${order.txHash}`}>
            Link
          </a>
        ),
      },

      {
        title: "Action",
        dataIndex: "order",
        key: "order",
        render: (order: TwapOrder, record: DataType) => {
          // const [isLoading, setIsLoading] = useState(false)

          if (order.status !== OrderStatus.Open) {
            return <Typography>-</Typography>;
          }
          return <CancelButton order={order} cancelOrder={record.cancelOrder} />;
        },
      },
    ];

    return columns;
  }, [getToken, explorer]);
};

const CancelButton = ({ order, cancelOrder }: { order: TwapOrder; cancelOrder: (order: TwapOrder) => Promise<string> }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await cancelOrder(order);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button type="primary" loading={isLoading} onClick={handleCancel}>
      Cancel
    </Button>
  );
};

export const OrdersPanel = (props: OrdersProps) => {
  const columns = useOrderColumns();
  const items: DataType[] = useMemo(() => {
    return props.orders.all.map((order, index) => {
      return {
        key: index.toString(),
        order,
        cancelOrder: props.onCancelOrder,
      };
    });
  }, [props.orders, props.onCancelOrder]);
  return <Table columns={columns} dataSource={items} />;
};
