import { Message, Portal } from "../../components/base";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useWidgetContext } from "../widget-context";

export const LimitPriceWarning = ({ className = "" }: { className?: string }) => {
  const { translations: t, twap } = useWidgetContext();
  const isMarketOrder = twap.values.isMarketOrder;
  const hide = useShouldWrapOrUnwrapOnly();

  if (isMarketOrder || hide) return null;

  return (
    <Message
      className={`${className} twap-limit-price-message`}
      variant="warning"
      title={
        <>
          {t.limitPriceMessage}{" "}
          <a href="https://www.orbs.com/dtwap-and-dlimit-faq/" target="_blank">
            {t.learnMore}
          </a>
        </>
      }
    />
  );
};

export const LimitPriceWarningPortal = () => {
  return <div id="twap-limit-price-message"></div>;
};

export const LimitPriceWarningWithPortal = () => {
  return (
    <Portal containerId="twap-limit-price-message">
      <LimitPriceWarning />
    </Portal>
  );
};
