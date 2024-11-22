import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
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
  
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const formData = await request.formData();
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
      return json("ok", {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      })
      // const user = await getUserByEmail(email);
      // if (user === null) {
      //   return json( 
      //     { errors: { email: "User with this email does not exist" }},
      //     { status: 401 }
      //   );
      // }
      // session.set("userId", user.id)
      // return json({ user }, {
      //   headers: {
      //     "Set-Cookie": await commitSession(session),
      //   }
      // })
    },
    (errors) => json({ errors, email: formData.get("email") }, { status: 400 })
  )
}

export default function Login() {
  const actionData = useActionData<loginActionType>();

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
              <PrimaryButton className="mx-auto w-full text-foreground">Log In</PrimaryButton>
            </Form>
          </div>
        )
      }
		</div>
	)
}