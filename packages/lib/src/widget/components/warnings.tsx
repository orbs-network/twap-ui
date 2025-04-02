import { Link, Message } from "../../components/base";
import { useTwapContext } from "../../context";
const URL = "https://www.orbs.com/dtwap-and-dlimit-faq/";
const LimitPriceWarning = ({ className }: { className?: string }) => {
  const { translations: t } = useTwapContext();

  return (
    <Message
      className={`twap-limit-price-message ${className}`}
      variant="warning"
      title={
        <>
          {t.limitPriceMessage} <Link href={URL}>{t.learnMore}</Link>
        </>
      }
    />
  );
};

export const MarketPriceWarning = ({ className }: { className?: string }) => {
  const { translations: t } = useTwapContext();

  return (
    <Message
      className={`twap-market-price-warning ${className}`}
      title={
        <>
          {`${t.marketOrderWarning} `}
          <Link href={URL}>{`${t.learnMore}`}</Link>
        </>
      }
      variant="warning"
    />
  );
};

export const WarningMessage = ({ className }: { className?: string }) => {
  const {
    state: { isMarketOrder },
  } = useTwapContext();

  if (isMarketOrder) return <MarketPriceWarning className={className} />;

  return <LimitPriceWarning className={className} />;
};
