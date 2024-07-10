export function isEmptyObject<T extends object>(obj: T): boolean {
  // Check for null or undefined (technically not empty objects)
  if (obj == null) return false;

  // Check for entries with null, undefined, or empty string values
  return Object.values(obj).every(
    (value) =>
      !value || // Check for null or undefined
      (typeof value === "string" && value.trim() === "") || // Check for empty string
      (Array.isArray(value) && isEmptyObject(value)) // Recursively check inner arrays
  );
}
