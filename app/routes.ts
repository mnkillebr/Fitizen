import type { RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from "@remix-run/routes-option-adapter";
import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

export default remixRoutesOptionAdapter((defineRoutes) =>
  createRoutesFromFolders(defineRoutes)
) satisfies RouteConfig;