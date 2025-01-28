import { LoaderFunctionArgs } from "@remix-run/node";
import db from "~/db.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const logId = params.logId as string;
  const userLog = await db.programLog.findUnique({
    where: {
      id: logId,
      userId: user.id,
    },
    include: {
      program: {
        select: {
          name: true,
        },
      },
      exerciseLogs: {
        include: {
          sets: true,
          blockExercise: {
            include: {
              block: {
                select: {
                  blockNumber: true,
                },
              },
              exercise: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (userLog !== null && userLog.userId !== user.id) {
    throw new Response("This workout log is not yours", { status: 401 });
  }
  const mappedBlocks = userLog?.exerciseLogs.reduce((result: any, curr: any) => {
    let resultArr = result
    if (resultArr.length && resultArr.find((obj: { programBlockId: string }) => obj.programBlockId === curr.programBlockId)) {
      resultArr = resultArr.map((obj: { programBlockId: string, sets: any[] }) => {
        if (obj.programBlockId === curr.programBlockId) {
          if (obj.sets.find(set => set.set === parseInt(curr.sets[0].set))) {
            return {
              ...obj,
              sets: obj.sets.map(set => {
                if (set.set === parseInt(curr.sets[0].set)) {
                  return {
                    ...set,
                    exercises: set.exercises.concat({
                      ...curr.sets[0],
                      ...curr.blockExercise,
                      exerciseName: curr.blockExercise.exercise.name,
                      exerciseId: curr.exerciseId,
                      notes: curr.sets[0].notes,
                    }).sort((a: any, b: any) => a.orderInBlock - b.orderInBlock)
                  }
                } else {
                  return set
                }
              })
            }
          } else {
            return {
              ...obj,
              sets: obj.sets.concat({
                set: parseInt(curr.sets[0].set),
                exercises: [{
                  ...curr.sets[0],
                  ...curr.blockExercise,
                  exerciseName: curr.blockExercise.exercise.name,
                  exerciseId: curr.exerciseId,
                  notes: curr.sets[0].notes,
                }]
              })
            }
          }
        } else {
          return obj
        }
      })
    } else {
      if (curr.programBlockId) {
        resultArr = resultArr.concat({
          blockNumber: curr.blockExercise.block.blockNumber,
          programBlockId: curr.programBlockId,
          sets: [{
            set: parseInt(curr.sets[0].set),
            exercises: [{
              ...curr.sets[0],
              ...curr.blockExercise,
              exerciseName: curr.blockExercise.exercise.name,
              exerciseId: curr.exerciseId,
              notes: curr.sets[0].notes,
            }]
          }]
        })
      }
    }
    return resultArr
  }, [])
  return { userLog, mappedBlocks }
}
