import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getUserByClerkId } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";


export async function loader(args: LoaderFunctionArgs) {
  const { request } = args
  const { userId, sessionId } = await getAuth(args);
  const url = new URL(request.url);
  const authType = url.searchParams.get("type");

  if (!userId || !sessionId) {
    return redirect("/login");
  }
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  try {
    const existingUser = await getUserByClerkId(userId);

    if (authType === "signin" && existingUser) {
      // set session userid
      session.set("userId", existingUser.id);
      // redirect and commit session
      return redirect("/app", {
        headers: {
          "Set-Cookie": await commitSession(session),
        }
      });
    }

    // New user for both signup flows (OAuth & email), redirect to profile setup if user doesn't exist
    if (!existingUser) {
      return redirect(`/setup-profile?clerkId=${userId}&sessionId=${sessionId}`);
    }

    // set session userid
    session.set("userId", existingUser.id);
    // redirect and commit session
    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    session.flash("error", "Authentication failed");
    
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};