import TWAPLib from "@orbs-network/twap-ui";

function SrcToken() {
  const { address, uiAmount } = TWAPLib.actions.useSrcToken();
  const { onSrcTokenChange } = TWAPLib.actions.useActionHandlers();

  const onChange = (value: string) => {
    onSrcTokenChange(value);
  };

  return <TWAPLib.components.TokenInput onChange={onChange} address={address || ""} amount={uiAmount} />;
}

export default SrcToken;
