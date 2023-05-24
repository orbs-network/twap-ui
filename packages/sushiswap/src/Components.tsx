import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ThenaRawToken } from "./types";
import { Components, Styles as TwapStyles, TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import { StyledBalance, StyledOrderSummary, StyledPanelInput, StyledSubmit, StyledTokenChange, StyledTokenPanel, StyledTokenSelect, StyledUSD } from "./styles";
import { BsArrowDownShort } from "react-icons/bs";
import { IoWalletSharp } from "react-icons/io5";
const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens } = useAdapterContext();

  return (
    <TokenSelectModal
      otherAsset={props.dstTokenSelected}
      selectedAsset={props.srcTokenSelected}
      setSelectedAsset={props.onSelect}
      popup={props.isOpen}
      setPopup={props.onClose}
      baseAssets={dappTokens}
      setOtherAsset={props.onSelect}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: ThenaRawToken) => parseToken(token)}
    />
  );
};

const EmptyValue = ({ prefix = "" }: { prefix?: string }) => {
  return (
    <>
      {prefix}0.<span>00</span>
    </>
  );
};

export const Balance = ({ isSrc }: { isSrc?: boolean }) => {
  const { isDarkTheme } = useAdapterContext();

  return (
    <StyledBalance isDarkMode={isDarkTheme ? 1 : 0}>
      <IoWalletSharp style={{ width: 18, height: 18 }} />
      <Components.TokenBalance emptyUi={<EmptyValue />} isSrc={isSrc} hideLabel={true} />
    </StyledBalance>
  );
};

export const TokenChange = () => {
  const { isDarkTheme } = useAdapterContext();
  return <StyledTokenChange isDarkTheme={isDarkTheme ? 1 : 0} icon={<BsArrowDownShort />} />;
};

export const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const { isDarkTheme } = useAdapterContext();

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel className="twap-token-panel">
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={10}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledPanelInput placeholder="0" isSrc={isSrcToken} />
              <StyledTokenSelect isDarkMode={isDarkTheme ? 1 : 0} hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledUSD isDarkMode={isDarkTheme ? 1 : 0} isSrc={isSrcToken} emptyUi={<EmptyValue prefix="$ " />} />
              <Balance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
      </StyledTokenPanel>
    </>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  const {isDarkTheme} = useAdapterContext();
  return (
    <StyledOrderSummary isDarkTheme={isDarkTheme ? 1 : 0}>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryLimitPrice />
          </Components.Base.Card>
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <StyledSubmit />
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummary>
  );
};
