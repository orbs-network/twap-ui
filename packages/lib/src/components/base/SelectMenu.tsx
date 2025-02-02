import { styled } from "styled-components";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { ClickAwayListener } from "./ClickAwayListener";
import { SelectMeuItem } from "../../types";
import { StyledText } from "../../styles";
import { useWidgetContext } from "../..";

interface Props {
  selected: string | number;
  onSelect: (item: SelectMeuItem) => void;
  className?: string;
  items: SelectMeuItem[];
  onOpen?: () => void;
  onClose?: () => void;
}

export const SelectMenu = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const icon = useWidgetContext().uiPreferences.menu?.icon;

  const selected = useMemo(() => {
    return props.items.find((it) => it.value === props.selected);
  }, [props.items, props.selected]);

  const onSelect = useCallback(
    (item: SelectMeuItem) => {
      setOpen(false);
      props.onSelect(item);
    },
    [props.onSelect]
  );

  useEffect(() => {
    if (open) {
      props.onOpen && props.onOpen();
    } else {
      props.onClose && props.onClose();
    }
  }, [open, props.onOpen, props.onClose]);

  return (
    <div className="twap-select">
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Container className="twap-select-menu">
          <StyledSelected onClick={() => setOpen(!open)} className={`${props.className || ""} twap-select-menu-button`}>
            <StyledText> {selected?.text}</StyledText>
            {icon || <IoIosArrowDown />}
          </StyledSelected>
          {open && (
            <Menu className="twap-select-menu-list">
              {props.items.map((item) => (
                <StyledMenuItem className="twap-select-menu-list-item" key={item.value} onClick={() => onSelect(item)}>
                  <StyledText>{item.text}</StyledText>
                </StyledMenuItem>
              ))}
            </Menu>
          )}
        </Container>
      </ClickAwayListener>
    </div>
  );
};

const Container = styled.div`
  position: relative;
`;

const StyledSelected = styled("button")({
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "0px",
  fontSize: 14,
  textTransform: "none",
  color: "inherit",
  cursor: "pointer",
  svg: {
    width: 14,
    height: 14,
  },
});

const Menu = styled.div`
  position: absolute;
  z-index: 1000;
  margin-top: 5px;
  top: 100%;
  overflow: hidden;
  min-width: 100%;
`;

const StyledMenuItem = styled.div`
  padding: 7px 15px 7px 10px;
  cursor: pointer;
  p {
    margin: 0;
  }
`;
