import { useState } from "react";
import { ORBS_LOGO, ORBS_LOGO_FALLBACK, ORBS_WEBSITE_URL } from "../../consts";
import { Portal } from "../../components/base";
import { useTwapContext } from "../../context";

export function PoweredbyOrbsPortal() {
  const [url, setUrl] = useState(ORBS_LOGO);
  const translations = useTwapContext().translations;

  const onError = () => {
    setUrl(ORBS_LOGO_FALLBACK);
  };

  return (
    <Portal containerId="twap-powered-by">
      <a href={ORBS_WEBSITE_URL} target="_blank" className="twap-powered-by-content">
        <span>{translations.poweredBy}</span>
        <img src={url} onError={onError} />
      </a>
    </Portal>
  );
}

export const PoweredByOrbs = () => {
  return <span id="twap-powered-by" />;
};
