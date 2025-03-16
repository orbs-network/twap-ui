import { styled } from "styled-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { ClickAwayListener } from "./ClickAwayListener";
import { SelectMeuItem } from "../../types";
import { StyledText } from "../../styles";
import { useTwapContext } from "../../context";

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
  const { components } = useTwapContext();

  const selected = useMemo(() => {
    return props.items.find((it) => it.value === props.selected);
  }, [props.items, props.selected]);

  const onSelect = useCallback(
    (item: SelectMeuItem) => {
      setOpen(false);
      props.onSelect(item);
    },
    [props.onSelect],
  );

  useEffect(() => {
    if (open) {
      props.onOpen && props.onOpen();
    } else {
      props.onClose && props.onClose();
    }
  }, [open, props.onOpen, props.onClose]);

  if (components.SelectMenu) {
    return <components.SelectMenu selected={selected} onSelect={props.onSelect} items={props.items} />;
  }

  return (
    <div className="twap-select">
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Container className="twap-select-menu">
          <StyledSelected onClick={() => setOpen(!open)} className={`${props.className || ""} twap-select-menu-button`}>
            <StyledText> {selected?.text}</StyledText>
            <IoIosArrowDown />
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
  textTransform: "capitalize",
  color: "inherit",
  cursor: "pointer",
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
  cursor: pointer;
  text-transform: capitalize;
  p {
    margin: 0;
  }
`;
