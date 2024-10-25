import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { exerciseDetailsMap } from "./edit";
import { ArrowLeft, ChevronLeft } from "images/icons";
import CountdownTimer from "~/components/CountdownTimer";
import { useMemo, useState } from "react";
import Stopwatch from "~/components/Stopwatch";
import CurrentDate from "~/components/CurrentDate";
import { PrimaryButton } from "~/components/form";
import { CircuitLog, ExerciseLog, } from "~/components/logs";
import { z } from "zod";
import { validateObject } from "~/utils/validation";
import { workoutLogFormDataToObject } from "~/utils/misc";
import { saveUserWorkoutLog } from "~/models/workout.server";
import { ExerciseTarget, LoadUnit } from "@prisma/client";
import clsx from "clsx";

const loadOptions = [
  "bw",
  "1",
  "2",
  "2.5",
  "3",
  "4",
  "5",
  "7.5",
  "10",
  "12",
  "12.5",
  "14",
  "15",
  "16",
  "20",
  "24",
  "25",
  "28",
  "30",
  "32",
  "35",
  "36",
  "40",
  "45",
  "48",
  "50",
  "55",
  "60",
  "65",
  "70",
  "75",
  "80",
  "85",
  "90",
  "95",
  "100",
]
const unitOptions = [
  { value: "bw", label: "Bodyweight" },
  { value: "lb(s)", label: "Pounds" },
  { value: "kg(s)", label: "Kilograms" },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const workoutId = url.searchParams.get("id") as string;
  const workout = await db.routine.findUnique({
    where: { id: workoutId },
    include: {
      exercises: true,
    }
  });
  if (workout !== null && workout.userId !== user.id) {
    throw redirect("/app", 401)
  }
  if (!workout) {
    throw json(
      { message: "The workout you are attempting to log does not exist"},
      { status: 404, statusText: "Workout Not Found" }
    )
  }
  const exerciseIds = workout?.exercises?.map(item => item.exerciseId)
  const exercises = await db.exercise.findMany({
    where: {
      id: {
        in: exerciseIds
      }
    }
  });
  const exerciseDetails = exerciseDetailsMap(workout?.exercises, exercises, false)
  return json({ workout, exerciseDetails })
}

// Define Zod schema for form validation
const workoutLogSchema = z.object({
  workoutId: z.string(),
  duration: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date string",
  }),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    circuitId: z.string().optional(),
    target: z.string(),
    targetReps: z.string().optional(),
    time: z.string().optional(),
    sets: z.array(z.object({
      set: z.string(),
      actualReps: z.string().optional(),
      load: z.string().optional(),
      unit: z.string(),
      notes: z.string().optional(),
    })),
    // orderInRoutine: z.string(),
  })).min(1, "You must add at least one exercise"),
  // _action: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "saveUserWorkoutLog": {
      return validateObject(
        workoutLogFormDataToObject(formData),
        workoutLogSchema,
        async (data) => {     
          // const mappedExerciseLogs = data.exercises.reduce((result, curr) => {
          //   let resultArr = result
          //   if (curr && curr.sets) {
          //     const setArrays = curr.sets.map((set, set_idx) => ({
          //       exerciseId: curr.exerciseId,
          //       circuitId: curr.circuitId,
          //       target: curr.target === "reps" ? ExerciseTarget.reps : ExerciseTarget.time,
          //       set: set_idx + 1,
          //       targetReps: curr.targetReps,
          //       actualReps: set.actualReps,
          //       time: curr.time,
          //       load: set.load ? parseFloat(set.load) : null,
          //       unit: set.unit === "bw" ? LoadUnit.bodyweight : set.unit === "lb(s)" ? LoadUnit.pound : LoadUnit.kilogram,
          //       notes: set.notes,
          //     }))
          //     // const exerciseLog = {
          //     //   curr
          //     // }
          //     return resultArr.concat(setArrays)
          //   }
          //   return resultArr
          // }, [])
          const mappedExerciseLogs = data.exercises.map((exercise, idx) => ({
            ...exercise,
            target: exercise.target === "reps" ? ExerciseTarget.reps : ExerciseTarget.time,
            orderInRoutine: idx + 1,
            sets: exercise.sets.map(set => ({
              ...set,
              load: set.load ? parseFloat(set.load) : undefined,
              unit: set.unit === "bw" ? LoadUnit.bodyweight : set.unit === "lb(s)" ? LoadUnit.pound : LoadUnit.kilogram,
            }))
          }))
          
          await saveUserWorkoutLog(user.id, data.workoutId, data.duration, mappedExerciseLogs)
          return redirect(`/app/workouts/${data.workoutId}`);
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
  }
  return null
}

export default function Log() {
  const{ workout, exerciseDetails } = useLoaderData<typeof loader>();
  const [showStopwatch, setShowStopwatch] = useState(false);

  const flattenedDetails = useMemo(() => {
    return exerciseDetails.reduce((result, curr) => {
      let resultArr = result
      if (curr.exercises) {
        return resultArr.concat(curr.exercises)
      } else {
        return resultArr.concat(curr)
      }
    }, [])
  }, [exerciseDetails])
  // console.log("details", flattenedDetails, exerciseDetails)
  return (
    <Form method="post" className="p-6 md:p-8 flex flex-col gap-y-3 overflow-hidden select-none lg:w-3/4 xl:w-2/3 text-foreground">
      <div className="flex">
        <Link to={`/app/workouts/${workout?.id}`}>
          <ChevronLeft className="hover:text-primary" />
        </Link>
      </div>
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">New Workout Log</div>
        <div className="*:text-sm"><CurrentDate /></div>
        <input
          type="hidden"
          name="date"
          value={new Date().toISOString()}
        />
        <input
          type="hidden"
          name="workoutId"
          value={workout.id}
        />
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-xs text-muted-foreground">Workout Name</div>
        <div className="font-semibold text-md">{workout?.name}</div>
      </div>
      {showStopwatch ? (
        <Stopwatch autoStart label="Elapsed Time" />
      ) : (
        <CountdownTimer
          autoStart
          defaultTime={15}
          label="Get Ready!"
          showPresetTimes={false}
          showCustomInput={false}
          showControls={false}
          showSound
          onCountdownEnd={() => setShowStopwatch(true)}
        />
      )}
      <div className="font-semibold text-lg">Exercises</div>
      <div
        className={clsx(
          "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted",
          "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
        )}
      >
        <div className="overflow-y-auto flex flex-col gap-y-3">
          {exerciseDetails.map((item: any, index: number) => {
            if (item.exercises) {
              return (
                <CircuitLog
                  key={`${item.circuitId}-${index}`}
                  item={item}
                  index={index}
                  unitOptions={unitOptions}
                  exerciseDetails={exerciseDetails}
                  flatDetails={flattenedDetails}
                />
              )
            } else {
              return (
                <ExerciseLog
                  key={`${item.name}-${index}`}
                  item={item}
                  index={index}
                  unitOptions={unitOptions}
                  exerciseDetails={exerciseDetails}
                  flatDetails={flattenedDetails}
                />
              )
            }
          })}
        </div>
      </div>
      <PrimaryButton
        type="submit"
        name="_action"
        value="saveUserWorkoutLog"
        className="text-white px-4 py-2 rounded w-fit self-end"
        // disabled={isSavingWorkout}
        // isLoading={isSavingWorkout}
      >
        Save
      </PrimaryButton>
    </Form>
  );
}