import NumericInput from "./components/NumericInput";
import Card from "./components/Card";
import Icon from "./components/Icon";
import Label from "./components/Label";
import SmallLabel from "./components/SmallLabel";
import Switch from "./components/Switch";
import TimeSelector from "./components/TimeSelector";
import TokenLogo from "./components/TokenLogo";
import TokenName from "./components/TokenName";
import Layout from "./components/Layout";
import ChangeTokensOrder from "./components/ChangeTokensOrder";
import { LimitPrice } from "./components/LimitPrice";
import Tooltip from "./components/Tooltip";
import IconButton from "./components/IconButton";
import Text from "./components/Text";
import NumberDisplay from "./components/NumberDisplay";
import PoweredBy from "./components/PoweredBy";
import { TwapContext, TwapProvider } from "./context";
import {
  ConfirmationExpiration,
  ConfirmationMinimumReceived,
  ConfirmationOrderType,
  ConfirmationTotalTrades,
  ConfirmationTradeInterval,
  ConfirmationTradeSize,
  TradeInfoExplanation,
  TradeInfoModal,
} from "./components/TradeInfo";
import PriceToggle from "./components/PriceToggle";
import Button from "./components/Button";
import Balance from "./components/Balance";
import USD from "./components/USD";
import Orders from "./orders/Orders";
import TokenPriceCompare from "./components/TokenPriceCompare";
import OdnpButton from "./components/OdnpButton";
import Loader from "./components/Loader";
import Slider from "./components/Slider";
export * as hooks from "./hooks";

export const Components = {
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
  TokenPriceCompare,
  OdnpButton,
  Loader,
  Slider,
  PoweredBy,
  LimitPrice,
  TradeInfoModal,
  ConfirmationExpiration,
  ConfirmationOrderType,
  ConfirmationTradeSize,
  ConfirmationTotalTrades,
  ConfirmationTradeInterval,
  ConfirmationMinimumReceived,
  TradeInfoExplanation,
};
export { TwapContext, TwapProvider, Orders };
