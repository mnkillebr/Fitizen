import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { getAllPrograms } from "~/models/program.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const programs = await getAllPrograms(query)
  return programs;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST":
      // Handle program creation
      break;
    case "PUT":
      // Handle program update
      break;
    case "DELETE":
      // Handle program deletion
      break;
    default:
      return data({ error: "Method not allowed" }, { status: 405 });
  }
};