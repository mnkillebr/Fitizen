import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { sessionCookie } from "~/cookies";
import { generateMagicLink, sendMagicLinkEmail } from "~/magic-links.server";
import { getUserByEmail } from "~/models/user.server";
import { commitSession, getSession } from "~/sessions";
import { validateForm } from "~/utils/validation";
import { v4 as uuid } from "uuid";

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
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  // console.log("session data", session.data)
  return null
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const formData = await request.formData();
  return validateForm(
    formData,
    loginSchema,
    async ({ email }) => {
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
		<div className="text-center mt-32">
      {actionData === "ok" ?
        (
          <div>
            <h1 className="font-bold text-3xl mb-8">Get Ready to 💪</h1>
            <p>Check your email and follow the instructions to log in</p>
          </div>
        ) :
        (
          <div>
            <h1 className="font-bold text-3xl mb-8">Log In</h1>
            <Form className="mx-auto sm:w-1/2 lg:w-1/3" method="post">
              <div className="pb-4 text-left">
                {/* <label className="text-start pl-2">Email</label> */}
                <PrimaryInput
                  type="email"
                  name="email"
                  required
                  defaultValue={actionData?.email}
                  autoComplete="off"
                  placeholder="Enter email address"
                />
                <ErrorMessage>{actionData?.errors?.email}</ErrorMessage>
              </div>
              <PrimaryButton className="mx-auto w-1/2">Log In</PrimaryButton>
            </Form>
          </div>
        )
      }
		</div>
	)
}