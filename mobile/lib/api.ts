import Constants from "expo-constants";
import { createApiClient } from "@BarLink360/shared";

let accessToken: string | null = null;

function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromConfig = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  return (fromEnv || fromConfig || "http://localhost:3000").replace(/\/$/, "");
}

export const api = createApiClient({
  baseUrl: getApiBaseUrl(),
  getToken: () => accessToken,
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}
