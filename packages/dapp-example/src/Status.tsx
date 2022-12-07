import { TWAPLib } from "@orbs-network/twap";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { networks, web3 } from "@defi.org/web3-candies";
import { useWeb3React } from "@web3-react/core";
import { Dapp } from "./Components";
import moment from "moment";
import BN from "bignumber.js";
import { useSelectedDapp } from "./hooks";
import { StyledStatus, StyledStatusSection, StyledStatusSectionText, StyledStatusSectionTitle } from "./styles";
import { useState } from "react";
const useStatus = (dapp: Dapp) => {
  const { library: provider, account } = useWeb3React(); // TODO replace with useLib from twap-ui store
  return useQuery(
    ["useStatus", dapp.config.partner, account],
    async () => {
      const twapVersion = require("@orbs-network/twap/package.json").version;
      const twapUiVersion = require("@orbs-network/twap-ui/package.json").version;

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
      enabled: !!provider && !!account && !!dapp,
      refetchInterval: 60_000,
    }
  );
};

export function Status() {
  const { selectedDapp } = useSelectedDapp();
  const dapp = selectedDapp!;
  const { data: status } = useStatus(dapp);

  return (
    <>
      {status && (
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
              {dapp.config.exchangeAddress} {dapp.config.exchangeType}
            </StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>Backup Taker 1:</StyledStatusSectionTitle>
            <StyledStatusSectionText>uptime: {status!.backupTaker1Uptime}</StyledStatusSectionText>
            <StyledStatusSectionText>gas: {status!.backupTaker1Balances.join(", ")}</StyledStatusSectionText>
          </StyledStatusSection>
          <StyledStatusSection>
            <StyledStatusSectionTitle>Backup Taker 2:</StyledStatusSectionTitle>
            <StyledStatusSectionText>uptime: {status!.backupTaker2Uptime}</StyledStatusSectionText>
            <StyledStatusSectionText> gas: {status!.backupTaker2Balances.join(", ")}</StyledStatusSectionText>
          </StyledStatusSection>
        </StyledStatus>
      )}
    </>
  );
}
