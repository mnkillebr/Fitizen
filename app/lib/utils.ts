import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type SortOrder = "asc" | "desc";

type SortCriteria<T> = {
  key: keyof T;
  order: SortOrder;
}[];

export function sortByMultipleProperties<T>(array: T[], criteria: SortCriteria<T>): T[] {
  return array.sort((a, b) => {
    for (const { key, order } of criteria) {
      const multiplier = order === "asc" ? 1 : -1;
      if (a[key] < b[key]) return -1 * multiplier;
      if (a[key] > b[key]) return 1 * multiplier;
    }
    return 0;
  });
}
