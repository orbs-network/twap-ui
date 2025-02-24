import { useQuery } from "@tanstack/react-query";
import BN from "bignumber.js";
import { useEffect, useState } from "react";
import { get, size, sortBy } from "lodash";
import { getNetwork } from "@orbs-network/twap-sdk";
import { useDappContext } from "./context";
const chainNames = {
  ftm: "fantom",
  avax: "avalanche",
  poly: "polygon",
  arb: "arbitrum",
  bsc: "bsc",
};

const MIN_BALANCE = 0.001;

function useConfig() {
  const config = useDappContext().config;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twapLibVersion = require("@orbs-network/twap/package.json").version || "?";
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twapUiVersion = require("@orbs-network/twap-ui/package.json").version || "?";
  const info = getNetwork(config?.chainId || 0);
  return { twapLibVersion, twapUiVersion, info, ...config };
}

function useBackupTakersStatus() {
  const config = useDappContext().config;

  return useQuery(
    ["useBackupTakersStatus", config?.chainId],
    async () =>
      fetch("https://wallet-manager-1-a1922d7bed1d.herokuapp.com/health")
        .then((x) => x.json())
        .then(async (s: any) => {
          return {
            status: s.networks[(chainNames as any)[config!.chainName]].status === "OK",
            balances: [
              BN(s.networks[(chainNames as any)[config!.chainName]].wallets.treasury.balanceInWU)
                .times(1e3)
                .integerValue()
                .div(1e3)
                .toNumber(),
            ],
            count: size(s.networks[(chainNames as any)[config!.chainName]].wallets.availableWallets),
          };
        })
        .catch(() => ({ status: false, balances: [] as number[], count: 0 })),
    {
      enabled: !!config,
      refetchInterval: 60_000,
    },
  ).data;
}

function useOrbsL3TakersStatus() {
  const config = useDappContext().config;

  return useQuery(
    ["useOrbsL3TakersStatus", config?.chainId],
    async () => {
      const orbsStatus = await (await fetch("https://status.orbs.network/json-full")).json();
      const result = orbsStatus.CommitteeNodes.map((node: any) => {
        try {
          const nodeStatus = get(node, ["NodeServices", "vm-twap", "VMStatusJson"]);
          const balance = BN((Object.values(nodeStatus.takersWallets[(chainNames as any)[config!.chainName]])[0] as any).balance)
            .times(1e3)
            .integerValue()
            .div(1e3)
            .toNumber();
          return {
            status: balance > MIN_BALANCE,
            balance,
          };
        } catch (e) {
          return {
            status: false,
            balance: 0,
          };
        }
      });
      const online = sortBy(
        result.filter((r: any) => r.status),
        (r: any) => r.balance,
      );
      return { status: online.length >= 10, balances: online.map((n: any) => n.balance) };
    },
    {
      // enabled: !!config,
      enabled: false,
    },
  ).data;
}

const Image = ({ logo }: { logo?: string }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [logo]);

  return <img alt="" src={logo} onLoad={() => setLoaded(true)} width={10} height={10} style={{ marginRight: 2, opacity: !loaded ? 0 : 1 }} />;
};

export function Status() {
  const config = useConfig();

  const orbsTakers = useOrbsL3TakersStatus();
  const backupTakers = useBackupTakersStatus();
  return (
    <>
      {config && (
        <div>
          <div>
            <div>
              <a href={"https://github.com/orbs-network/twap"} target={"_blank"}>
                TWAP Version:
              </a>
            </div>
            <div>{config?.twapVersion}</div>
          </div>
          <div>
            <div>
              <a href={"https://github.com/orbs-network/twap"} target={"_blank"}>
                TWAP Lib Version:
              </a>
            </div>
            <div>{config?.twapLibVersion}</div>
          </div>
          <div>
            <div>
              <a href={"https://github.com/orbs-network/twap-ui"} target={"_blank"}>
                TWAP-UI Version:
              </a>
            </div>
            <div>{config?.twapUiVersion}</div>
          </div>
          <div>
            <div> Chain:</div>
            <div>
              <Image logo={config?.info?.logoUrl} /> {config?.info?.name} {config.chainId}
            </div>
          </div>
          <div>
            <div>TWAP:</div>
            <div>
              <a href={config ? `${config.info?.explorer}/address/${config.twapAddress}` : ""} target={"_blank"}>
                {config?.twapAddress}
              </a>
            </div>
          </div>
          <div>
            <div> Lens:</div>
            <div>
              <a href={config ? `${config.info?.explorer}/address/${config.lensAddress}` : ""} target={"_blank"}>
                {config.lensAddress}
              </a>
            </div>
          </div>
          <div>
            <div>Exchange:</div>
            <div>
              {config?.exchangeType}{" "}
              <a href={config ? `${config.info?.explorer}/address/${config?.exchangeAddress}` : ""} target={"_blank"}>
                {config?.exchangeAddress}
              </a>
            </div>
          </div>
          <div>
            <div>
              <a href={"https://twap-takers.orbs.network/"} target={"_blank"}>
                {!orbsTakers ? "" : orbsTakers.status ? "✅" : "⚠️"} Orbs L3 Takers ({orbsTakers?.balances.length}):
              </a>
            </div>
            <div>gas: {orbsTakers?.balances.slice(0, 5).join(" / ")}...</div>
          </div>
          <div>
            <div>
              <a href={"https://twap-takers.orbs.network/"} target={"_blank"}>
                {!backupTakers ? "" : backupTakers.status ? "✅" : "⚠️"} Orbs Backup Takers ({backupTakers?.count}):
              </a>
            </div>
            <div>gas: {backupTakers?.balances.join(" / ")}</div>
          </div>
        </div>
      )}
    </>
  );
}
