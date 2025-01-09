
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { commitSession, getSession } from "~/sessions";

export function createSupabaseClient(request: Request) {
// export async function createSupabaseClient(request: Request) {
  // const cookieHeader = request.headers.get("cookie")
  // const session = await getSession(cookieHeader)
  const headers = new Headers();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    // {
    //   cookies: {
    //     get(key) {
    //       return session.get(key);
    //     },
    //     async set(key, value, options) {
    //       session.set(key, value)
    //       headers.append("Set-Cookie", await commitSession(session, options));
    //     },
    //     async remove(key, options) {
    //       session.unset(key)
    //       headers.append("Set-Cookie", await commitSession(session, options));
    //     },
    //   },
    // },
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    }
  );
}
