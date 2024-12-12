import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { errorHandler, log } from "./utils/handlers";
import { BOT_TOKEN } from "./utils/env";
import { aptos, processTxn, rpcConfig } from "./aptosWeb3";
import { syncProjectGroups } from "./vars/projectGroups";
import { tokens, syncTokens } from "./vars/tokens";
import { sleep } from "./utils/time";
import {
  Aptos,
  AptosConfig,
  Network,
  PaginationArgs,
} from "@aptos-labs/ts-sdk";
import { AptosTransaction, StoredGroup, UptosToken } from "./types";
import { apiFetcher, getMC } from "./utils/api";
import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";
import { cpus } from "os";
import { sendAlert } from "./bot/sendAlert";

const parseNum = (amount: number, decimals: number) => {
  return amount / 10 ** decimals;
};

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  const aptosConfig = new AptosConfig({ network: Network.MAINNET });
  const aptos = new Aptos(aptosConfig);

  rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncProjectGroups()]);

  // let url = "https://api.mainnet.aptoslabs.com/v1/transactions?limit=1";
  const url = "https://api.mainnet.aptoslabs.com/v1/graphql";

  const query = `
    query GetAccountTransactionsData($address: String, $limit: Int) {
    account_transactions(
      where: {account_address: {_eq: $address}}
      limit: $limit
      order_by: {transaction_version: desc, user_transaction: {}}
    ) {
      transaction_version
      coin_activities {
        activity_type
        amount
        coin_type
        entry_function_id_str
        event_account_address
        coin_info {
          coin_type
          coin_type_hash
          creator_address
          decimals
          name
          supply_aggregator_table_handle
          supply_aggregator_table_key
          symbol
        }
      }
    }
  }
  `;

  let start = 0;

  let variables = {
    address:
      "0x4e5e85fd647c7e19560590831616a3c021080265576af3182535a1d19e8bc2b3",
    limit: 1,
  };

  const toRepeatUptos = async () => {
    try {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("Response Data:", data.data.account_transactions);
          const res = data.data.account_transactions;
          if (res.length > 0) {
            for (var i = 0; i < res.length; i++) {
              const transactions = res[i];
              const version = transactions.transaction_version;
              const src = transactions.coin_activities[1];
              const dest = transactions.coin_activities[3];
              if (start === 0) {
                start = version;
              }
              if (version > start) {
                sendAlert({
                  token: dest.coin_info.coin_type,
                  tokenReceived: dest.coin_info.symbol,
                  amountReceived: parseNum(
                    dest.amount,
                    dest.coin_info.decimals
                  ),
                  amountSent: parseNum(src.amount, src.coin_info.decimals),
                  tokenSent: src.coin_info.symbol,
                  version: version,
                  receiver: src.event_account_address,
                });
                start = version;
              }
            }
          }
        })
        .catch((err) => console.error("Error: ---", err));
    } catch (error) {
      errorHandler(error);
    } finally {
      await sleep(1000);
      toRepeatUptos();
    }
  };

  toRepeatUptos();

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
      await sleep(100);
      toRepeat();
    }
  };

  toRepeat();
})();
