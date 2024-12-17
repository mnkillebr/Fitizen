import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getWorkout } from "~/models/workout.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const workoutId = params.workoutId as string;
  const workout = await getWorkout(workoutId)
  return json(workout);
};