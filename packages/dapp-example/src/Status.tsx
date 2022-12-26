import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { chainInfo } from "@defi.org/web3-candies";
import { Dapp } from "./Components";
import moment from "moment";
import BN from "bignumber.js";
import { useSelectedDapp } from "./hooks";
import { StyledStatus, StyledStatusSection, StyledStatusSectionText, StyledStatusSectionTitle } from "./styles";
import { useEffect, useState } from "react";

function useConfigAndNetwork(dapp?: Dapp) {
  return useQuery(
    ["useConfigAndNetwork", dapp?.config.partner],
    async () => {
      const twapVersion = require("@orbs-network/twap/package.json").version;
      const twapUiVersion = require("@orbs-network/twap-ui/package.json").version;
      const info = await chainInfo(dapp!.config.chainId);
      return { twapVersion, twapUiVersion, info };
    },
    { enabled: !!dapp, refetchInterval: 60_000 }
  ).data;
}

function useBackupTakersStatus(dapp?: Dapp) {
  return useQuery(
    ["useBackupTakersStatus", dapp?.config.partner],
    async () =>
      await Promise.all(
        [1, 2].map((i) =>
          fetch(`https://twap-taker-${dapp!.config.chainName}-${dapp!.config.partner.toLowerCase()}-${i}.herokuapp.com/health`)
            .then((x) => x.json())
            .then(async (s) => {
              const balances = _.sortBy(_.map(s.takersWallets, (w) => BN(w.balance).toFixed(1))).map(Number);
              return {
                status: s.uptime > 0 && balances[0] > 0.1,
                uptime: (moment.utc(s.uptime * 1000).dayOfYear() > 1 ? moment.utc(s.uptime * 1000).dayOfYear() + " days " : "") + moment.utc(s.uptime * 1000).format("HH:mm:ss"),
                balances,
                totalBids: (s.taker.bids as string) || "0",
                totalFills: (s.taker.fills as string) || "0",
                lastBid: (s.taker.lastBid?.order?.[0] as string) || "-",
                lastFill: (s.taker.lastBid?.order?.[0] as string) || "-",
              };
            })
            .catch(() => ({ status: false, uptime: "⚠️", balances: [] as number[], totalBids: "?", totalFills: "?", lastBid: "?", lastFill: "?" }))
        )
      ),
    {
      enabled: !!dapp,
      refetchInterval: 60_000,
    }
  ).data;
}

function useTakerXStatus(dapp?: Dapp) {
  return useQuery(
    ["useTakerXStatus", dapp?.config.partner],
    async () => {
      const backupAwsStatusResponse = await fetch(`https://uvk35bjjqk.execute-api.us-east-2.amazonaws.com/status`).then((r) => r.json());
      const backupAwsStatusChain = _.find(backupAwsStatusResponse, (s) => s.config?.chainId === dapp?.config.chainId);
      return {
        status: BN(backupAwsStatusChain.balance).gt(0.1),
        balance: backupAwsStatusChain.balance,
        totalBids: backupAwsStatusChain.totalBids || "0",
        totalFills: backupAwsStatusChain.totalFills || "0",
        lastBid: backupAwsStatusChain.lastBid || "-",
        lastFill: backupAwsStatusChain.lastFill || "-",
      };
    },
    { enabled: !!dapp, refetchInterval: 60_000 }
  ).data;
}

const Image = ({ logo }: { logo?: string }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [logo]);

  return <img src={logo} onLoad={() => setLoaded(true)} width={10} height={10} style={{ marginRight: 2, opacity: !loaded ? 0 : 1 }} />;
};

export function Status() {
  const { selectedDapp: dapp } = useSelectedDapp();
  const config = useConfigAndNetwork(dapp);
  const status = useBackupTakersStatus(dapp);
  const takerx = useTakerXStatus(dapp);

  const logo = config?.info.logoUrl;
  return (
    <>
      {dapp && (
        <StyledStatus>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP Version:</StyledStatusSectionTitle>
            <StyledStatusSectionText>{config?.twapVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP-UI Version:</StyledStatusSectionTitle>
            <StyledStatusSectionText>{config?.twapUiVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Chain:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <Image logo={logo} /> {config?.info.name} {dapp.config.chainId}
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <a href={config ? `${config.info.explorers[0].url}/address/${dapp.config.twapAddress}` : ""} target={"_blank"}>
                {dapp.config.twapAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Lens:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              <a href={config ? `${config.info.explorers[0].url}/address/${dapp.config.lensAddress}` : ""} target={"_blank"}>
                {dapp.config.lensAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>Exchange:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              {dapp.config.exchangeType}{" "}
              <a href={config ? `${config.info.explorers[0].url}/address/${dapp.config.exchangeAddress}` : ""} target={"_blank"}>
                {dapp.config.exchangeAddress}
              </a>
            </StyledStatusSectionText>
          </StyledStatusSection>
          {_.map([1, 2], (i, k) => (
            <StyledStatusSection key={i}>
              <StyledStatusSectionTitle>
                {!status ? "" : status[k].status ? "✅" : "⚠️⚠️⚠️"} Backup Taker {i}:
              </StyledStatusSectionTitle>
              <StyledStatusSectionText>uptime: {status?.[k].uptime}</StyledStatusSectionText>
              <StyledStatusSectionText>gas: {status?.[k].balances.join(" ")}</StyledStatusSectionText>
              <StyledStatusSectionText>totalBids: {status?.[k].totalBids}</StyledStatusSectionText>
              <StyledStatusSectionText>totalFills: {status?.[k].totalFills}</StyledStatusSectionText>
              <StyledStatusSectionText>lastBid: {status?.[k].lastBid}</StyledStatusSectionText>
              <StyledStatusSectionText>lastFill: {status?.[k].lastFill}</StyledStatusSectionText>
            </StyledStatusSection>
          ))}
          <StyledStatusSection>
            <StyledStatusSectionTitle>{!takerx ? "" : takerx?.status ? "✅" : "⚠️⚠️⚠️"} Backup Taker X:</StyledStatusSectionTitle>
            <StyledStatusSectionText>gas: {takerx?.balance}</StyledStatusSectionText>
            <StyledStatusSectionText>totalBids: {takerx?.totalBids}</StyledStatusSectionText>
            <StyledStatusSectionText>totalFills: {takerx?.totalFills}</StyledStatusSectionText>
            <StyledStatusSectionText>lastBid: {takerx?.lastBid}</StyledStatusSectionText>
            <StyledStatusSectionText>lastFill: {takerx?.lastFill}</StyledStatusSectionText>
          </StyledStatusSection>
        </StyledStatus>
      )}
    </>
  );
}
