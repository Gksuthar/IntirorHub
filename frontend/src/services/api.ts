const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const buildHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async <T>(path: string, { method = "GET", body, token }: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload: ApiResponse<T> | undefined = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message = payload?.message || response.statusText || "Request failed";
    throw new ApiError(response.status, message, payload);
  }

  return payload?.data ?? (payload as unknown as T);
};

export const authApi = {
  registerAdmin: (body: { name?: string; email: string; phone: string; companyName: string; password: string }) =>
    request<{ message: string; token: string; user: unknown }>("/auth/register", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<{ message: string; token: string; user: unknown }>("/auth/login", { method: "POST", body }),
  inviteUser: (
    body: { email: string; name?: string; role: "MANAGER" | "AGENT" | "CLIENT"; phone?: string },
    token: string
  ) => request<{ message: string; user: unknown }>("/users/invite", { method: "POST", body, token }),
  me: (token: string) => request<unknown>("/auth/me", { method: "GET", token }),
};

