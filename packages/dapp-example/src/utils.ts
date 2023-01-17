export const showTokenInList = (symbol: string, filter: string) => {
  if (!filter) return true;

  return symbol.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
};
