import "react";
import { expect } from "chai";
import { contract, currentNetwork, erc20s, hasWeb3Instance, networks } from "@defi.org/web3-candies";
import { initFixture } from "./fixture";
import { act, renderHook } from "@testing-library/react";
import { getConfig, IntegrationDapp } from "../src/config";
import { useTwapStore } from "../src/store/store";

describe("Sanity", function () {
  beforeEach(initFixture);

  it("network", async () => {
    expect(await currentNetwork()).not.to.be.undefined;
    expect(hasWeb3Instance()).to.be.true;
  });

  it("config - ftm Spiritswap", async () => {
    if ((await currentNetwork())?.id !== networks.ftm.id) return;

    const config = getConfig(networks.ftm.id);
    expect(config.twapAddress).is.not.empty;
    expect(config.lensAddress).is.not.empty;
    expect(config.exchangeAddress).is.not.empty;
    expect(config.wrappedTokenInfo.symbol).eq("WFTM");
    expect(config.wrappedTokenInfo.decimals).eq(18);
    expect(config.wrappedTokenInfo.address).eq(erc20s.ftm.WFTM().address);

    const lens = contract(require("../src/store/lens-abi.json"), config.lensAddress);
    const twapAddress = await lens.methods.twap().call();
    expect(twapAddress).eq(config.twapAddress);
  });

  it("state", async () => {
    const { result } = renderHook(() => useTwapStore());
    expect(result.current.showConfirmation).false;
    expect(result.current.disclaimerAccepted).false;

    await act(() => result.current.setDisclaimerAccepted(true));
    expect(result.current.disclaimerAccepted).true;

    await act(() => result.current.reset());
    expect(result.current.disclaimerAccepted).false;
  });
});
