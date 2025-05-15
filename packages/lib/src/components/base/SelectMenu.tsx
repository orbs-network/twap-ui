import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { ClickAwayListener } from "./ClickAwayListener";
import { SelectMeuItem } from "../../types";
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
        <div className="twap-select-menu">
          <div onClick={() => setOpen(!open)} className={`${props.className || ""} twap-select-menu-button`}>
            <p> {selected?.text}</p>
            <IoIosArrowDown />
          </div>
          {open && (
            <div className="twap-select-menu-list">
              {props.items.map((item) => (
                <div className="twap-select-menu-list-item" key={item.value} onClick={() => onSelect(item)}>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ClickAwayListener>
    </div>
  );
};
