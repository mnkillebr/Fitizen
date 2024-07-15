import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireLoggedInUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedInUser(request);
  return redirect("programs");
};