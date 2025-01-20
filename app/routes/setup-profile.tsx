import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, data, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions";
import { Input } from "~/components/ui/input";
import clsx from "clsx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { ErrorMessage } from "~/components/form";
import { createUserWithProvider, getUserByProvider } from "~/models/user.server";

type setupActionType = {
  firstName?: string;
  lastName?: string;
  errors?: {
    [key: string]: string;
  };
}

const setupSchema =  z.object({
  firstName: z.string().min(1, "First name cannot be blank"),
  lastName: z.string().min(1, "Last name cannot be blank"),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  // const url = new URL(request.url);
  // const access_token = url.searchParams.get("access_token");
  // const refresh_token = url.searchParams.get("refresh_token");
  // const provider_token = url.searchParams.get("provider_token");
  // const provider = url.searchParams.get("provider");
  // const provider_user_id = url.searchParams.get("provider_user_id");
  // const provider_email = url.searchParams.get("provider_email");
  // const provider_full_name = url.searchParams.get("provider_full_name");
  const access_token = session.get("access_token");
  const refresh_token = session.get("refresh_token");
  const provider_token = session.get("provider_token");
  const provider = session.get("provider");
  const provider_user_id = session.get("provider_user_id");
  const provider_email = session.get("provider_email");
  const provider_full_name = session.get("provider_full_name");

  if (!access_token || !provider_user_id || !provider_email) {
    return redirect("/login")
  }

  const existingUser = await getUserByProvider(provider_email, provider_user_id);
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
  const firstName = provider_full_name!.split(" ")[0]
  const lastName = provider_full_name!.split(" ")[1]
  return { success: "ok", firstName, lastName }
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  // const url = new URL(request.url);
  // const access_token = url.searchParams.get("access_token");
  // const refresh_token = url.searchParams.get("refresh_token");
  // const provider_token = url.searchParams.get("provider_token");
  // const provider = url.searchParams.get("provider");
  // const provider_user_id = url.searchParams.get("provider_user_id");
  // const provider_email = url.searchParams.get("provider_email");
  // const provider_full_name = url.searchParams.get("provider_full_name");
  // const access_token = session.get("access_token");
  // const refresh_token = session.get("refresh_token");
  // const provider_token = session.get("provider_token");
  const provider = session.get("provider");
  const provider_user_id = session.get("provider_user_id");
  const provider_email = session.get("provider_email");
  // const provider_full_name = session.get("provider_full_name");
  const formData = await request.formData();
  return validateForm(
    formData,
    setupSchema,
    async ({ firstName, lastName }) => {
      try {
        const user = await createUserWithProvider(provider_email, firstName, lastName, provider, provider_user_id);

        // session.set("access_token", access_token);
        // session.set("refresh_token", refresh_token);
        // session.set("provider_token", provider_token);
        // set session userid
        session.set("userId", user.id);
        // redirect and commit session
        return redirect("/app", {
          headers: {
            "Set-Cookie": await commitSession(session),
          }
        });
      } catch (error) {
        return data({ errors: { error: "Failed to create user" } }, { status: 500 });
      }
    },
    (errors) => data(
      {
        errors,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
      },
      { status: 400 }
    )
  )
}

export default function SetupProfile() {
  const { firstName, lastName } = useLoaderData<typeof loader>();
  const actionData = useActionData<setupActionType>();

  return (
    <div className="text-center mt-32 text-foreground flex justify-center">
      <div className="flex flex-col gap-y-3 border dark:border-border-muted rounded-md p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        
        <Form method="post" className="">
          <div className="flex flex-col pb-4 text-left">
            <Label className="text-muted-foreground mb-2 ml-1">First Name</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              defaultValue={actionData?.firstName ?? firstName}
              autoComplete="off"
              className={clsx(
                "w-full appearance-none border bg-background shadow-none",
                "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                "dark:border-border-muted dark:focus:border-ring placeholder:text-foreground"
              )}
              required
              placeholder="Enter first name"
            />
            <ErrorMessage>{actionData?.errors?.firstName}</ErrorMessage>
          </div>

          <div className="flex flex-col pb-4 text-left">
            <Label className="text-muted-foreground mb-2 ml-1">Last Name</Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              defaultValue={actionData?.lastName ?? lastName}
              autoComplete="off"
              className={clsx(
                "w-full appearance-none border bg-background shadow-none",
                "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                "dark:border-border-muted dark:focus:border-ring placeholder:text-foreground"
              )}
              required
              placeholder="Enter last name"
            />
            <ErrorMessage>{actionData?.errors?.lastName}</ErrorMessage>
          </div>
          <Button type="submit" className="w-full">
            Complete Setup
          </Button>
        </Form>
      </div>
    </div>
  );
}