import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { ArrowLeft, ClockIcon, FireIcon, PlayIcon, BarsIcon, ContextMenuIcon, TrashIcon, PencilIcon } from "images/icons";
import db from "~/db.server";
import crunchGirl from "images/jonathan-borba-lrQPTQs7nQQ-unsplash copy.jpg";
import { Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Exercise as ExerciseType, RoutineExercise as RoutineExerciseType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { ErrorMessage } from "~/components/form";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";
import { deleteWorkout, getWorkout } from "~/models/workout.server";


const deleteWorkoutSchema = z.object({
  workoutId: z.string(),
})

interface deleteWorkoutFetcherType extends ActionFunctionArgs{
  errors?: {
    workoutId?: string
  }
}

const tabOptions = ["Warmup", "Main", "Cooldown"]

function exerciseDetailsMap(routineExercises: Array<RoutineExerciseType> | undefined, exerciseDetails: Array<ExerciseType>) {
  if (routineExercises) {
    const detailedExercises = routineExercises.map((item) => {
      const itemId = item.exerciseId
      const exerciseDetail = exerciseDetails.find(detail => detail.id === itemId)
      return {
        ...item,
        ...exerciseDetail,
      }
    })
    const nonGrouped = detailedExercises.filter(ex => !ex.circuitId)
    const grouped = detailedExercises.filter(ex => ex.circuitId).reduce((result: any, curr: any) => {
      let resultArr = result
      if (curr.circuitId?.length) {
        const circuitId = curr.circuitId
        if (resultArr.find((ex_item: any) => ex_item.circuitId === circuitId)) {
          return resultArr.map((ex_item: any) => {
            if (ex_item.circuitId === circuitId) {
              return {
                ...ex_item,
                exercises: ex_item.exercises.concat(curr)
              }
            }
          })
        } else {
          return resultArr.concat({
            circuitId,
            orderInRoutine: curr.orderInRoutine,
            sets: curr.sets,
            rest: curr.rest,
            exercises: [curr]
          })
        }
      }
    }, [])
    const detailMappedExercises = [...nonGrouped, ...grouped].sort((a, b) => a.orderInRoutine - b.orderInRoutine)
    return detailMappedExercises

  } else {
    return []
  }
}

// function exerciseDetailMap(exercises: Array<RoutineExerciseType> | undefined, detailsArray: Array<ExerciseType>, section: string) {
//   if (exercises) {
//     return exercises.filter((workoutExercise) => workoutExercise.section === section).map((item) => {
//       const itemId = item.exerciseId
//       const exerciseDetail = detailsArray.find(detail => detail.id === itemId)
//       return {
//         ...item,
//         ...exerciseDetail,
//       }
//     })
//   } else {
//     return []
//   }
// }

type ExerciseDetailProps = {
  routineId?: string;
  id?: string;
  name?: string;
  orderInRoutine: number;
}

type ExercisePanelProps = {
  exerciseDetailsArray: Array<ExerciseDetailProps>;
  section: string;
}

type ExercisesPanelProps = {
  exerciseDetailsArray: Array<ExerciseDetailProps>;
}

function ExercisesPanel({ exerciseDetailsArray }: ExercisesPanelProps) {
  if (exerciseDetailsArray.length) {
    // console.log(exerciseDetailsArray)
    return (
      <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.625rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
        {exerciseDetailsArray.map((exercise: any, idx) => {
          if (exercise.circuitId) {
            return (
              <div
                key={`${exercise.routineId}-${exercise.circuitId}-${idx}`}
                className="flex flex-col gap-2 shadow-inner border-2 border-dashed p-1 rounded-md *:content-center snap-start"
              >
                <div className="text-sm font-medium">Circuit of {exercise.sets} rounds</div>
                {exercise.exercises.map((ex_item: any, idx: number) => (
                  <div
                    key={`${exercise.routineId}-${ex_item.id}-${idx}`}
                    className="flex shadow-md rounded-md *:content-center bg-white snap-start"
                  >
                    <div className="bg-slate-400 rounded-md text-white size-16 min-w-16 text-center">Image</div>
                    <div className="flex flex-col">
                      <div className="px-3 text-sm/6 font-medium max-w-[100%-6rem] truncate">{ex_item.name}</div>
                      <div className="px-3 flex flex-wrap max-w-full gap-4">
                        <div className="flex flex-col justify-between">
                          <label className="text-xs self-start font-medium">Target</label>
                          <p className="w-10 text-sm h-5">{ex_item.target}</p>
                        </div>
                        {ex_item.target === "reps" ? (
                          <div className="flex flex-col justify-between">
                            <label className="text-xs self-start font-medium">Reps</label>
                            <p className="w-10 text-sm h-5">{ex_item.reps}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-between">
                            <label className="text-xs self-start font-medium">Time</label>
                            <p className="w-fit text-sm h-5">{ex_item.time}</p>
                          </div>
                        )}
                        {ex_item.notes ? (
                          <div className="flex flex-col justify-between">
                            <label className="text-xs self-start font-medium">Notes</label>
                            <p className="w-fit text-sm h-5">{ex_item.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-sm self-end font-medium">Rest {exercise.rest} between rounds</div>
              </div>
            )
          } else {
            return (
              <div
                key={`${exercise.routineId}-${exercise.id}-${idx}`}
                className="flex shadow-md rounded-md *:content-center bg-white snap-start"
              >
                <div className="bg-slate-400 rounded-md text-white size-16 min-w-16 text-center">Image</div>
                <div className="flex flex-col">
                  <div className="px-3 text-sm/6 font-medium max-w-[100%-6rem] truncate">{exercise.name}</div>
                  <div className="px-3 flex flex-wrap max-w-full gap-4">
                    <div className="flex flex-col justify-between">
                      <label className="text-xs self-start font-medium">Sets</label>
                      <p className="w-10 text-sm h-5">{exercise.sets}</p>
                    </div>
                    <div className="flex flex-col justify-between">
                      <label className="text-xs self-start font-medium">Target</label>
                      <p className="w-10 text-sm h-5">{exercise.target}</p>
                    </div>
                    {exercise.target === "reps" ? (
                      <div className="flex flex-col justify-between">
                        <label className="text-xs self-start font-medium">Reps</label>
                        <p className="w-10 text-sm h-5">{exercise.reps}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-between">
                        <label className="text-xs self-start font-medium">Time</label>
                        <p className="w-fit text-sm h-5">{exercise.time}</p>
                      </div>
                    )}
                    <div className="flex flex-col justify-between">
                      <label className="text-xs self-start font-medium">Rest</label>
                      <p className="w-fit text-sm h-5">{exercise.rest}</p>
                    </div>
                    {exercise.notes ? (
                      <div className="flex flex-col justify-between">
                        <label className="text-xs self-start font-medium">Notes</label>
                        <p className="w-fit text-sm h-5">{exercise.notes}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          }
        })}
      </div>
    )
  } else {
    return (
      <div className="text-center text-sm/6 mt-2">{`No Exercises`}</div>
    )
  }
}

function ExercisePanel({ exerciseDetailsArray, section}: ExercisePanelProps) {
  if (exerciseDetailsArray.length) {
    return (
      <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.625rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
        {exerciseDetailsArray.map((exercise, idx) => {
          return (
            <div
              key={`${exercise.routineId}-${exercise.id}-${idx}`}
              className="flex shadow-md rounded-md *:content-center bg-white snap-start"
            >
              <div className="bg-slate-400 rounded-md text-white size-16 min-w-16 text-center">Image</div>
              <div className="py-2 px-3 text-sm/6 font-medium max-w-[100%-6rem] truncate">{exercise.name}</div>
            </div>
          )
        })}
      </div>
    )
  } else {
    return (
      <div className="text-center text-sm/6 mt-2">{`No ${section} Exercises`}</div>
    )
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const workout = await db.routine.findUnique({
    where: { id: params.workoutId },
    include: {
      exercises: true,
    }
  });
  const exerciseIds = workout?.exercises?.map(item => item.exerciseId)
  const exercises = await db.exercise.findMany({
    where: {
      id: {
        in: exerciseIds
      }
    }
  });
  // console.log('loader workout', workout, 'loader exercises', exercises)
  const exerciseDetails = exerciseDetailsMap(workout?.exercises, exercises)
  // const exerciseDetailss = {
  //   warmup: exerciseDetailMap(workout?.exercises, exercises, "warmup"),
  //   main: exerciseDetailMap(workout?.exercises, exercises, "main"),
  //   cooldown: exerciseDetailMap(workout?.exercises, exercises, "cooldown"),
  // }
  return json({
    workout: {
      ...workout,
      owns: workout?.userId === user.id,
    },
    exerciseDetails,
    // exerciseDetailss
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "deleteWorkout": {
      return validateForm(
        formData,
        deleteWorkoutSchema,
        async ({ workoutId }) => {
          const workout = await getWorkout(workoutId);

          if (workout !== null && workout.userId !== user.id) {
            throw json(
              { message: "This workout routine is not yours, so you cannot delete it."},
              { status: 401 }
            )
          }
          deleteWorkout(workoutId)
          return redirect("/app/workouts");
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

export default function WorkoutDetail() {
  const data = useLoaderData<typeof loader>();
  const deleteWorkoutFetcher = useFetcher<deleteWorkoutFetcherType>();

  return (
    <div className="p-6 md:p-8 flex flex-col h-full gap-y-3">
      {/* Back and Context Menu */}
      <div className="flex justify-between">
        <Link to="/app/workouts">
          <ArrowLeft className="hover:text-accent" />
        </Link>
        {data.workout?.owns ? (
          <Popover>
            {({ open }) => (
              <>
                <PopoverButton>
                  <ContextMenuIcon className="hover:text-accent" />
                </PopoverButton>
                <AnimatePresence>
                  {open && (
                    <PopoverPanel
                      static
                      as={motion.div}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      anchor={{ to: 'bottom end', gap: '8px', }}
                      className="flex flex-col rounded-md bg-white text-sm/6 shadow-md p-0.5 border gap-1"
                    >
                      <Link to={`/app/workouts/edit?id=${data.workout?.id}`} className="flex items-center gap-1 hover:bg-slate-200 hover:rounded-md p-1">
                        <PencilIcon className="h-4" />
                        Edit
                      </Link>
                      <deleteWorkoutFetcher.Form
                        method="post"
                        onSubmit={(event) => {
                          if(!confirm("Are you sure you want to delete this workout?")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="workoutId" value={data.workout?.id} />
                        <button
                          name="_action"
                          value="deleteWorkout"
                          className="flex items-center gap-1 hover:bg-slate-200 hover:rounded-md p-1"
                        >
                          <TrashIcon className="h-4" />
                          Delete
                        </button>
                        <ErrorMessage>{deleteWorkoutFetcher.data?.errors?.workoutId}</ErrorMessage>
                      </deleteWorkoutFetcher.Form>
                      
                    </PopoverPanel>
                  )}
                </AnimatePresence>
              </>
            )}
          </Popover>
        ) : null}
      </div>
      {/* Title */}
      <div className="font-semibold text-2xl select-none">{data.workout?.name}</div>
      {/* Workout Card */}
      <>
        <div
          className={clsx(
            "flex gap-3 h-1/3 *:h-full",
            "*:flex-1"
          )}
        >
          <div
            className="bg-slate-50 bg-cover rounded-[20px] shadow-md text-center content-end sm:bg-center lg:flex-none lg:w-2/3 lg:rounded-lg"
            style={{backgroundImage: `url(${crunchGirl})`}}
          >
            <div className={clsx(
              "flex justify-around mb-6 *:font-semibold *:flex *:flex-col *:leading-5",
              "text-lg text-white *:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,0.8)] *:items-center"
            )}>
              <div>
                <ClockIcon />
                <div>40</div>
                <div>min</div>
              </div>
              <div>
                <FireIcon />
                <div>200</div>
                <div>kcal</div>
              </div>
              <div>
                <BarsIcon />
                <div>6</div>
                <div>level</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col h-full gap-3 *:flex-1 *:rounded-lg">
            <div className="flex-col py-2 px-4 shadow-md">
              <div className="font-semibold">Description</div>
              <div>{data.workout.description}</div>
            </div>
            <div className="content-center bg-slate-50 rounded-full shadow-md active:scale-95 hover:cursor-pointer">
              <div className="flex h-12 w-full gap-3 justify-between px-8">
                <div className="select-none font-semibold self-center text-xl">Start Workout</div>
                <div className="bg-slate-400 rounded-full p-3"><PlayIcon /></div>
              </div>
            </div>
          </div>
        </div>
      
      </>
      {/* Start Workout */}
      <div className="flex lg:hidden h-12 items-center justify-between bg-slate-50 rounded-full shadow-md active:scale-95 hover:cursor-pointer">
        <div className="size-12"></div>
        <div className="select-none font-semibold self-center">Start Workout</div>
        <div className="bg-slate-400 rounded-full p-3"><PlayIcon /></div>
      </div>
      {/* Exercises */}
      <div className="flex-1 flex w-full justify-center h-2/5 bg-slate-50 rounded-lg shadow-md">
        <div className="w-full h-full pt-2">
          <div className="h-full">
            <div className="py-1 px-4 text-sm/6 font-semibold ">Exercises</div>
            <div className="mt-2 h-full px-3 pb-2">
              <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} />
            </div>
          </div>
          {/* <TabGroup className="h-full">
            <TabList className="flex justify-between sm:justify-normal px-4">
              {tabOptions.map((option, idx) => (
                <Tab
                  key={`${option}-${idx}`}
                  className={clsx(
                    "py-1 px-3 text-sm/6 font-semibold focus:outline-none",
                    "data-[selected]:border-b-2 data-[selected]:border-accent data-[selected]:text-accent data-[selected]:data-[hover]:border-accent",
                    "data-[selected]:data-[hover]:rounded-none data-[selected]:data-[hover]:bg-slate-50 data-[hover]:bg-slate-200 data-[hover]:rounded-full"
                  )}
                >
                  {option}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="mt-2 h-full px-3 pb-2">
              <TabPanel>
                <ExercisePanel exerciseDetailsArray={data.exerciseDetailss?.warmup} section="Warmup" />
              </TabPanel>
              <TabPanel className="h-full">
                <ExercisePanel exerciseDetailsArray={data.exerciseDetailss?.main} section="Main" />
              </TabPanel>
              <TabPanel>
                <ExercisePanel exerciseDetailsArray={data.exerciseDetailss?.cooldown} section="Cooldown" />
              </TabPanel>
            </TabPanels>
          </TabGroup> */}
        </div>
      </div>
    </div>
  );
}