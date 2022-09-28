import { useActionHandlers, useInitWeb3, useTWAPState, useValidation } from "./store/store";
import TokenInput from "./base-components/TokenInput";
import TimeSelect from "./base-components/TimeSelect";
import AmountInput from "./base-components/AmountInput";
import CustomSwitch from "./base-components/CustomSwitch";
import InfoIconTooltip from "./base-components/InfoIconTooltip";
import TokenDisplay from "./base-components/TokenDisplay";
import CustomButton from "./base-components/CustomButton";
import TWAPPropsProvider from "./providers/TWAPPropsProvider";

export default {
  initializer: useInitWeb3,
  state: useTWAPState,
  actions: useActionHandlers,
  components: { TokenInput, TimeSelect, InfoIconTooltip, AmountInput, CustomSwitch, TokenDisplay, CustomButton },
  validation: useValidation,
  providers: {
    TWAPPropsProvider,
  },
};
