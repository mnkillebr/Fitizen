import { ExerciseTarget, LoadUnit } from "@prisma/client";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { getAllWorkouts, saveUserWorkoutLog } from "~/models/workout.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllWorkouts(query);

  return json(workouts)
}

export async function action({ request }: ActionFunctionArgs) {
  const jsonData = await request.json();
  // const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST": {
      const userId = "cm3xe717y0000lg2hh66kwcrs" // test user
      const mappedExerciseLogs = jsonData.exerciseLogs.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        circuitId: exercise.circuitId,
        orderInRoutine: exercise.orderInRoutine,
        target: exercise.target === "reps" ? ExerciseTarget.reps : ExerciseTarget.time,
        time: exercise.time,
        targetReps: exercise.targetReps,
        sets: exercise.sets.map(set => ({
          ...set,
          set: `${set.set}`,
          load: set.load ? parseFloat(set.load) : undefined,
          unit: set.unit === "bw" ? LoadUnit.bodyweight : set.unit === "lb(s)" ? LoadUnit.pound : LoadUnit.kilogram,
        }))
      }))
      const savedLog = await saveUserWorkoutLog(userId, jsonData.workoutId, jsonData.duration, mappedExerciseLogs)
      return savedLog
    }
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