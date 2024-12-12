import { TokenData, TxnData } from "@/types";
import { apiFetcher, getMC } from "@/utils/api";
import {
  botRemovedError,
  cleanUpBotMessage,
  generateBuyEmojis,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import {
  defaultEmoji,
  EXPLORER_URL,
  minBuy,
  TOKEN_API,
} from "@/utils/constants";
import { BOT_USERNAME } from "@/utils/env";
import {
  formatFloat,
  formatToInternational,
  shortenAddress,
} from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";
import { teleBot } from "..";
import { errorHandler } from "@/utils/handlers";
import { InlineKeyboard } from "grammy";

export async function sendAlert(txnData: TxnData) {
  const { token } = txnData;
  const groups = projectGroups.filter(
    ({ token: storedToken }) => storedToken === token
  );

  if (!groups.length) return false;

  const dexSData = await apiFetcher<TokenData>(`${TOKEN_API}/${token}`);

  const priceData = dexSData?.data;
  const firstPair = priceData?.pairs?.at(0);

  if (!firstPair) {
    const {
      receiver,
      version,
      tokenSent,
      tokenReceived,
      amountReceived,
      amountSent,
    } = txnData;

    const priceUsdData = (
      await apiFetcher<any>(`https://pump.uptos.xyz/token/${token}/api/chart`)
    ).data;
    const priceUsd = priceUsdData[priceUsdData.length - 1].open;
    const buyUsd = parseFloat((amountReceived * Number(priceUsd)).toFixed(2));
    const cleanedName = cleanUpBotMessage(tokenReceived);
    const shortendReceiver = cleanUpBotMessage(shortenAddress(receiver));

    const mcData = await apiFetcher<any>(
      `https://pump.uptos.xyz/token/api?page=1&pageSize=45&keyword=${tokenReceived}&orderField=tx_at&orderBy=desc`
    );
    const marketCap = mcData.data[0][0].mCap;

    for (const group of groups) {
      const groupMinBuy = group.minBuy || minBuy;
      // if (buyUsd < groupMinBuy) continue;
      const emojiCount = generateBuyEmojis(buyUsd);
      const { emoji, chatId, mediaType, media } = group;
      const emojis = `${emoji || defaultEmoji}`.repeat(emojiCount);

      const text = `[${cleanedName} Buy\\!](https://t.me/${BOT_USERNAME})
  
  ${emojis}
    
  🔀 *Spent*: ${formatFloat(amountSent)} ${hardCleanUpBotMessage(
        tokenSent
      )} \\($${cleanUpBotMessage(buyUsd)}\\)
  🔀 *Got*: ${formatFloat(amountReceived)} ${hardCleanUpBotMessage(
        tokenReceived
      )}
  👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/account/${receiver}) \\| [*${version}*](${EXPLORER_URL}/txn/${version}?network=mainnet)
  🔘 *Marketcap* \\~  $${cleanUpBotMessage(
    formatToInternational(marketCap || 0)
  )}
  `;

      const keyboard = new InlineKeyboard().url(
        "Support",
        "https://t.me/byte0xdev"
      );

      // --------------------- Sending message ---------------------
      try {
        if (media) {
          if (mediaType === "video") {
            await teleBot.api.sendVideo(chatId, media, {
              caption: text,
              parse_mode: "MarkdownV2",
              // @ts-expect-error weird
              disable_web_page_preview: true,
              reply_markup: keyboard,
            });
          } else {
            await teleBot.api.sendPhoto(chatId, media, {
              caption: text,
              parse_mode: "MarkdownV2",
              // @ts-expect-error weird
              disable_web_page_preview: true,
              reply_markup: keyboard,
            });
          }
        } else {
          await teleBot.api.sendMessage(chatId, text, {
            parse_mode: "MarkdownV2",
            // @ts-expect-error weird
            disable_web_page_preview: true,
            reply_markup: keyboard,
          });
        }
      } catch (error) {
        errorHandler(error);
        botRemovedError(error, group.chatId);
      }
    }
    return;
  }

  const { priceUsd } = firstPair;
  const {
    receiver,
    version,
    tokenSent,
    tokenReceived,
    amountReceived,
    amountSent,
  } = txnData;

  const buyUsd = parseFloat((amountReceived * Number(priceUsd)).toFixed(2));
  const cleanedName = cleanUpBotMessage(tokenReceived);
  const emojiCount = generateBuyEmojis(buyUsd);
  const shortendReceiver = cleanUpBotMessage(shortenAddress(receiver));
  const dexToolsLink = `https://www.dextools.io/app/en/aptos/pair-explorer/${token}`;
  // const cmcLink = "https://coinmarketcap.com/currencies/uptos/";
  const dexscreenLink = `https://dexscreener.com/aptos/${token}`;
  const marketCap = await getMC(token);

  for (const group of groups) {
    const groupMinBuy = group.minBuy || minBuy;
    if (buyUsd < groupMinBuy) continue;

    const {
      emoji,
      chatId,
      mediaType,
      media,
      telegramLink,
      twitterLink,
      websiteLink,
    } = group;
    const emojis = `${emoji || defaultEmoji}`.repeat(emojiCount);
    const socials = [
      ["Website", websiteLink],
      ["Twitter", twitterLink],
      ["Telegram", telegramLink],
    ]
      .filter(([, link]) => link)
      .map(([social, link]) => `[${social}](${link})`)
      .join(" \\| ");

    const socialsText = socials ? `🫧 *Socials* \\- ${socials}\n` : "";

    const text = `[${cleanedName} Buy\\!](https://t.me/${BOT_USERNAME})

${emojis}
  
🔀 *Spent*: ${formatFloat(amountSent)} ${hardCleanUpBotMessage(
      tokenSent
    )} \\($${cleanUpBotMessage(buyUsd)}\\)
🔀 *Got*: ${formatFloat(amountReceived)} ${hardCleanUpBotMessage(tokenReceived)}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/account/${receiver}) \\| [*${version}*](${EXPLORER_URL}/txn/${version}?network=mainnet)
🔘 *Marketcap* \\~  $${cleanUpBotMessage(formatToInternational(marketCap || 0))}
${socialsText}
[⚙️ DexTools](${dexToolsLink}) \\| [🦅 DexScreener](${dexscreenLink})
`;

    const keyboard = new InlineKeyboard().url(
      "Support",
      "https://t.me/byte0xdev"
    );

    // --------------------- Sending message ---------------------
    try {
      if (media) {
        if (mediaType === "video") {
          await teleBot.api.sendVideo(chatId, media, {
            caption: text,
            parse_mode: "MarkdownV2",
            // @ts-expect-error weird
            disable_web_page_preview: true,
            reply_markup: keyboard,
          });
        } else {
          await teleBot.api.sendPhoto(chatId, media, {
            caption: text,
            parse_mode: "MarkdownV2",
            // @ts-expect-error weird
            disable_web_page_preview: true,
            reply_markup: keyboard,
          });
        }
      } else {
        await teleBot.api.sendMessage(chatId, text, {
          parse_mode: "MarkdownV2",
          // @ts-expect-error weird
          disable_web_page_preview: true,
          reply_markup: keyboard,
        });
      }
    } catch (error) {
      errorHandler(error);
      botRemovedError(error, group.chatId);
    }
  }
}
