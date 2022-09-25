import {
  useActionHandlers,
  useSrcToken,
  useDstToken,
  useMaxDuration,
  useSubmitButtonValidation,
  useWeb3Provider,
  changeTokenPositions,
  useTradeInterval,
  useTradeSize,
} from "./store/store";
import TokenInput from "./base-components/TokenInput";
import TimeSelect from "./base-components/TimeSelect";
import AmountInput from "./base-components/AmountInput";
import CustomSwitch from "./base-components/CustomSwitch";
import InfoIconTooltip from "./base-components/InfoIconTooltip";
import TokenDisplay from "./base-components/TokenDisplay";
import CustomButton from "./base-components/CustomButton";

export default {
  data: {},
  actions: { useWeb3Provider, useSrcToken, useDstToken, useActionHandlers, useMaxDuration, useSubmitButtonValidation, changeTokenPositions, useTradeInterval, useTradeSize },
  components: { TokenInput, TimeSelect, InfoIconTooltip, AmountInput, CustomSwitch, TokenDisplay, CustomButton },
};
