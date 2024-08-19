import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChevronLeft } from "images/icons";
import CurrentDate from "~/components/CurrentDate";
import { PastCircuitLog, PastExerciseLog } from "~/components/logs";
import db from "~/db.server";
import { requireLoggedInUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const logId = url.searchParams.get("id") as string;
  const userLog = await db.workoutLog.findUnique({
    where: {
      id: logId,
      userId: user.id,
      // routineId: workoutId,
    },
    include: {
      exerciseLogs: {
        include: {
          sets: true,
        },
      },
    },
  });
  const workoutName = await db.routine.findUnique({
    where: {
      id: userLog?.routineId,
      userId: user.id,
    },
    select: {
      name: true,
    },
  });
  const exerciseIds = userLog?.exerciseLogs.map(e => e.exerciseId)
  const exerciseNames = await db.exercise.findMany({
    where: {
      id: {
        in: exerciseIds,
      },
    },
    select: {
      id: true,
      name: true,
    }
  })
  if (userLog !== null && userLog.userId !== user.id) {
    throw redirect("/app", 401)
  }
  const nameMappedUserLog = {
      ...userLog,
      exerciseLogs: userLog?.exerciseLogs.map(log => {
      const match = exerciseNames.find(eName => eName.id === log.exerciseId)
      if (match) {
        return {
          ...log,
          exerciseName: match.name,
        }
      } else {
        return log
      }
    }).reduce((result: any, curr) => {
      let resultArr = result
      if (resultArr.length && resultArr.find((item: any) => item.circuitId === curr.circuitId && curr.circuitId !== null)) {
        resultArr = resultArr.map((item: any) => {
          if (item.circuitId === curr.circuitId) {
            return {
              ...item,
              sets: [
                ...item.sets.map(set => ({
                  ...set,
                  target: item.target,
                  targetReps: item.targetReps,
                  time: item.time,
                  notes: item.notes,
                  name: item.exerciseName
                })),
                ...curr.sets.map(set => ({
                  ...set,
                  target: curr.target,
                  targetReps: curr.targetReps,
                  time: curr.time,
                  notes: curr.notes,
                  name: curr.exerciseName
                })),
              ]
            }
          } else {
            return item
          }
        })
        return resultArr
      } else {
        return resultArr.concat(curr)
      }
    }, [])
  }
  return json({ userLog: nameMappedUserLog, workoutName })
};

export default function LogView() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="p-6 md:p-8 flex flex-col h-full gap-y-3 select-none lg:w-3/4 xl:w-2/3">
      <div className="flex">
        <Link to={`/app/workouts/${data.userLog?.routineId}`}>
          <ChevronLeft className="hover:text-accent" />
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">Workout Log</div>
        <div className="*:text-sm"><CurrentDate incomingDate={data.userLog?.date} /></div>
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-xs">Workout Name</div>
        <div className="font-semibold text-md">{data.workoutName?.name}</div>
      </div>
      <div className="font-semibold text-lg">Logged Exercises</div>
      <div className="overflow-y-auto flex flex-col gap-y-2">
        {data.userLog?.exerciseLogs?.map((exercise: any, index: number) => {
          if (exercise.circuitId) {
            return <PastCircuitLog key={`${exercise.circuitId}-${index}`} exercise={exercise} index={index} logs={data.userLog.exerciseLogs} />
          } else {
            return <PastExerciseLog key={`${exercise.id}-${index}`} exercise={exercise} index={index} logs={data.userLog.exerciseLogs} />
          }
        })}
      </div>
    </div>
  );
};