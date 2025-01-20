import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getUserByProvider } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";
import { createSupabaseClient } from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=Missing authorization code");
  }
  const { supabaseClient }  = createSupabaseClient(request);
  // Exchange the code for an access token and refresh token
  const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Store the session in a cookie
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  try {
    // set session access token, refresh token and provider token
    session.set("access_token", data.session.access_token);
    session.set("refresh_token", data.session.refresh_token);
    session.set("provider_token", data.session.provider_token);
    session.set("provider_user_id", data.user.id)
    session.set("provider_email", data.user.email)
    session.set("provider", data.user.app_metadata.provider)
    session.set("provider_full_name", data.user.user_metadata.full_name)

    const existingUser = await getUserByProvider(data.user.email!, data.user.id);
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
    // if no existing user redirect to setup
    return redirect(`/setup-profile`, {
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