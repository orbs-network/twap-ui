import "react";
import { expect } from "chai";
import { hasWeb3Instance, network } from "@defi.org/web3-candies";
import { CHAIN_ID, initFixture } from "./fixture";

describe("Sanity", function () {
  beforeEach(() => initFixture());

  it("network", async () => {
    expect(network(CHAIN_ID)).not.to.be.undefined;
    expect(hasWeb3Instance()).to.be.true;
  });
});
