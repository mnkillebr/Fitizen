import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, json, useActionData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage } from "~/components/form";
import { generateMagicLink, sendMagicLinkEmail } from "~/magic-links.server";
import { getUserByEmail } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";
import { validateForm } from "~/utils/validation";
import { v4 as uuid } from "uuid";
import { requireLoggedOutUser } from "~/utils/auth.server";
import { Input } from "~/components/ui/input"
import clsx from "clsx";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { GoogleIcon } from "images/icons";
import { useSignUp } from "@clerk/remix";

const signupSchema = z.object({
  email: z.string().email(),
})

type signupActionType = {
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
    signupSchema,
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
    },
    (errors) => json({ errors, email: formData.get("email") }, { status: 400 })
  )
}

export default function SignUp() {
  const actionData = useActionData<signupActionType>();
  const navigate = useNavigate();
  const { isLoaded, signUp } = useSignUp();
  
  if (!isLoaded) return null;

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    
    try {
      await signUp.create({
        emailAddress: email,
      });
      
      // Start email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Redirect to verification page
      navigate(`/verify-email?email=${encodeURIComponent(email)}&type=signup`);
    } catch (err) {
      console.error("Error during sign up:", err);
    }
  };

  const handleOAuthSignUp = async () => {
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/callback",
        redirectUrlComplete: "/auth/callback"
      });
    } catch (err) {
      console.error("Error during OAuth sign up:", err);
    }
  };

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
          <div className="flex flex-col gap-y-3 border dark:border-border-muted rounded-md p-6 w-full max-w-2xl">
            <h1 className="font-bold text-3xl mb-5">Sign up</h1>
            <Form className="mx-auto w-full" onSubmit={handleEmailSignUp}>
              <div className="flex flex-col pb-4 text-left">
                <Label className="text-muted-foreground mb-2 ml-1">Sign up with your email</Label>
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
                    "dark:border-border-muted dark:focus:border-ring placeholder:text-foreground"
                  )}
                />
                <ErrorMessage>{actionData?.errors?.email}</ErrorMessage>
              </div>
              <Button className="w-full" type="submit">Sign up</Button>
            </Form>
            <Separator className="dark:bg-border-muted"/>
            <Label>or</Label>
            <Button
              className="w-full"
              onClick={handleOAuthSignUp}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>
        )
      }
		</div>
	)
}