import TokenInput from "../base-components/TokenInput";
import { useSrcToken } from "../store/store";

function SrcToken() {
  const { address, amount, setAmountUi } = useSrcToken();

  const onChange = (value: string) => {
    setAmountUi(value);
  };

  console.log({ tokenAddress: address });

  return <TokenInput onChange={onChange} address={address || ""} amount={amount!} />;
}

export default SrcToken;
