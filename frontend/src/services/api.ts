
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

export type UserRole = "ADMIN" | "MANAGER" | "AGENT" | "CLIENT";

export interface AuthUser {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  companyName: string;
  role: UserRole;
  parentId?: string | null;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteDto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface FeedUserDto {
  name: string;
  role: string;
  avatar: string;
}

export interface FeedItemDto {
  id: string;
  type: "update" | "photo" | "document" | "milestone";
  content: string;
  images: string[];
  timestamp: string;
  likes: number;
  comments: number;
  siteId: string;
  siteName?: string;
  user: FeedUserDto;
}

export interface CompanyUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinedAt?: string;
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
      user: AuthUser;
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
      role: Exclude<UserRole, "ADMIN">;
      phone?: string;
    },
    token: string
  ) =>
    request<{
      message: string;
      user: AuthUser;
    }>("/users/invite", {
      method: "POST",
      body,
      token,
    }),

  login: (body: { email: string; password: string }) =>
    request<{
      message: string;
      token: string;
      user: AuthUser;
    }>("/auth/login", {
      method: "POST",
      body,
    }),

  me: (token: string) =>
    request<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      token,
    }),
};

export const userApi = {
  inviteUser: (
    body: {
      email: string;
      name?: string;
      role: Exclude<UserRole, "ADMIN">;
      phone?: string;
    },
    token: string
  ) =>
    request<{
      message: string;
      user: AuthUser;
    }>("/users/invite", {
      method: "POST",
      body,
      token,
    }),

  listUsers: (token: string) =>
    request<{
      users: CompanyUserDto[];
    }>("/users", {
      method: "GET",
      token,
    }),
};

export const siteApi = {
  listSites: (token: string) =>
    request<{
      sites: SiteDto[];
    }>("/sites", {
      method: "GET",
      token,
    }),

  createSite: (
    body: {
      name: string;
      description?: string;
      image?: string;
    },
    token: string
  ) =>
    request<{
      message: string;
      site: SiteDto;
    }>("/sites", {
      method: "POST",
      body,
      token,
    }),
};

export const feedApi = {
  listFeed: (siteId: string, token: string) =>
    request<{
      items: FeedItemDto[];
    }>(`/feed?siteId=${encodeURIComponent(siteId)}`, {
      method: "GET",
      token,
    }),

  createFeed: (
    body: {
      siteId: string;
      content: string;
      images: string[];
    },
    token: string
  ) =>
    request<{
      message: string;
      item: FeedItemDto;
    }>("/feed", {
      method: "POST",
      body,
      token,
    }),

  getFeedItem: (id: string, token: string) =>
    request<{
      item: FeedItemDto;
    }>(`/feed/${id}`, {
      method: "GET",
      token,
    }),
};
