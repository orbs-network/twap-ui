import React from "react";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "react-query";
import Web3 from "web3";
import { bn18, erc20s, fmt18, setWeb3Instance } from "@defi.org/web3-candies";

const queryClient = new QueryClient();

export const TWAP = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Inner />
    </QueryClientProvider>
  );
};

let externalStateExample: string[] = [];

const Inner = () => {
  const client = useQueryClient();

  const { data, isLoading } = useQuery(["query key"], async () => {
    const web3 = new Web3("");
    setWeb3Instance(web3);

    const amount = await erc20s.eth.WETH().amount(123.456);
    externalStateExample.push("balance:" + fmt18(amount) + fmt18(bn18(456789.123456)));
    return externalStateExample;
  });

  const mutation = useMutation(
    async (data: { id: number; title: string }) => {
      externalStateExample.push(data.id + "-" + data.title);
    },
    {
      onSuccess: () => client.invalidateQueries(["query key"]),
    }
  );

  return (
    <div>
      <div>Using react query</div>

      <div>{isLoading ? "LOADING" : data?.map((i, index) => <div key={index}>{i}</div>)}</div>

      <button
        onClick={() => {
          mutation.mutate({
            id: Date.now(),
            title: "just works",
          });
        }}
      >
        Mutate
      </button>
    </div>
  );
};
