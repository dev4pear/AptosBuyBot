declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: "" | undefined;
      BOT_USERNAME: "" | undefined;
      NODE_ENV: "development" | "production";
      FIREBASE_KEY: "";
      DEXTOOLS_API_KEY: string | undefined;
    }
  }
}

export {};
