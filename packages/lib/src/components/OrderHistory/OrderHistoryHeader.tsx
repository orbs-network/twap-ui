import { Box, Button, ClickAwayListener, Fade, Menu, MenuItem, styled } from "@mui/material";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import { Status } from "@orbs-network/twap";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useOrderHistoryContext } from "./context";
import { StyledRowFlex, StyledText } from "../../styles";
import { IconButton } from "../base";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { useTwapContext } from "../../context/context";
import { useOrderById } from "../../hooks";

export function OrderHistoryMenu() {
  const [open, setOpen] = useState(false);
  const { setTab, selectedTab, tabs } = useOrderHistoryContext();
  const onClose = () => {
    setOpen(false);
  };
  const onOpen = () => {
    setOpen(true);
  };

  const onClick = useCallback(
    (key?: Status) => {
      onClose();
      setTab(key);
    },
    [setTab, setTab]
  );

  return (
    <StyledContainer>
      <StyledButton variant="outlined" onClick={onOpen}>
        {selectedTab?.name} Orders <small>{`(${selectedTab?.amount})`}</small> <IoIosArrowDown />
      </StyledButton>

      {open && (
        <ClickAwayListener onClickAway={onClose}>
          <StyledMenu className="twap-order-menu">
            {tabs.map((it) => {
              return (
                <StyledMenuItem className="twap-order-menu-item" key={it.name} onClick={() => onClick(it.key)}>
                  <StyledText>
                    {it.name} <small>{` (${it.amount})`}</small>
                  </StyledText>
                </StyledMenuItem>
              );
            })}
          </StyledMenu>
        </ClickAwayListener>
      )}
    </StyledContainer>
  );
}

const StyledContainer = styled(Box)({
  position: "relative",
  zIndex: 10,
});

const StyledMenu = styled("div")({
  position: "absolute",
});

const StyledButton = styled(Button)({
  display: "flex",
  gap: 5,
  textTransform: "none",
  color: "inherit",

  small: {
    opacity: 0.7,
  },
  ".MuiTouchRipple-root": {
    display: "none",
  },
});

const StyledMenuItem = styled("div")({
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
});

export const OrderHistoryHeader = () => {
  const { closePreview, selectedOrderId, isLoading } = useOrderHistoryContext();
  const order = useOrderById(selectedOrderId);
  const t = useTwapContext().translations;

  return (
    <StyledHeader className="twap-order-modal-header">
      {isLoading ? null : !order ? (
        <OrderHistoryMenu />
      ) : (
        <StyledOrderDetails>
          <StyledBack onClick={closePreview}>
            <HiArrowLeft />
          </StyledBack>
          <StyledTitle className="twap-order-modal-header-title">
            #{order?.id} {order?.isMarketOrder ? t.twapMarket : t.limitOrder}
          </StyledTitle>
        </StyledOrderDetails>
      )}
    </StyledHeader>
  );
};

const StyledClose = styled(IconButton)({
  position: "absolute",
  right: -10,
  top: -10,
});

const StyledOrderDetails = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  gap: 5,
});

const StyledTitle = styled(StyledText)({
  fontSize: 14,
  span: {
    opacity: 0.7,
    fontSize: 13,
  },
});

const StyledHeader = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  height: 40,
});
const StyledBack = styled(IconButton)({
  svg: {
    width: 18,
    height: 18,
  },
});
