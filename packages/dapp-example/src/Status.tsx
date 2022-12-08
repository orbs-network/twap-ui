import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { networks } from "@defi.org/web3-candies";
import { Dapp } from "./Components";
import moment from "moment";
import BN from "bignumber.js";
import { useSelectedDapp } from "./hooks";
import { StyledStatus, StyledStatusSection, StyledStatusSectionText, StyledStatusSectionTitle } from "./styles";
const useStatus = (dapp?: Dapp) => {
  return useQuery(
    ["useStatus", dapp?.config.partner],
    async () => {
      const twapVersion = require("@orbs-network/twap/package.json").version;
      const twapUiVersion = require("@orbs-network/twap-ui/package.json").version;

      const network = _.find(networks, (n) => n.id === dapp?.config.chainId)!;

      const backupTakersStatus = await Promise.all(
        [1, 2].map((i) =>
          fetch(`https://twap-taker-${network.shortname}-${dapp?.config.partner.toLowerCase()}-${i}.herokuapp.com/health`)
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
      );

      return {
        twapVersion,
        twapUiVersion,
        backupTakersStatus,
      };
    },
    {
      enabled: !!dapp,
      refetchInterval: 60_000,
    }
  );
};

export function Status() {
  const { selectedDapp: dapp } = useSelectedDapp();
  const { data: status } = useStatus(dapp);

  return (
    <>
      {dapp && status && (
        <StyledStatus>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP Version:</StyledStatusSectionTitle>
            <StyledStatusSectionText> {status!.twapVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP-UI Version:</StyledStatusSectionTitle>
            <StyledStatusSectionText>{status!.twapUiVersion}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Chain:</StyledStatusSectionTitle>
            <StyledStatusSectionText> {dapp.config.chainId}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>TWAP:</StyledStatusSectionTitle>
            <StyledStatusSectionText> {dapp.config.twapAddress}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle> Lens:</StyledStatusSectionTitle>
            <StyledStatusSectionText> {dapp.config.lensAddress}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>Exchange:</StyledStatusSectionTitle>
            <StyledStatusSectionText>
              {dapp.config.exchangeType} {dapp.config.exchangeAddress}
            </StyledStatusSectionText>
          </StyledStatusSection>
          {_.map([1, 2], (i, k) => (
            <StyledStatusSection key={i}>
              <StyledStatusSectionTitle>
                {status!.backupTakersStatus[k].status ? "✅" : "⚠️"} Backup Taker {i}:
              </StyledStatusSectionTitle>
              <StyledStatusSectionText>uptime: {status!.backupTakersStatus[k].uptime}</StyledStatusSectionText>
              <StyledStatusSectionText>gas: {status!.backupTakersStatus[k].balances.join(" ")}</StyledStatusSectionText>
              <StyledStatusSectionText>totalBids: {status!.backupTakersStatus[k].totalBids}</StyledStatusSectionText>
              <StyledStatusSectionText>totalFills: {status!.backupTakersStatus[k].totalFills}</StyledStatusSectionText>
              <StyledStatusSectionText>lastBid: {status!.backupTakersStatus[k].lastBid}</StyledStatusSectionText>
              <StyledStatusSectionText>lastFill: {status!.backupTakersStatus[k].lastFill}</StyledStatusSectionText>
            </StyledStatusSection>
          ))}
        </StyledStatus>
      )}
    </>
  );
}
