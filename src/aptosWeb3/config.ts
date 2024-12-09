import { log } from "@/utils/handlers";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export let aptos = null as unknown as Aptos;

export function rpcConfig() {
  const aptosConfig = new AptosConfig({ network: Network.MAINNET });
  aptos = new Aptos(aptosConfig);
  log("Aptos RPC setup");
}
