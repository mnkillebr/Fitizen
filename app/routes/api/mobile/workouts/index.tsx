import { ExerciseTarget, LoadUnit } from "@prisma/client";
import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { getAllWorkouts, saveUserWorkoutLog } from "~/models/workout.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllWorkouts(query);

  return workouts
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const jsonData = await request.json();
  // const formData = await request.formData();
  const method = request.method;

  switch (method) {
    case "POST": {
      const userId = user.id // testuser@email.com
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
      // console.log("save mobile log", userId, mappedExerciseLogs)
      // return null
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