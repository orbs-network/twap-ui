import TWAPLib from "@orbs-network/twap-ui";

function DstToken() {
  const { address, uiAmount } = TWAPLib.actions.useDstToken();

  return <TWAPLib.components.TokenInput disabled={true} address={address} amount={uiAmount} />;
}

export default DstToken;
