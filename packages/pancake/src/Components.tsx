import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ThenaRawToken } from "./types";
import { Components, Styles as TwapStyles, TWAPTokenSelectProps, hooks } from "@orbs-network/twap-ui";
import {
  StyledBalance,
  StyledContainer,
  StyledContainerContent,
  StyledEmptyUSD,
  StyledPercentSelect,
  StyledSelectAndBalance,
  StyledTokenChange,
  StyledTokenChangeContainer,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenPanelInputContainer,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { MdArrowDropDown } from "react-icons/md";
import { AiOutlineArrowDown } from "react-icons/ai";
import { HiMiniArrowsUpDown } from "react-icons/hi2";

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

export const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={8}>
          <StyledSelectAndBalance>
            <StyledTokenSelect CustomArrow={MdArrowDropDown} hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            <StyledBalance decimalScale={8} isSrc={isSrcToken} />
          </StyledSelectAndBalance>
          <StyledTokenPanelInputContainer>
            <StyledTokenPanelInput placeholder="0.00" isSrc={isSrcToken} />
            <StyledUSD symbol="USD" isSrc={isSrcToken} emptyUi={<StyledEmptyUSD />} />
            {isSrcToken && <SrcTokenPercentSelector />}
          </StyledTokenPanelInputContainer>
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

export const Container = ({
  label,
  children,
  enabled,
  hideChildren,
  className = "",
}: {
  label: ReactNode;
  children: ReactNode;
  enabled?: number;
  hideChildren?: boolean;
  className?: string;
}) => {
  return (
    <StyledContainer className={className}>
      {label}
      {!hideChildren && <StyledContainerContent enabled={enabled}>{children}</StyledContainerContent>}
    </StyledContainer>
  );
};

export const CurrentMarketPrice = () => {
  return (
    <StyledContainer>
      <Components.Labels.CurrentMarketPriceLabel />
      <StyledContainerContent>
        <Components.MarketPrice hideLabel={true} />
      </StyledContainerContent>
    </StyledContainer>
  );
};

export const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(0.75)}>75%</button>
      <button onClick={() => onClick(1)}>MAX</button>
    </StyledPercentSelect>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer>
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
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.OrderSummaryModalContainer>
  );
};

export const ChangeTokensOrder = () => {
  const [hover, setHover] = useState(false);
  return (
    <StyledTokenChangeContainer onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <StyledTokenChange icon={hover ? <HiMiniArrowsUpDown /> : <AiOutlineArrowDown />} />
    </StyledTokenChangeContainer>
  );
};
