import { API_BASE_URL } from "../utils/constants";
import { getToken } from "../utils/tokenStorage";

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super("Request failed");
    this.status = status;
    this.data = data;
  }
}

const baseUrl = API_BASE_URL.replace(/\/+$/, "");

const buildUrl = (path: string) =>
  path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

const parseBody = async (response: Response) => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    throw new HttpError(response.status, data);
  }

  return data as T;
};

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
