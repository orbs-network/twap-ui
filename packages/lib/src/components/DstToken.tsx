import TokenInput from "../base-components/TokenInput";
import { useDstToken } from "../store/store";

function DstToken() {
  const { address, amount, setAmountUi } = useDstToken();

  const onChange = (value: string) => {
    setAmountUi(value);
  };

  return <TokenInput onChange={onChange} address={address} amount={amount} />;
}

export default DstToken;
