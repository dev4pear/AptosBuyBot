import { apiFetcher } from "@/utils/api";
import { PRICE_API } from "@/utils/constants";
import { errorHandler } from "@/utils/handlers";

interface BinancePriceData {
  symbol: string;
  price: string;
}

export let ethPrice = 0;

export async function getEthPrice() {
  try {
    const priceData = (await apiFetcher<BinancePriceData>(PRICE_API)).data;
    if (!priceData) return (ethPrice = 0);
    ethPrice = Number(priceData.price);
  } catch (error) {
    errorHandler(error);
  }
}
