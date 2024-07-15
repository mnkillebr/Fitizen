import { LoaderFunctionArgs } from "@remix-run/node";
import { requireLoggedInUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedInUser(request);
  return null
}

export default function Schedule() {
  return (
    <div>
      This is the Schedule page
    </div>
  )
}