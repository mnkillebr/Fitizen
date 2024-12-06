// app/routes/setup-profile.tsx
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import db from "~/db.server";
import { commitSession, getSession } from "~/sessions";
import { Role } from "@prisma/client";
import { Input } from "~/components/ui/input";
import clsx from "clsx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { ErrorMessage } from "~/components/form";
import { getUserByClerkId } from "~/models/user.server";

type setupActionType = {
  firstName?: string;
  lastName?: string;
  errors?: {
    [key: string]: string;
  };
}

const setupSchema =  z.object({
  clerkId: z.string(),
  firstName: z.string().min(1, "First name cannot be blank"),
  lastName: z.string().min(1, "Last name cannot be blank"),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const clerkId = url.searchParams.get("clerkId");
  const sessionId = url.searchParams.get("sessionId");

  if (!clerkId || !sessionId) {
    return redirect("/signup")
  }

  const existingUser = await getUserByClerkId(clerkId);

  if (existingUser) {
    const cookieHeader = request.headers.get("cookie");
    const session = await getSession(cookieHeader);
    // set session userid
    session.set("userId", existingUser.id);
    // redirect and commit session
    return redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      }
    });
  }

  return json({ clerkId, sessionId })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return validateForm(
    formData,
    setupSchema,
    async ({ clerkId, firstName, lastName }) => {
      const cookieHeader = request.headers.get("cookie");
      const session = await getSession(cookieHeader);
      try {
        const existingUser = await db.user.findUnique({
          where: { clerkId },
        });
    
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
    
        const user = await db.user.create({
          data: {
            clerkId,
            firstName,
            lastName,
            role: Role.user,
          },
        });
    
        // set session userid
        session.set("userId", user.id);
        // redirect and commit session
        return redirect("/app", {
          headers: {
            "Set-Cookie": await commitSession(session),
          }
        });
      } catch (error) {
        return json({ errors: { error: "Failed to create user" } }, { status: 500 });
      }
    },
    (errors) => json(
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
  const { clerkId } = useLoaderData<typeof loader>();
  const actionData = useActionData<setupActionType>();

  return (
    <div className="text-center mt-32 text-foreground flex justify-center">
      <div className="flex flex-col gap-y-3 border dark:border-border-muted rounded-md p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        
        <Form method="post" className="">
          <input type="hidden" name="clerkId" value={clerkId} />
          
          <div className="flex flex-col pb-4 text-left">
            <Label className="text-muted-foreground mb-2 ml-1">First Name</Label>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              defaultValue={actionData?.firstName}
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
              defaultValue={actionData?.lastName}
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