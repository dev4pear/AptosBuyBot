export interface StoredGroup {
  id?: string;
  token: string;
  creation_num: number;
  chatId: number;
  lastSequence: number;
  symbol: string;
  decimals: number;
  emoji?: string | null;
  media?: string | null;
  mediaType?: "video" | "photo" | null;
  minBuy?: number;
  websiteLink?: string;
  telegramLink?: string;
  twitterLink?: string;
}
