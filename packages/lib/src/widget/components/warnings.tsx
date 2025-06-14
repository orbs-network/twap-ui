import { Link, Message, Portal } from "../../components/base";
import { useTwapContext } from "../../context";
import { useTwapStore } from "../../useTwapStore";
const URL = "https://www.orbs.com/dtwap-and-dlimit-faq/";
const LimitPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();

  return (
    <Message
      className={`twap-limit-price-warning ${className}`}
      variant="warning"
      text={
        <>
          {t.limitPriceMessage} <Link href={URL}>{t.learnMore}</Link>
        </>
      }
    />
  );
};

export const MarketPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();

  return (
    <Message
      className={`twap-market-price-warning ${className}`}
      text={
        <>
          {`${t.marketOrderWarning} `}
          <Link href={URL}>{`${t.learnMore}`}</Link>
        </>
      }
      variant="warning"
    />
  );
};

export const WarningMessagePortal = () => {
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  return <Portal containerId="twap-warning-message-container">{isMarketOrder ? <MarketPriceWarning /> : <LimitPriceWarning />}</Portal>;
};

export const WarningMessage = () => {
  return <div id="twap-warning-message-container" />;
};
