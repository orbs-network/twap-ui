import { Configs, TWAPLib } from "@orbs-network/twap";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { networks, web3 } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { Dapp } from "./Components";
import moment from "moment";
import BN from "bignumber.js";

const useStatus = (dapp: Dapp) => {
  const { library: provider, account } = useWeb3React(); // TODO replace with useLib from twap-ui store

  return useQuery(
    ["useStatus", dapp.config.partner, account],
    async () => {
      const twapVersion = require("@orbs-network/twap/package.json").version;
      const twapUiVersion = require("@orbs-network/twap-ui/package.json").version;

      const lib = new TWAPLib(dapp.config, account || "", provider); // TODO replace with useLib
      const network = _.find(networks, (n) => n.id === dapp.config.chainId)!;

      const fetchBalances = (wallets: string[]) =>
        Promise.all(
          wallets.map((w) =>
            web3()
              .eth.getBalance(w)
              .then(BN)
              .then((it) => Number(it.div(1e18).toFixed(2)))
          )
        );

      const backupTakersStatus = await Promise.all(
        [1, 2].map((i) =>
          fetch(`https://twap-taker-${network.shortname}-${dapp.config.partner.toLowerCase()}-${i}.herokuapp.com/health`)
            .then((x) => x.json())
            .then(async (s) => {
              const allWallets = (s.takersWallets as string[]).map((w) => w.split("wallet: ")[1]);
              const wallets = allWallets.filter((w, wi) =>
                s.instanceIndex
                  .split(", ")
                  .filter((x: string) => !!x)
                  .map(Number)
                  .includes(wi)
              );
              return {
                uptime: (moment.utc(s.uptime * 1000).dayOfYear() > 1 ? moment.utc(s.uptime * 1000).dayOfYear() + " days " : "") + moment.utc(s.uptime * 1000).format("HH:mm:ss"),
                balances: _.sortBy(await fetchBalances(wallets)),
              };
            })
        )
      );

      return {
        twapVersion,
        twapUiVersion,
        backupTaker1Uptime: backupTakersStatus[0].uptime,
        backupTaker1Balances: backupTakersStatus[0].balances,
        backupTaker2Uptime: backupTakersStatus[1].uptime,
        backupTaker2Balances: backupTakersStatus[1].balances,
      };
    },
    {
      enabled: !!provider && !!account,
      refetchInterval: 60_000,
    }
  );
};

export function Status({ dapp }: { dapp: Dapp }) {
  const status = useStatus(dapp);
  return status.isLoading ? null : (
    <div>
      <div>Status:</div>
      <div>TWAP Version: {status.data!.twapVersion}</div>
      <div>TWAP-UI Version: {status.data!.twapUiVersion}</div>
      <div>Chain: {dapp.config.chainId}</div>
      <div>TWAP: {dapp.config.twapAddress}</div>
      <div>Lens: {dapp.config.lensAddress}</div>
      <div>
        Exchange: {dapp.config.exchangeAddress} {dapp.config.exchangeType}
      </div>
      <div>
        Backup Taker 1: uptime: {status.data!.backupTaker1Uptime} gas: {status.data!.backupTaker1Balances.join(", ")}
      </div>
      <div>
        Backup Taker 2: uptime: {status.data!.backupTaker2Uptime} gas: {status.data!.backupTaker2Balances.join(", ")}
      </div>
    </div>
  );
}
