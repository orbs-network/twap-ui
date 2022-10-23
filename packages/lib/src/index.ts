import { useWeb3, store, validation } from "./store/store";

import NumericInput from "./base-components/NumericInput";
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
import { LimitPrice } from "./components/LimitPrice";
import Tooltip from "./base-components/Tooltip";
import IconButton from "./base-components/IconButton";
import Text from "./base-components/Text";
import NumberDisplay from "./base-components/NumberDisplay";
import { TwapContext, TwapProvider, OrderHistoryProvider, OrderHistoryContext } from "./context";
import { TradeInfoModal, TradeInfoDetails, TradeInfoExplanation } from "./components/TradeInfo";
import PriceToggle from "./base-components/PriceToggle";
import Button from "./base-components/Button";
import Balance from "./base-components/Balance";
import USD from "./base-components/USD";
import LimitOrder from "./base-components/LimitOrder";
export default {
  store,
  baseComponents: {
    NumberDisplay,
    Text,
    IconButton,
    NumericInput,
    Card,
    Icon,
    Label,
    SmallLabel,
    Switch,
    TimeSelector,
    TokenLogo,
    TokenName,
    Layout,
    ChangeTokensOrder,
    Tooltip,
    PriceToggle,
    Button,
    Balance,
    USD,
    LimitOrder,
  },
  components: { LimitPrice, TradeInfoModal, TradeInfoDetails, TradeInfoExplanation },
  validation,
  TwapContext,
  TwapProvider,
  OrderHistoryProvider,
  OrderHistoryContext,
};
