import TWAPLib from "@orbs-network/twap-ui";

function DstToken() {
  const { dstTokenAddress, dstTokenAmount } = TWAPLib.state();

  return <TWAPLib.components.TokenInput disabled={true} address={dstTokenAddress} amount={dstTokenAmount} />;
}

export default DstToken;
