import { Button, Menu, MenuItem, styled } from "@mui/material";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { Status } from "@orbs-network/twap";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { useOrderHistoryContext } from "./context";
import { StyledRowFlex, StyledText } from "../../styles";
import { IconButton } from "../base";
import { HiArrowLeft } from "@react-icons/all-files/hi/HiArrowLeft";
import { useTwapContext } from "../../context/context";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { Translations } from "../../types";
import { stateActions } from "../../context/actions";
import { useOrderById } from "../../hooks";

export function OrderHistoryMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { setTab, selectedTab, tabs } = useOrderHistoryContext();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClick = useCallback(
    (key?: Status) => {
      setAnchorEl(null);
      setTab(key);
    },
    [setTab, setTab]
  );

  return (
    <>
      <StyledButton variant="outlined" onClick={handleClick}>
        {selectedTab?.name} Orders <small>{`(${selectedTab?.amount})`}</small> <IoIosArrowDown />
      </StyledButton>
      <StyledMenu className="twap-time-selector-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
        {tabs.map((it) => {
          return (
            <StyledMenuItem key={it.name} onClick={() => onClick(it.key)}>
              {it.name} <small>{` (${it.amount})`}</small>
            </StyledMenuItem>
          );
        })}
      </StyledMenu>
    </>
  );
}

const StyledMenu = styled(Menu)({
  ".MuiBackdrop-root": {
    opacity: "0!important",
  },
});

const StyledButton = styled(Button)({
  display: "flex",
  gap: 5,
  textTransform: "none",
  small: {
    opacity: 0.7,
  },
});

const StyledMenuItem = styled(MenuItem)({
  height: 40,
  display: "flex",
  gap: 5,
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
