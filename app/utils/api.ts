import React from "react";
import { useMatches } from "@remix-run/react";

export function useMatchesData(id: string) {
  const matches = useMatches();
  const route = React.useMemo(
    () => matches.find(route => route.id === id),
    [matches, id]
  );
  return route?.data;
};