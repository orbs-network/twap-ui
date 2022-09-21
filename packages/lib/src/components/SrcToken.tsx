import TokenInput from "../base-components/TokenInput";
import { useActionHandlers, useSrcToken } from "../store/store";

function SrcToken() {
  const { address, uiAmount } = useSrcToken();
  const { onSrcTokenChange } = useActionHandlers();

  const onChange = (value: string) => {
    onSrcTokenChange(value);
  };

  return <TokenInput onChange={onChange} address={address || ""} amount={uiAmount} />;
}

export default SrcToken;
