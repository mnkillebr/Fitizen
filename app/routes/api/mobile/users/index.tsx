import { Role } from "@prisma/client";
import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import db from "~/db.server";
import { createUser, createUserWithProvider, getUserByEmail, getUserByProvider } from "~/models/user.server";
import { generateToken } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  console.log("check user", email)
  if (!email) {
    return Response.error()
  }
  const existingUser = await getUserByEmail(email)
  return existingUser
}

export async function action({ request }: ActionFunctionArgs) {
  const jsonData = await request.json();
  const method = request.method;

  switch (method) {
    case "POST": {
      const { action, ...rest } = jsonData
      switch (action) {
        case "checkExistingOAuthUser": {
          const { provider_email, provider_user_id } = rest
          try {
            const existingUser = await getUserByProvider(provider_email, provider_user_id)
            return Response.json({ user: existingUser })
          } catch (error) {
            return data({ errors: { error: "Failed to retrieve user" } }, { status: 500 });
          }
        }
        case "checkExistingEmailUser": {
          const { magic_link_email } = rest
          try {
            const existingUser = await getUserByEmail(magic_link_email)
            if (existingUser) {
              const token = generateToken(existingUser);
              return Response.json({ user: existingUser, token })
            } else {
              return Response.json({ user: null })
            }
          } catch (error) {
            return data({ errors: { error: "Failed to retrieve user" } }, { status: 500 });
          }
        }
        case "createUser": {
          const { firstName, lastName, email, provider, provider_user_id } = rest
          try {
            let user
            if (provider && provider_user_id) {
              user = await createUserWithProvider(email, firstName, lastName, provider, provider_user_id);
            }
            user = await createUser(email, firstName, lastName)
            const token = generateToken(user);
            return Response.json({ user, token })
          } catch (error) {
            return data({ errors: { error: "Failed to create user" } }, { status: 500 });
          }
        }
        default: {
          return Response.json({})
        }
      }
      // const { magic_link_email, provider_email, provider_user_id } = jsonData
      // if (magic_link_email) {
      //   const existingUser = await getUserByEmail(magic_link_email)
      //   return existingUser
      // }
      // const existingUser = await getUserByProvider(provider_email, provider_user_id)
      // return existingUser
    }
    case "PUT":
      // Handle workout update
      break;
    case "DELETE":
      // Handle workout deletion
      break;
    default:
      return data({ error: "Method not allowed" }, { status: 405 });
  }
};