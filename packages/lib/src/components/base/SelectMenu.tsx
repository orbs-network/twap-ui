import { styled } from "styled-components";
import { FC, useCallback, useMemo, useState } from "react";
// import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { ClickAwayListener } from "./ClickAwayListener";
import { SelectMeuItem } from "../../types";

interface Props {
  selected: string | number;
  onSelect: (item: SelectMeuItem) => void;
  className?: string;
  items: SelectMeuItem[];
  ItemContent?: FC<{ item: SelectMeuItem }>;
  SelectedContent?: FC<{ item?: SelectMeuItem }>;
}

export const SelectMenu = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);

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

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Container className="twap-select-menu">
        <StyledSelected onClick={() => setOpen(!open)} className={`${props.className} twap-select-menu-button`}>
          {props.SelectedContent ? (
            <props.SelectedContent item={selected} />
          ) : (
            <>
              <p> {selected?.text}</p>
              {/* <IoIosArrowDown /> */}
            </>
          )}
        </StyledSelected>
        {open && (
          <Menu className="twap-select-menu-list">
            {props.items.map((item) => (
              <StyledMenuItem className="twap-select-menu-list-item" key={item.value} onClick={() => onSelect(item)}>
                {props.ItemContent ? <props.ItemContent item={item} /> : <p>{item.text}</p>}
              </StyledMenuItem>
            ))}
          </Menu>
        )}
      </Container>
    </ClickAwayListener>
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
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
