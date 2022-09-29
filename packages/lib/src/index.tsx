import { useActionHandlers, useInitWeb3, useTWAPState, useValidation } from "./store/store";

import TWAPPropsProvider from "./providers/TWAPPropsProvider";
import NumericInput from "./base-components/NumericInput";
import ActionButton from "./base-components/ActionButton";
import Card from "./base-components/Card";
import Icon from "./base-components/Icon";
import Label from "./base-components/Label";
import SmallLabel from "./base-components/SmallLabel";
import Switch from "./base-components/Switch";
import TimeSelector from "./base-components/TimeSelector";
import TokenLogo from "./base-components/TokenLogo";
import TokenName from "./base-components/TokenName";
import Layout from "./base-components/Layout";
import ChangeTokensOrder from "./base-components/ChangeTokensOrder";
import PriceInput from "./base-components/PriceInput";

export default {
  initializer: useInitWeb3,
  state: useTWAPState,
  actions: useActionHandlers,
  components: { NumericInput, ActionButton, Card, Icon, Label, SmallLabel, Switch, TimeSelector, TokenLogo, TokenName, Layout, ChangeTokensOrder, PriceInput },
  validation: useValidation,
  providers: {
    TWAPPropsProvider,
  },
};
