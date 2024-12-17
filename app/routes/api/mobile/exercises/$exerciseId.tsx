import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getExercise } from "~/models/exercise.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const exerciseId = params.exerciseId as string;
  const exercise = await getExercise(exerciseId)
  return json(exercise);
};