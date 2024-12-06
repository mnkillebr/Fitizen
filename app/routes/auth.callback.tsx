import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getUserByClerkId } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";


export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect("/login");
  }
  const cookieHeader = args.request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  try {
    const existingUser = await getUserByClerkId(userId);

    if (existingUser) {
      // set session userid
      session.set("userId", existingUser.id);
      // redirect and commit session
      return redirect("/app", {
        headers: {
          "Set-Cookie": await commitSession(session),
        }
      });
    }

    // New user - redirect to profile setup
    return redirect(`/setup-profile?clerkId=${userId}`);
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