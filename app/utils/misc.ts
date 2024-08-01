import { useState, useEffect } from "react";

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
};

let hasHydrated = false;
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(hasHydrated);
  useEffect(() => {
    hasHydrated = true;
    setIsHydrated(true);
  }, [])
  return isHydrated;
};


interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
