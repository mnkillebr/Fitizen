import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { getAllWorkouts } from "~/models/workout.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllWorkouts(query);

  return json(workouts)
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST":
      // Handle workout creation
      break;
    case "PUT":
      // Handle workout update
      break;
    case "DELETE":
      // Handle workout deletion
      break;
    default:
      return json({ error: "Method not allowed" }, { status: 405 });
  }
};