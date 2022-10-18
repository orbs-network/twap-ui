export type TransactionDataType = {
  fromTokenId: string;
  toTokenId: string;
  operationType: string;
  fromTokenAmount: number;
  toTokenAmount: number;
  currencyPrice: number;
  executionPrice: number;
  minimumReceived: number;
  expiryDate: number;
  status: TxStatus;
  totalChunks: number;
  finishedChunks: number;
  lastFilled: number;
  interval: number;
};

export enum TxStatus {
  OPEN,
  CANCELED,
  EXECUTED,
  EXPIRED,
}

const mod = function (n: number, m: number) {
  const remain = n % m;
  return Math.floor(remain >= 0 ? remain : remain + m);
};

const status = [TxStatus.OPEN, TxStatus.CANCELED, TxStatus.EXECUTED, TxStatus.EXPIRED];

export const createTxData = (): TransactionDataType[] => {
  return Array.from({ length: 10 }).map((_, i) => {
    return {
      fromTokenId: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      toTokenId: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      operationType: "sell",
      fromTokenAmount: 10,
      toTokenAmount: 0.005,
      currencyPrice: 2000,
      executionPrice: 1990,
      minimumReceived: 500,
      expiryDate: new Date().getTime() - 1000,
      status: status[mod(i, status.length)],
      totalChunks: 10,
      finishedChunks: 2,
      lastFilled: 10,
      interval: 20,
    };
  });
};

export const getData = (): { [key: string]: TransactionDataType[] } => {
  const data = createTxData();

  const obj: { [key: string]: TransactionDataType[] } = {
    [TxStatus.OPEN]: [],
    [TxStatus.CANCELED]: [],
    [TxStatus.EXPIRED]: [],
    [TxStatus.EXECUTED]: [],
  };
  for (const element of data) {
    const statuses = obj[element.status];
    if (statuses) {
      obj[element.status] = [...statuses, element];
    }
  }
  return obj;
};

export const ordersData = getData();
