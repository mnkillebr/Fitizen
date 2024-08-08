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

export function workoutFormDataToObject(formData: FormData): { [key: string]: any } {
  let formDataObject: { [key: string]: any } = {};

  for (const [key, value] of formData.entries()) {
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
    // const subArrayMatch = key.match(/^(\w+)\[(\d+)\]\[(\d+)\]\.(\w+)$/)

    if (arrayMatch) {
      const arrayName = arrayMatch[1];
      const arrayMatchIndex = parseInt(arrayMatch[2], 10);
      const property = arrayMatch[3];

      if (!formDataObject[arrayName]) {
        formDataObject[arrayName] = [];
      }

      if (!formDataObject[arrayName][arrayMatchIndex]) {
        formDataObject[arrayName][arrayMatchIndex] = {};
      }

      if (formDataObject[arrayName][arrayMatchIndex][property]) {
        const currentObjects = formDataObject[arrayName]
        const lastObject = currentObjects[currentObjects.length - 1];

        if (lastObject.hasOwnProperty(property)) {
          const newObject = { [property]: value };
          formDataObject[arrayName].push(newObject);
        } else {
          formDataObject[arrayName][currentObjects.length-1][property] = value;
        }
      } else {
        formDataObject[arrayName][arrayMatchIndex][property] = value;
      }
    } /*else if (subArrayMatch) {
      const arrayName = subArrayMatch[1];
      const arrayMatchIndex = parseInt(subArrayMatch[2], 10);
      const subArrayMatchIndex = parseInt(subArrayMatch[3], 10);
      const property = subArrayMatch[4];

      if (!formDataObject[arrayName]) {
        formDataObject[arrayName] = [];
      }

      if (!formDataObject[arrayName][arrayMatchIndex+subArrayMatchIndex]) {
        formDataObject[arrayName][arrayMatchIndex+subArrayMatchIndex] = {};
      }

      if (formDataObject[arrayName][arrayMatchIndex+subArrayMatchIndex][property]) {
        const currentObjects = formDataObject[arrayName]
        const lastObject = currentObjects[currentObjects.length - 1];

        if (lastObject.hasOwnProperty(property)) {
          const newObject = { [property]: value };
          formDataObject[arrayName].push(newObject);
        } else {
          formDataObject[arrayName][currentObjects.length-1][property] = value;
        }
      } else {
        formDataObject[arrayName][arrayMatchIndex+subArrayMatchIndex][property] = value;
      }
      formDataObject[arrayName][arrayMatchIndex+subArrayMatchIndex][property] = value;
    }*/ else {
      formDataObject[key] = value;
    }
  }

  return formDataObject;
}

export function flattenArraysInObject(obj: { [key: string]: any }): { [key: string]: any } {
  const result: { [key: string]: any } = {};

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      result[key] = obj[key].flat();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = flattenArraysInObject(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}
