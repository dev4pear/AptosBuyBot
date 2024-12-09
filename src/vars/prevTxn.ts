export const prevTxns: string[] = [];
export function setPrevTxn(newTxn: string) {
  if (prevTxns.length >= 5) {
    prevTxns.shift();
  }
  prevTxns.push(newTxn);
}
