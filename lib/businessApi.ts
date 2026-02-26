import { apiFetch } from "./api";
import type { BusinessSummary } from "./types/auth";

export async function getMyBusinesses(): Promise<{ data: BusinessSummary[] }> {
  return apiFetch<{ data: BusinessSummary[] }>("/api/app/businesses");
}
