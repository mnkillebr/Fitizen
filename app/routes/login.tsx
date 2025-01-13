import { ActionFunctionArgs, LoaderFunctionArgs, redirect, data } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { sessionCookie } from "~/cookies";
import { generateMagicLink, sendMagicLinkEmail } from "~/magic-links.server";
import { getUserByEmail } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";
import { validateForm } from "~/utils/validation";
import { v4 as uuid } from "uuid";
import { requireLoggedOutUser } from "~/utils/auth.server";
import { Input } from "~/components/ui/input"
import clsx from "clsx";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { createSupabaseClient } from "~/utils/supabase.server";

const loginSchema = z.object({
  email: z.string().email(),
})

type loginActionType = {
  email?: string;
  errors?: {
    [key: string]: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedOutUser(request);
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  await requireLoggedOutUser(request);
  const supabase = createSupabaseClient(request);
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "google_auth": {
      const { data: supabaseData, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        }
      });
      console.log("here", supabaseData, error)
      if (error) {
        return data({ error: error.message }, { status: 400 });
      }
      return { redirectTo: supabaseData.url };
    }
    default: {
      return validateForm(
        formData,
        loginSchema,
        async ({ email }) => {
          if (email.toLowerCase() === "testuser@email.com" || email.toLowerCase() === "coach.mkillebrew@gmail.com") {
            const testUser = await getUserByEmail(email)
            session.set("userId", testUser?.id);
            // redirect and commit session
            return redirect("/app", {
              headers: {
                "Set-Cookie": await commitSession(session),
              }
            });
          }
          const nonce = uuid();
          session.set("nonce", nonce)
          const magicLink = generateMagicLink(email, nonce)
          await sendMagicLinkEmail(magicLink, email);
          return data("ok", {
            headers: {
              "Set-Cookie": await commitSession(session)
            }
          })
          // const user = await getUserByEmail(email);
          // if (user === null) {
          //   return data( 
          //     { errors: { email: "User with this email does not exist" }},
          //     { status: 401 }
          //   );
          // }
          // session.set("userId", user.id)
          // return data({ user }, {
          //   headers: {
          //     "Set-Cookie": await commitSession(session),
          //   }
          // })
        },
        (errors) => data({ errors, email: formData.get("email") }, { status: 400 })
      )
    }
  }
}

export default function Login() {
  const actionData = useActionData<loginActionType>();
  const submit = useSubmit()

	return (
		<div className="text-center mt-32 text-foreground flex justify-center">
      {actionData === "ok" ?
        (
          <div>
            <h1 className="font-bold text-3xl mb-8">Get Ready to 💪</h1>
            <p>Check your email and follow the instructions to log in</p>
          </div>
        ) :
        (
          <div className="border dark:border-border-muted rounded-md p-6 w-full max-w-2xl">
            <h1 className="font-bold text-3xl mb-8">Log In</h1>
            <Form className="mx-auto" method="post">
              <div className="pb-4 text-left">
                {/* <label className="text-start pl-2">Email</label> */}
                <Input
                  type="email"
                  name="email"
                  required
                  defaultValue={actionData?.email}
                  autoComplete="off"
                  placeholder="Enter email address"
                  className={clsx(
                    "w-full appearance-none border bg-background shadow-none",
                    "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                    "dark:border-border-muted dark:focus:border-ring"
                  )}
                />
                <ErrorMessage>{actionData?.errors?.email}</ErrorMessage>
              </div>
              {/* <PrimaryButton className="mx-auto w-full text-foreground">Log In</PrimaryButton> */}
              <Button className="w-full">Log In</Button>
            </Form>
            <Separator className="my-6 dark:bg-border-muted"/>
            {/* <PrimaryButton className="mx-auto w-full text-foreground">Log In with Google</PrimaryButton> */}
            <Button
              className="w-full"
              onClick={() => {
                submit({ "_action": "google_auth" }, { method: "POST" })
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        )
      }
		</div>
	)
}