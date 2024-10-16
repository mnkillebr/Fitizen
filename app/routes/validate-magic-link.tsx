import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { getMagicLinkPayload, invalidMagicLink } from "~/magic-links.server";
import { createUser, getUserByEmail } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";
import { MAGIC_LINK_MAX_AGE } from "~/utils/magicNumbers";
import { validateForm } from "~/utils/validation";
import { Input } from "~/components/ui/input"
import clsx from "clsx";

type signUpActionType = {
  firstName?: string;
  lastName?: string;
  errors?: {
    [key: string]: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const magicLinkPayload = getMagicLinkPayload(request);

  // Check magic link expiration
  const createdAt = new Date(magicLinkPayload.createdAt);
  const expiresAt = createdAt.getTime() + MAGIC_LINK_MAX_AGE;

  if (Date.now() > expiresAt) {
    throw invalidMagicLink("The magic link has expired");
  }

  // Validate magic link nonce
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  if (session.get("nonce") !== magicLinkPayload.nonce) {
    throw invalidMagicLink("Invalid nonce");
  }

  // Checking if user exists
  const user = await getUserByEmail(magicLinkPayload.email);
  if (user) {
    session.set("userId", user.id);
    session.unset("nonce");
    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  return json("ok", {
    headers: {
      "Set-Cookie": await commitSession(session),
    }
  });
}

const signUpSchema =  z.object({
  firstName: z.string().min(1, "First name cannot be blank"),
  lastName: z.string().min(1, "Last name cannot be blank"),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return validateForm(
    formData,
    signUpSchema,
    async ({ firstName, lastName }) => {
      const magicLinkPayload = getMagicLinkPayload(request);
      // create user
      const user = await createUser(magicLinkPayload.email, firstName, lastName);

      // set session userid
      const cookieHeader = request.headers.get("cookie");
      const session = await getSession(cookieHeader);
      session.set("userId", user.id);
      session.unset("nonce");

      // redirect and commit session
      return redirect("/app", {
        headers: {
          "Set-Cookie": await commitSession(session),
        }
      });
    },
    (errors) => json(
      {
        errors,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
      },
      { status: 400 }
    )
  );
};

export default function ValidateMagicLink() {
  const actionData = useActionData<signUpActionType>();
	return (
		<div className="text-center mt-32 text-foreground flex flex-col items-center">
      <h1 className="font-medium text-2xl mb-3">Almost there!</h1>
      <h2 className="mb-2">Enter your name to complete the registration</h2>
      <form className="w-full sm:w-2/3 md:w-[450px] border dark:border-border-muted rounded-md p-6" method="post">
        <fieldset className="pb-4 text-left flex flex-col gap-y-2">
          <div>
            <label htmlFor="firstName" className="text-sm/3 font-medium">First Name</label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              defaultValue={actionData?.firstName}
              autoComplete="off"
              className={clsx(
                "w-full appearance-none border bg-background shadow-none",
                "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                "dark:border-border-muted dark:focus:border-ring"
              )}
              required
              placeholder="Enter first name"
            />
            <ErrorMessage>{actionData?.errors?.firstName}</ErrorMessage>
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm/3 font-medium">Last Name</label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              defaultValue={actionData?.lastName}
              autoComplete="off"
              className={clsx(
                "w-full appearance-none border bg-background shadow-none",
                "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                "dark:border-border-muted dark:focus:border-ring"
              )}
              required
              placeholder="Enter last name"
            />
            <ErrorMessage>{actionData?.errors?.lastName}</ErrorMessage>
          </div>
        </fieldset>
        <PrimaryButton className="mx-auto w-full text-foreground">Sign Up</PrimaryButton>
      </form>
		</div>
	)
};