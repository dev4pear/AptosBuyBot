import { parentPort, workerData } from "worker_threads";
import { processTxn } from "../aptosWeb3";

// Worker receives transaction data and processes it
parentPort?.on("message", (transaction) => {
  try {
    processTxn(transaction);
    parentPort?.postMessage({ success: true, version: transaction.version });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
});
