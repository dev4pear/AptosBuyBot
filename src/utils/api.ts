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
