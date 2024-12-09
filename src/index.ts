import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { errorHandler, log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { aptos, processTxn, rpcConfig } from "./aptosWeb3";
import { syncProjectGroups } from "./vars/projectGroups";
import { sleep } from "./utils/time";
import { PaginationArgs } from "@aptos-labs/ts-sdk";
import { AptosTransaction } from "./types";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncProjectGroups()]);

  let offset = 0;
  const limit = 50;

  const toRepeat = async () => {
    try {
      let options: PaginationArgs = { limit };
      if (offset > 0) options = { offset, ...options };
      const txns = await aptos.getTransactions({ options });

      txns.forEach((txn, index) => {
        const txnData = txn as unknown as AptosTransaction;
        const version = Number(txnData.version);

        processTxn(txnData);
        if (index === limit - 1) offset = version + 1;
      });
    } catch (error) {
      errorHandler(error);
    } finally {
      await sleep(1000);
      toRepeat();
    }
  };

  toRepeat();
})();
