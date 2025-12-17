
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "")



export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}


const buildHeaders = (token?: string, hasBody = false): HeadersInit => {
  const headers: HeadersInit = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T> | null> => {
  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return response.json();
};


const request = async <T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, Boolean(body)),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponse<T>(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message || response.statusText || "Request failed",
      payload
    );
  }

  if (payload && "data" in payload) {
    return payload.data;
  }

  // Case: API returns raw JSON
  return payload as unknown as T;
};

export const authApi = {
  registerAdmin: (body: {
    name?: string;
    email: string;
    phone: string;
    companyName: string;
    password: string;
  }) =>
    request<{
      email: string;
      needsVerification: boolean;
    }>("/auth/register", {
      method: "POST",
      body,
    }),

  verifyOtp: (body: { email: string; otp: string }) =>
    request<{
      message: string;
      token: string;
      user: unknown;
    }>("/auth/verify-otp", {
      method: "POST",
      body,
    }),

  resendOtp: (body: { email: string }) =>
    request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body,
    }),

  inviteUser: (
    body: {
      email: string;
      name?: string;
      role: "MANAGER" | "AGENT" | "CLIENT";
      phone?: string;
    },
    token: string
  ) =>
    request<{
      message: string;
      user: unknown;
    }>("/users/invite", {
      method: "POST",
      body,
      token,
    }),

  login: (body: { email: string; password: string }) =>
    request<{
      message: string;
      token: string;
      user: unknown;
    }>("/auth/login", {
      method: "POST",
      body,
    }),

  me: (token: string) =>
    request<unknown>("/auth/me", {
      method: "GET",
      token,
    }),
};

export const userApi = {
  inviteUser: (
    body: {
      email: string;
      name?: string;
      role: "MANAGER" | "AGENT" | "CLIENT";
      phone?: string;
    },
    token: string
  ) =>
    request<{
      message: string;
      user: unknown;
    }>("/users/invite", {
      method: "POST",
      body,
      token,
    }),
};
