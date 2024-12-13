import { errorHandler, log } from "./handlers";

export async function apiFetcher<T>(url: string, headers?: HeadersInit) {
  try {
    const response = await fetch(url, { headers });
    const data = (await response.json()) as T;
    return { response: response.status, data };
  } catch (error) {
    errorHandler(error);
    log(`Error in fetching ${url}`);
    return { response: 400, data: null };
  }
}

export async function getTransaction(version_number: number) {
  const url = `https://api.mainnet.aptoslabs.com/v1/transactions/by_version/${version_number}`;
  const options = {
    method: "GET",
    headers: { Accept: "application/json, application/x-bcs" },
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
  return null;
}

export async function getEvents(creation_number: number) {
  const url = `https://api.mainnet.aptoslabs.com/v1/accounts/0x61d2c22a6cb7831bee0f48363b0eec92369357aece0d1142062f7d5d85c7bef8/events/${creation_number}?limit=5`;
  const options = {
    method: "GET",
    headers: { Accept: "application/json, application/x-bcs" },
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
  }
  return [];
}

export async function getMC(token: string) {
  const url = `https://public-api.dextools.io/standard/v2/token/aptos/${token}/info`;

  // Add additional headers for better request handling
  const options = {
    method: "GET",
    headers: {
      "X-API-KEY": "yjrOtDg055FZYlXrRNse6m0fAVV8xR6236QjB6Mg",
    },
  };

  let data;

  try {
    const response = await fetch(url, options);

    // Check response status
    if (response.status === 403) {
      throw new Error("API access forbidden - please check your API key");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();
    // return data;
  } catch (err: any) {
    console.error("Error fetching data:", err.message);
    throw err;
  }
  return data.data.mcap;
}
