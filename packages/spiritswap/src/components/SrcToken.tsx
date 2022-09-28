import TWAPLib from "@orbs-network/twap-ui";

function SrcToken() {
  const { onSrcTokenChange } = TWAPLib.actions();

  const { srcTokenAddress, srcTokenAmount } = TWAPLib.state();

  const onChange = (value: string) => {
    onSrcTokenChange(value);
  };

  return <TWAPLib.components.TokenInput onChange={onChange} address={srcTokenAddress || ""} amount={srcTokenAmount} />;
}

export default SrcToken;
