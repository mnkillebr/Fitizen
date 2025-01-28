import { LoadUnit } from "@prisma/client";
import { ActionFunctionArgs, data, LoaderFunctionArgs } from "@remix-run/node";
import { getAllPrograms, saveUserProgramLog } from "~/models/program.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  // console.log("users", user)
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const programs = await getAllPrograms(query)
  return programs;
};

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const jsonData = await request.json();
  const method = request.method;

  switch (method) {
    case "POST": {
      // Handle program post requests
      const { action, ...rest } = jsonData 
      switch (action) {
        case "saveProgramWorkoutLog": {
          const { duration, programId, programWeek, programDay, exerciseLogs } = rest
          try {
            const userId = user.id
            const mappedExerciseLogs = exerciseLogs.reduce((result: any, curr: any) => {
              let resultArr = result
              if (curr.sets) {
                const mappedSets = curr.sets.map((set: any) => ({
                  ...set,
                  programBlockId: curr.programBlockId,
                  exerciseId: curr.exerciseId,
                  set: `${set.set}`,
                  load: set.load ? parseFloat(set.load) : undefined,
                  unit: set.unit === "kilogram" ? LoadUnit.kilogram : set.unit === "pound" ? LoadUnit.pound : LoadUnit.bodyweight,
                }))
                return resultArr.concat(mappedSets)
              } else {
                return resultArr
              }
            }, [])
            // console.log("save log", mappedExerciseLogs[0])
            // return null
            const savedLog = await saveUserProgramLog(userId, programId, parseInt(programWeek), parseInt(programDay), duration, mappedExerciseLogs)
            return savedLog
          } catch (error) {
            return data({ errors: { error: "Failed to save user workout log" } }, { status: 500 });
          }
        }
        default: {
          return Response.json({})
        }
      }
    }
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