import { format } from "date-fns";

export function formatDate(date: string | null): string {
  if (!date) return "N/A";
  return format(new Date(date), "PPP");
} 