import { expect } from "chai";
import { contract, currentNetwork, hasWeb3Instance, networks } from "@defi.org/web3-candies";
import { getConfig, IntegrationDapp } from "../src/consts";
import { initFixture } from "./fixture";

describe("Sanity", function () {
  beforeEach(initFixture);

  it("network", async () => {
    expect(await currentNetwork()).not.to.be.undefined;
    expect(hasWeb3Instance()).to.be.true;
  });

  it("config - ftm Spiritswap", async () => {
    if ((await currentNetwork())?.id !== networks.ftm.id) return;

    const config = getConfig(networks.ftm.id, IntegrationDapp.Spiritswap);
    expect(config.twapAddress).is.not.empty;
    expect(config.lensAddress).is.not.empty;
    expect(config.exchangeAddress).is.not.empty;
    expect(config.wrappedTokenInfo.symbol).eq("WFTM");
    expect(config.wrappedTokenInfo.decimals).eq(18);

    const lens = contract(require("../src/store/lens-abi.json"), config.lensAddress);
    const twapAddress = await lens.methods.twap().call();
    expect(twapAddress).eq(config.twapAddress);
  });
});
