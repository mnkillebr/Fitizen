import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const profile = user?.fitnessProfile
  return profile
}