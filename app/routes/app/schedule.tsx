import { LoaderFunctionArgs } from "@remix-run/node";
import Calendar from "~/components/Calendar";
import { requireLoggedInUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedInUser(request);
  return null
}

export default function Schedule() {
  return (
    <div className="h-full">
      {/* This is the Schedule page */}
      <Calendar />
    </div>
  )
}