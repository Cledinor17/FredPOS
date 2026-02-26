export type AuthUser = {
  id?: number | string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

export type BusinessSummary = {
  id?: number | string;
  slug: string;
  name?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser | null;
  businesses?: BusinessSummary[];
  activeBusiness?: BusinessSummary | null;
  permissions?: string[];
};
