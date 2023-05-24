import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ThenaRawToken } from "./types";
import { Components, Styles as TwapStyles, TWAPTokenSelectProps, store } from "@orbs-network/twap-ui";
import {
  StyledBalance,
  StyledBalanceAndUSD,
  StyledOrderSummary,
  StyledPanelInput,
  StyledPanelRight,
  StyledSubmit,
  StyledTokenChange,
  StyledTokenPanel,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { TbArrowsDownUp } from "react-icons/tb";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Typography } from "@mui/material";
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

export const TokenChange = () => {
  const { isDarkTheme } = useAdapterContext();
  return <StyledTokenChange isDarkTheme={isDarkTheme ? 1 : 0} icon={<TbArrowsDownUp />} />;
};

const TokenSelectButton = ({ isSrc, onClick }: { isSrc?: boolean; onClick: () => void }) => {
  const { srcToken, dstToken } = store.useTwapStore();

  const notSelected = (isSrc && !srcToken) || (!isSrc && !dstToken);
  return (
    <StyledTokenSelect onClick={onClick}>
      <Components.TokenLogo isSrc={isSrc} />
      <TwapStyles.StyledColumnFlex style={{ flex: 1 }} alignItems="flex-start" gap={1}>
        <Typography className="twap-token-select-title">Swap {isSrc ? "From" : "To"}</Typography>

        <TwapStyles.StyledRowFlex gap={5} justifyContent="flex-start">
          {notSelected ? <Typography className="twap-token-select-text">Select</Typography> : <Components.TokenSymbol isSrc={isSrc} />}
          <MdOutlineKeyboardArrowDown className="twap-token-select-icon" />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledColumnFlex>
    </StyledTokenSelect>
  );
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
        <TwapStyles.StyledColumnFlex gap={14}>
          <TwapStyles.StyledRowFlex justifyContent="space-between" gap={20}>
            <TokenSelectButton isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            <StyledPanelRight isSrcToken={isSrcToken ? 1 : 0}>
              <StyledPanelInput placeholder="0" isSrc={isSrcToken} />
              <StyledBalanceAndUSD>
                <StyledBalance emptyUi={<div>0.00</div>} isDarkMode={isDarkTheme ? 1 : 0} isSrc={isSrcToken} />
                <StyledUSD isDarkMode={isDarkTheme ? 1 : 0} isSrc={isSrcToken} />
              </StyledBalanceAndUSD>
            </StyledPanelRight>
          </TwapStyles.StyledRowFlex>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  const { isDarkTheme } = useAdapterContext();
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
