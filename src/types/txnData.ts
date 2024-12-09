export interface TxnData {
  tokenSent: string;
  amountSent: number;
  tokenReceived: string;
  amountReceived: number;
  token: string;
  version: string;
  receiver: string;
}

export type ReceiversData = { [key: string]: TxnData };
