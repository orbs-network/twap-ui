import { styled } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { VariableSizeList as List } from "react-window";
import { useOrdersHistory } from "../../hooks/query";
import { StyledColumnFlex } from "../../styles";
import AutoSizer from "react-virtualized-auto-sizer";
import { ParsedOrder } from "../../types";
import { OrderPreview } from "./OrderPreview";
import { SingleOrder } from "./Order";

export function OrderHistoryList() {
  const { data: orders } = useOrdersHistory();
  const [selected, setSelected] = useState<ParsedOrder | undefined>(undefined);

  const onSelect = useCallback(
    (o: ParsedOrder | undefined) => {
      setSelected(o);
    },
    [setSelected]
  );

  const sizeMap = React.useRef({} as any);
  const listRef = React.useRef<any>();
  const setSize = React.useCallback((index: number, size: number) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current.resetAfterIndex(0);
  }, []);
  const getSize = React.useCallback((index: number): number => {
    return sizeMap.current[index] || 50;
  }, []);

  return (
    <Container>
      {selected && <OrderPreview order={selected} />}
      <StyledList style={{ opacity: selected ? 0 : 1 }}>
        <AutoSizer>
          {({ height, width }: any) => (
            <List ref={listRef} height={height} itemCount={orders?.Completed?.length || 0} itemSize={getSize} width={width} itemData={{ orders: orders?.Completed, setSize }}>
              {({ index, style }) => (
                <div style={style}>
                  <SingleOrder onSelect={onSelect} setSize={setSize} index={index} order={orders?.Completed?.[index]} />
                </div>
              )}
            </List>
          )}
        </AutoSizer>
      </StyledList>
    </Container>
  );
}

const StyledList = styled(StyledColumnFlex)({
  height: 400,
});

const Container = styled(StyledColumnFlex)({
  position: "relative",
});
