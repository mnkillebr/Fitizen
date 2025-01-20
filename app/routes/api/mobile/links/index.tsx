import { ActionFunctionArgs, data } from "@remix-run/node";
import { sendMagicLinkEmail } from "~/magic-links.server";

export async function action({ request }: ActionFunctionArgs) {
  const jsonData = await request.json();
  const method = request.method;

  switch (method) {
    case "POST": {
      const { magicLink, email } = jsonData
      const emailSent = await sendMagicLinkEmail(magicLink, email);
      return Response.json({ emailSent, })
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