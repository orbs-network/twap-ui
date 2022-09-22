import TokenInput from "@orbs-network/twap-ui/dist/base-components/TokenInput";
import { useActionHandlers, useSrcToken } from "@orbs-network/twap-ui";

function SrcToken() {
  const { address, uiAmount } = useSrcToken();
  const { onSrcTokenChange } = useActionHandlers();

  const onChange = (value: string) => {
    onSrcTokenChange(value);
  };

  return <TokenInput onChange={onChange} address={address || ""} amount={uiAmount} />;
}

export default SrcToken;
