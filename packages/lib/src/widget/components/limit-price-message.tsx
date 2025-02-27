import { Message } from "../../components/base";
import { useTwapContext } from "../../context";
import { useLimitPriceMessage } from "../../hooks/ui-hooks";

export const LimitPriceMessage = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();
  const message = useLimitPriceMessage();

  if (!message) return null;

  return (
    <Message
      className={`${className} twap-limit-price-message`}
      variant="warning"
      title={
        <>
          {message.text}{" "}
          <a href={message.url} target="_blank">
            {t.learnMore}
          </a>
        </>
      }
    />
  );
};
