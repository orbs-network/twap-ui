import "react";
import { expect } from "chai";
import { currentNetwork, hasWeb3Instance } from "@defi.org/web3-candies";
import { initFixture } from "./fixture";

describe("Sanity", function () {
  beforeEach(() => initFixture());

  it("network", async () => {
    expect(await currentNetwork()).not.to.be.undefined;
    expect(hasWeb3Instance()).to.be.true;
  });
});
