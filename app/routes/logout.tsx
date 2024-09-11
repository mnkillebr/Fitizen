import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { RootNavLink } from "~/components/AppNavLink";
import { destroySession, getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("cookie")
  const session = await getSession(cookieHeader)
  return json("logging out", {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  });
};

export default function Logout() {
  return (
    <div className="text-center mt-40">
      <h1 className="font-bold my-6">All set</h1>
      <p className="mb-4">You have successfully logged out</p>
      <RootNavLink to="/">Go To Home Page</RootNavLink>
    </div>
  );
}