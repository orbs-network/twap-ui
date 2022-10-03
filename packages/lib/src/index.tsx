import { actions, useInitWeb3, state, useValidation } from "./store/store";

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
import Price from "./components/Price";

export default {
  initializer: useInitWeb3,
  state,
  actions,
  baseComponents: { NumericInput, ActionButton, Card, Icon, Label, SmallLabel, Switch, TimeSelector, TokenLogo, TokenName, Layout, ChangeTokensOrder },
  components: {Price},
  validation: useValidation,
  providers: {
    TWAPPropsProvider,
  },
};
