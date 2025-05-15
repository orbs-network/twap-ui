import { useState } from "react";
import { ORBS_LOGO, ORBS_LOGO_FALLBACK } from "../../consts";
import { Portal } from "../../components/base";
import { useTwapContext } from "../../context";

export function PoweredbyOrbsPortal() {
  const [url, setUrl] = useState(ORBS_LOGO);
  const translations = useTwapContext().translations;

  const onError = () => {
    setUrl(ORBS_LOGO_FALLBACK);
  };

  return (
    <Portal containerId="twap-powered-by-container">
      <a href="https://www.orbs.com/" target="_blank" className="twap-powered-by">
        <p>{translations.poweredBy}</p>
        <img src={url} onError={onError} />
      </a>
    </Portal>
  );
}

export const PoweredByOrbs = () => {
  return <div id="twap-powered-by-container" />;
};
