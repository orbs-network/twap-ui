import { Message } from "../../components/base";
import { useTwapContext } from "../../context";
import { useLimitPriceMessage } from "../../hooks/ui-hooks";

const Content = ({ className = "" }: { className?: string }) => {
  const { translations: t } = useTwapContext();

  const message = useLimitPriceMessage();
  if (!message) return null;

  return (
    <Message
      className={`twap-limit-price-message ${className}`}
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

export const LimitPriceMessage = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => {
  const message = useLimitPriceMessage();

  if (!message) return null;

  return <>{children ? children : <Content className={className} />}</>;
};

LimitPriceMessage.Content = Content;
