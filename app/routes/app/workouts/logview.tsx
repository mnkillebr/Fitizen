import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
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
    }).reduce((result: any, curr: any) => {
      let resultArr = result
      if (resultArr.length && resultArr.find((item: any) => item.circuitId === curr.circuitId && curr.circuitId !== null)) {
        resultArr = resultArr.map((res_item: any) => {
          if (res_item.circuitId === curr.circuitId) {
            if (res_item.sets.length) {
              return {
                ...res_item,
                sets: [
                  ...res_item.sets,
                  ...curr.sets.map((set: any) => ({
                    ...set,
                    target: curr.target,
                    targetReps: curr.targetReps,
                    time: curr.time,
                    name: curr.exerciseName,
                    orderInRoutine: curr.orderInRoutine,
                  })),
                ].sort((a, b) => a.set - b.set)
              }
            } else {
              return {
                ...curr,
                sets: [
                  ...curr.sets.map((set: any) => ({
                    ...set,
                    target: curr.target,
                    targetReps: curr.targetReps,
                    time: curr.time,
                    notes: curr.notes,
                    name: curr.exerciseName,
                    orderInRoutine: curr.orderInRoutine,
                  })),
                ]
              }
            }
          } else {
            return res_item
          }
        })
        return resultArr
      } else {
        if (curr.circuitId && curr.circuitId !== null) {
          return resultArr.concat(
            {
              ...curr,
              sets: [
                ...curr.sets.map((set: any) => ({
                  ...set,
                  target: curr.target,
                  targetReps: curr.targetReps,
                  time: curr.time,
                  name: curr.exerciseName,
                  orderInRoutine: curr.orderInRoutine,
                })),
              ]
            }
          )
        } else {
          return resultArr.concat(curr)
        }
      }
    }, [])
  }
  return json({ userLog: nameMappedUserLog, workoutName })
};

export async function action() {
  return null
}

export default function LogView() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="py-6 px-5 md:px-7 md:py-8 flex flex-col h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.75rem)] gap-y-3 select-none lg:w-3/4 xl:w-2/3 bg-background text-foreground">
      <div className="flex">
        <Link to={`/app/workouts/${data.userLog?.routineId}`}>
          <ChevronLeft className="hover:text-primary" />
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">Workout Log</div>
        <div className="*:text-sm"><CurrentDate incomingDate={data.userLog?.date} /></div>
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-xs text-muted-foreground">Workout Name</div>
        <div className="font-semibold text-md">{data.workoutName?.name}</div>
      </div>
      <div className="font-semibold text-lg">Logged Exercises</div>
      <div
        className={clsx(
          "overflow-y-auto flex flex-col gap-y-3 bg-background-muted",
          "rounded-md shadow-md bg-slate-50 py-4 px-3",
          "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
        )}
      >
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