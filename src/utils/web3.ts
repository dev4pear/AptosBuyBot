import { aptos } from "@/aptosWeb3";
export function isValidEthAddress(address: string) {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
}
export function getTokenAddress(coinStore: string) {
  const match = coinStore.match(/CoinStore<([^>]+)>/);
  const innerText = match ? match[1] : "";

  return innerText;
}

export async function getTokenMetadata(token: string) {
  try {
    const [creatorAddress] = token.split("::");
    const resourceType: `${string}::${string}::${string}` = `0x1::coin::CoinInfo<${token}>`;
    const resource = await aptos.getAccountResource({
      accountAddress: creatorAddress,
      resourceType,
    });

    const { decimals, symbol } = resource;

    return { decimals, symbol };
  } catch (error) {
    // log(`Error in getting metadata for ${token}`);
    // errorHandler(error);
    return false;
  }
}
