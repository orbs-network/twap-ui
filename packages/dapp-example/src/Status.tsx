import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { network } from "@defi.org/web3-candies";
import { Dapp } from "./Components";
import moment from "moment";
import BN from "bignumber.js";
import { useSelectedDapp } from "./hooks";
import { StyledStatus, StyledStatusSection, StyledStatusSectionText, StyledStatusSectionTitle } from "./styles";
import { useEffect, useState } from "react";

const chainNames = {
  ftm: "fantom",
  avax: "avalanche",
  poly: "polygon",
  arb: "arbitrum",
  bsc: "bsc",
};

const MIN_BALANCE = 0.001;

function useConfig(dapp?: Dapp) {
  const twapVersion = dapp?.config.twapVersion || "?";
  const twapLibVersion = require("@orbs-network/twap/package.json").version || "?";
  const twapUiVersion = require("@orbs-network/twap-ui/package.json").version || "?";
  const info = network(dapp?.config.chainId || 0) || {};
  return { twapVersion, twapLibVersion, twapUiVersion, info };
}

function useBackupTakersStatus(dapp?: Dapp) {
  return useQuery(
    ["useBackupTakersStatus", dapp?.config.chainId],
    async () =>
      fetch("https://wallet-manager-1-a1922d7bed1d.herokuapp.com/health")
        .then((x) => x.json())
        .then(async (s: any) => {
          return {
            status: s.networks[(chainNames as any)[dapp!.config.chainName]].status === "OK",
            balances: [
              BN(s.networks[(chainNames as any)[dapp!.config.chainName]].wallets.treasury.balanceInWU)
                .times(1e3)
                .integerValue()
                .div(1e3)
                .toNumber(),
            ],
            count: _.size(s.networks[(chainNames as any)[dapp!.config.chainName]].wallets.availableWallets),
          };
        })
        .catch(() => ({ status: false, balances: [] as number[], count: 0 })),
    {
      enabled: !!dapp,
      refetchInterval: 60_000,
    }
  ).data;
}

function useOrbsL3TakersStatus(dapp?: Dapp) {
  return useQuery(["useOrbsL3TakersStatus", dapp?.config.chainId], async () => {
    const orbsStatus = await (await fetch("https://status.orbs.network/json-full")).json();
    const result = _.map(orbsStatus.CommitteeNodes, (node) => {
      try {
        const nodeStatus = _.get(node, ["NodeServices", "vm-twap", "VMStatusJson"]);
        const balance = BN(_.values(nodeStatus.takersWallets[(chainNames as any)[dapp!.config.chainName]])[0].balance)
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
    const online = _.sortBy(
      _.filter(result, (r) => r.status),
      (r) => r.balance
    );
    return { status: online.length >= 10, balances: online.map((n) => n.balance) };
  }).data;
}

const Image = ({ logo }: { logo?: string }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [logo]);

  return <img alt="" src={logo} onLoad={() => setLoaded(true)} width={10} height={10} style={{ marginRight: 2, opacity: !loaded ? 0 : 1 }} />;
};

export function Status() {
  const { selectedDapp: dapp } = useSelectedDapp();
  const config = useConfig(dapp);

  const orbsTakers = useOrbsL3TakersStatus(dapp);
  const backupTakers = useBackupTakersStatus(dapp);
  return (
    <>
      {dapp && (
        <StyledStatus>
          <StyledStatusSection>
            <StyledStatusSectionTitle>
              <a href={"https://github.com/orbs-network/twap"} target={"_blank"}>
                TWAP Version:
              </a>
            </StyledStatusSectionTitle>
            <StyledStatusSectionText>{config?.twapVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>
              <a href={"https://github.com/orbs-network/twap"} target={"_blank"}>
                TWAP Lib Version:
              </a>
            </StyledStatusSectionTitle>
            <StyledStatusSectionText>{config?.twapLibVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>
              <a href={"https://github.com/orbs-network/twap-ui"} target={"_blank"}>
                TWAP-UI Version:
              </a>
            </StyledStatusSectionTitle>
            <StyledStatusSectionText>{config?.twapUiVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Chain:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <Image logo={config?.info?.logoUrl} /> {config?.info?.name} {dapp.config.chainId}
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <a href={config ? `${config.info?.explorer}/address/${dapp.config.twapAddress}` : ""} target={"_blank"}>
                {dapp.config.twapAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Lens:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <a href={config ? `${config.info?.explorer}/address/${dapp.config.lensAddress}` : ""} target={"_blank"}>
                {dapp.config.lensAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>Exchange:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              {dapp.config.exchangeType}{" "}
              <a href={config ? `${config.info?.explorer}/address/${dapp.config.exchangeAddress}` : ""} target={"_blank"}>
                {dapp.config.exchangeAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>
              <a href={"https://twap-takers.orbs.network/"} target={"_blank"}>
                {!orbsTakers ? "" : orbsTakers.status ? "✅" : "⚠️"} Orbs L3 Takers ({orbsTakers?.balances.length}):
              </a>
            </StyledStatusSectionTitle>
            <StyledStatusSectionText>gas: {orbsTakers?.balances.slice(0, 5).join(" / ")}...</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>
              <a href={"https://twap-takers.orbs.network/"} target={"_blank"}>
                {!backupTakers ? "" : backupTakers.status ? "✅" : "⚠️"} Orbs Backup Takers ({backupTakers?.count}):
              </a>
            </StyledStatusSectionTitle>
            <StyledStatusSectionText>gas: {backupTakers?.balances.join(" / ")}</StyledStatusSectionText>
          </StyledStatusSection>
        </StyledStatus>
      )}
    </>
  );
}
