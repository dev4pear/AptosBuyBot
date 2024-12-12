import { getDocument } from "@/firebase";
import { UptosToken } from "@/types";
import { log } from "@/utils/handlers";

export let tokens: UptosToken[] = [];

export function addToken(token: UptosToken) {
  tokens.push(token);
}

export function setTokens(tokens: UptosToken[]) {
  tokens = tokens;
}

export async function syncTokens() {
  const rows = await getDocument<UptosToken>({
    collectionName: "project_groups",
  });
  tokens = rows;
  log("Synced tokens with firebase");
}
