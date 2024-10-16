import { useEffect, useMemo, useRef, useState } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { ArrowLeft, ClockIcon, FireIcon, PlayIcon, BarsIcon, ContextMenuIcon, TrashIcon, PencilIcon, ChevronLeft, CalendarIcon } from "images/icons";
import db from "~/db.server";
import crunchGirl from "images/jonathan-borba-lrQPTQs7nQQ-unsplash copy.jpg";
import { Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Exercise as ExerciseType, Recurrence, RoutineExercise as RoutineExerciseType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { Button, ErrorMessage } from "~/components/form";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";
import { deleteWorkout, getWorkout, getWorkoutLogsById } from "~/models/workout.server";
import Stopwatch from "~/components/Stopwatch";
import { createUserWorkoutSession, getAllCoaches } from "~/models/calendar.server";
import { useOpenDialog } from "~/components/Dialog";
import EventForm from "~/components/EventForm";
import { convertObjectToFormData } from "~/utils/misc";
import { format, setHours, setMinutes } from "date-fns";
import CustomCarousel from "~/components/CustomCarousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

const deleteWorkoutSchema = z.object({
  workoutId: z.string(),
})
const scheduleWorkoutSchema = z.object({
  workoutId: z.string(),
  id: z.string().optional(),
  recurrence: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
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
        circuitId: item.circuitId ? item.circuitId : ""
      }
    })
    const nonGrouped = detailedExercises.filter(ex => !ex.circuitId)
    const grouped = detailedExercises.filter(ex => ex.circuitId).reduce((result: any, curr: any) => {
      let resultArr = result
      if (resultArr.length && resultArr.find((item: any) => item.circuitId === curr.circuitId)) {
        resultArr = resultArr.map((item: any) => {
          if (item.circuitId === curr.circuitId) {
            return {
              ...item,
              exercises: [...item.exercises, curr]
            }
          } else {
            return item
          }
        })
        return resultArr
      } else {
        return resultArr.concat({
          circuitId: curr.circuitId,
          orderInRoutine: curr.orderInRoutine,
          sets: curr.sets,
          rest: curr.rest,
          exercises: [curr]
        })
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
      <div className="h-full flex flex-col gap-y-2 content-center snap-y snap-mandatory px-1 pb-1">
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
                    className="flex shadow-md rounded-md *:content-center bg-white dark:bg-background dark:shadow-sm dark:shadow-border-muted snap-start"
                  >
                    {/* <div className="bg-slate-400 rounded-md text-white size-16 min-w-16 text-center">Image</div> */}
                    <img
                      src="https://res.cloudinary.com/dqrk3drua/image/upload/v1724263117/cld-sample-3.jpg"
                      className="h-16 rounded-sm"
                    />
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
                className="flex shadow-md rounded-md *:content-center bg-white dark:bg-background dark:shadow-sm dark:shadow-border-muted snap-start"
              >
                {/* <div className="bg-slate-400 rounded-md text-white size-16 min-w-16 text-center">Image</div> */}
                <img
                  src="https://res.cloudinary.com/dqrk3drua/image/upload/v1724263117/cld-sample-3.jpg"
                  className="h-16 rounded-sm"
                />
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
  const workoutId = params.workoutId as string;
  const workout = await db.routine.findUnique({
    where: { id: workoutId },
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
  const logs = await getWorkoutLogsById(user.id, workoutId)
  // const exerciseDetailss = {
  //   warmup: exerciseDetailMap(workout?.exercises, exercises, "warmup"),
  //   main: exerciseDetailMap(workout?.exercises, exercises, "main"),
  //   cooldown: exerciseDetailMap(workout?.exercises, exercises, "cooldown"),
  // }
  if (!workout) {
    throw json(
      { message: "The workout you are attempting to view does not exist"},
      { status: 404, statusText: "Workout Not Found" }
    )
  }
  return json({
    workout: {
      ...workout,
      owns: workout?.userId === user.id,
    },
    exerciseDetails,
    logs,
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
    case "schedule_workout": {
      return validateForm(
        formData,
        scheduleWorkoutSchema,
        async (data) => {
          const {
            workoutId,
            ...rest
          } = data
          const sessionObj = {
            ...rest,
            recurrence: rest.recurrence === "daily" ? Recurrence.DAILY : rest.recurrence === "weekly" ? Recurrence.WEEKLY : rest.recurrence === "monthly" ? Recurrence.MONTHLY : undefined,
          }
          return createUserWorkoutSession(user.id, workoutId, sessionObj)
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

  const imageDescriptionScrollContainerRef = useRef<HTMLDivElement>(null);
  const [imgIndex, setImgIndex] = useState(0);

  const panelScrollContainerRef = useRef<HTMLDivElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);

  const openDialog = useOpenDialog();
  const submit = useSubmit();

  // const [startWorkout, setStartWorkout] = useState(false)
  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
  }
  const scrollToImg = (index: number) => {
    const scrollContainer = imageDescriptionScrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      left: index * scrollContainer.clientWidth,
      behavior: 'smooth'
    });
  };

  const scrollToPanel = (index: number) => {
    const scrollContainer = panelScrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      left: index * scrollContainer.clientWidth,
      behavior: 'smooth'
    });
  };

  const handleAddToCalendar = (formObj: any) => {
    const formData = convertObjectToFormData(formObj)
    formData.append("_action", "schedule_workout")
    submit(formData, { method: "post" })
  }

  const addToCalendar = () => {
    const time = new Date()
    openDialog(
      <EventForm
        selectedDateTime={setHours(setMinutes(time, 0), parseInt(format(time, 'HH')) + 2)}
        submitEvent={handleAddToCalendar}
        formOptions={{
          defaults: {
            defaultTab: 1,
            workoutId: data.workout.id,
          },
          userWorkouts: [
            {
              id: data.workout.id,
              name: data.workout.name,
            },
          ],
        }}
      />,
      "Schedule Workout"
    )
  }

  useEffect(() => {
    const imgScrollContainer = imageDescriptionScrollContainerRef.current;
    const panelScrollContainer = panelScrollContainerRef.current;
    if (!imgScrollContainer) return;
    if (!panelScrollContainer) return;


    const handleScrollImg = () => {
      const scrollLeft = imgScrollContainer.scrollLeft;
      const width = imgScrollContainer.clientWidth;
      
      const newIndex = Math.round(scrollLeft / width);
      setImgIndex(newIndex);
    };
    const handleScrollPanel = () => {
      const scrollLeft = panelScrollContainer.scrollLeft;
      const width = panelScrollContainer.clientWidth;
      
      const newIndex = Math.round(scrollLeft / width);
      setPanelIndex(newIndex);
    };

    imgScrollContainer.addEventListener('scroll', handleScrollImg);
    panelScrollContainer.addEventListener('scroll', handleScrollPanel);
    return () => {
      imgScrollContainer.removeEventListener('scroll', handleScrollImg)
      panelScrollContainer.removeEventListener('scroll', handleScrollPanel)
    };
  }, []);
  
  return (
    <div
      className={clsx(
        "px-5 py-6 md:px-7 md:py-8 flex flex-col h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.75rem)]",
        "gap-y-4 select-none bg-background text-foreground"
      )}
    >
      {/* Header Section */}
      <div className="flex-none">
        {/* Back and Context Menu */}
        <div className="flex justify-between">
          <Link to="/app/workouts">
            <ChevronLeft className="hover:text-primary" />
          </Link>
          <Popover>
            {({ open }) => (
              <>
                <PopoverButton>
                  <ContextMenuIcon className="hover:text-primary" />
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
                      className={clsx(
                        "flex flex-col rounded-md text-sm/6 shadow-md p-0.5 border gap-1",
                        "bg-background-muted dark:border dark:border-border-muted text-foreground"
                      )}
                    >
                      <button className="flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-primary/20 hover:rounded-md p-1" onClick={addToCalendar}>
                        <CalendarIcon className="h-4" />
                        Add to Calendar
                      </button>
                      {data.workout?.owns ? (
                        <>
                          <Link to={`/app/workouts/edit?id=${data.workout?.id}`} className="flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-primary/20 hover:rounded-md p-1">
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
                              className="flex items-center gap-1 w-full hover:bg-slate-200 dark:hover:bg-primary/20 hover:rounded-md p-1"
                            >
                              <TrashIcon className="h-4" />
                              Delete
                            </button>
                            <ErrorMessage>{deleteWorkoutFetcher.data?.errors?.workoutId}</ErrorMessage>
                          </deleteWorkoutFetcher.Form>
                        </>
                      ) : null}
                    </PopoverPanel>
                  )}
                </AnimatePresence>
              </>
            )}
          </Popover>
        </div>
        {/* Title */}
        <div className="font-semibold text-2xl select-none mb-2 px-">{data.workout?.name}</div>
        {/* Workout Image && Description */}
        <Tabs defaultValue="overview" className="w-full lg:hidden">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div
              className={clsx(
                "h-60 lg:h-72 rounded-md shadow-md text-center",
                "content-end sm:bg-center lg:flex-none lg:rounded-lg mb-3",
                "bg-background-muted bg-cover bg-center dark:shadow-border-muted"
              )}
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
          </TabsContent>
          <TabsContent value="description">
            <div
              className={clsx(
                "h-60 p-4 bg-slate-50 rounded-md shadow-md mb-3",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              <div className="font-semibold">Description</div>
              <div>{data.workout.description}</div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="hidden lg:flex gap-4">
          <div
            className={clsx(
              "flex-1 w-full h-72 shadow-md text-center",
              "content-end bg-center rounded-lg",
              "bg-background-muted bg-cover bg-center dark:shadow-border-muted"
            )}
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
          <div
            className={clsx(
              "flex-1 w-full h-72 rounded-lg flex flex-col gap-y-2",
              "dark:shadow-border-muted"
            )}
          >
            <div
              className={clsx(
                "h-2/3 flex-col py-2 px-4 bg-slate-50 rounded-lg shadow-sm",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              <div className="font-semibold">Description</div>
              <div>{data.workout.description}</div>
            </div>
            <Link
              to={`/app/workouts/log?id=${data.workout?.id}`}
              className={clsx(
                "flex h-1/3 items-center justify-center rounded-lg shadow-sm active:scale-95 hover:cursor-pointer",
                "bg-slate-50 dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
              // onClick={() => setStartWorkout(!startWorkout)}
            >
              <div className="size-12"></div>
              <div className="select-none font-semibold self-center mr-4">Start Workout</div>
              <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
            </Link>
          </div>
        </div>
        {/* Start Workout */}
        <Link
          to={`/app/workouts/log?id=${data.workout?.id}`}
          className={clsx(
            "flex lg:hidden h-12 items-center justify-between bg-slate-50",
            "shadow-md active:scale-95 hover:cursor-pointer dark:bg-background-muted",
            "dark:border dark:border-border-muted dark:shadow-border-muted",
            "rounded-full"
          )}
          // onClick={() => setStartWorkout(!startWorkout)}
        >
          <div className="size-12 invisible"></div>
          <div className="select-none font-semibold self-center">Start Workout</div>
          <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
        </Link>
      </div>
      {/* Exercises and Logs */}
      <div className="flex-1">
        <Tabs defaultValue="exercises" className="w-full lg:hidden">
          <TabsList>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="exercises">
            <div
              className={clsx(
                "h-[calc(100vh-35.875rem)] md:h-[calc(100vh-36.875rem)] bg-slate-50 rounded-md shadow-md",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
              )}
            >
              <div className="px-1 text-sm/6 font-semibold">Exercises</div>
              <div className="mt-2 max-h-[calc(100%-2.125rem)] overflow-y-auto">
                <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div
              className={clsx(
                "h-[calc(100vh-35.875rem)] md:h-[calc(100vh-36.875rem)] bg-slate-50 rounded-md shadow-md",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
              )}
            >
              <div className="px-1 text-sm/6 font-semibold">History</div>
              <div className="mt-2 h-full">
                <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.125rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
                  {data.logs.map(log => {
                    return (
                      <div key={log.id} className="flex flex-col shadow-md dark:shadow-sm dark:shadow-border-muted rounded-md *:content-center bg-white snap-start dark:bg-background">
                        <div className="bg-slate-400 dark:bg-zinc-700 w-full rounded-t-md flex justify-between px-3 py-1 *:text-white">
                          <label className="text-sm font-medium w-20">Date</label>
                          <label className="text-sm font-medium w-24">Duration</label>
                          <label className="text-sm font-medium invisible">View</label>
                        </div>
                        <div className="w-full rounded-b-md flex justify-between px-3 py-1">
                          <p className="text-sm h-5 w-20">{new Date(log.date).toLocaleDateString()}</p>
                          <p className="text-sm h-5 w-24">{formatDuration(parseInt(log.duration))}</p>
                          <Link
                            to={`/app/workouts/logview?id=${log.id}`}
                            className="text-sm h-5 underline text-primary hover:text-yellow-500"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="hidden lg:flex gap-4">
          <div
            className={clsx(
              "flex-1 h-[calc(100vh-31.125rem)] bg-slate-50 rounded-lg shadow-md",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
            )}
          >
            <div className="px-1 text-sm/6 font-semibold">Exercises</div>
            <div className="mt-2 max-h-[calc(100%-2.125rem)] overflow-y-auto">
              <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} />
            </div>
          </div>
          <div
            className={clsx(
              "flex-1 h-[calc(100vh-31.125rem)] bg-slate-50 rounded-lg shadow-md",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
            )}
          >
            <div className="px-1 text-sm/6 font-semibold">History</div>
            <div className="mt-2 h-full">
              <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.125rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
                {data.logs.map(log => {
                  return (
                    <div key={log.id} className="flex flex-col shadow-md dark:shadow-sm dark:shadow-border-muted rounded-md *:content-center bg-white dark:bg-background snap-start">
                      <div className="bg-slate-400 dark:bg-zinc-700 w-full rounded-t-md flex justify-between px-3 py-1 *:text-white">
                        <label className="text-sm font-medium w-20">Date</label>
                        <label className="text-sm font-medium w-24">Duration</label>
                        <label className="text-sm font-medium invisible">View</label>
                      </div>
                      <div className="w-full rounded-b-md flex justify-between px-3 py-1">
                        <p className="text-sm h-5 w-20">{new Date(log.date).toLocaleDateString()}</p>
                        <p className="text-sm h-5 w-24">{formatDuration(parseInt(log.duration))}</p>
                        <Link
                          to={`/app/workouts/logview?id=${log.id}`}
                          className="text-sm h-5 underline text-primary hover:text-yellow-500"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        {/* <CustomCarousel
          slides={[
            (
              <div
                className={clsx(
                  "h-full w-full lg:flex-none bg-slate-50 mb-3",
                  "dark:bg-background-muted dark:border dark:border-border-muted",
                  "dark:shadow-border-muted rounded-md shadow-md overflow-y-hidden"
                )}
              >
                <div className="py-1 px-4 text-sm/6 font-semibold pt-2">Exercises</div>
                <div className="h-full flex flex-col mt-2 overflow-y-auto gap-y-2 px-3 pb-1">
                  <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} />
                </div>
              </div>
            ),
            (
              <div
                className={clsx(
                  "h-full w-full lg:flex-none bg-slate-50 mb-3",
                  "dark:bg-background-muted dark:border dark:border-border-muted",
                  "dark:shadow-border-muted rounded-md shadow-md overflow-y-hidden"
                )}
              >
                <div className="py-1 px-4 text-sm/6 font-semibold">History</div>
                <div className="mt-2 h-full px-3 pb-2">
                  <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.625rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
                    {data.logs.map(log => {
                      return (
                        <div key={log.id} className="flex flex-col shadow-md rounded-md *:content-center bg-white snap-start">
                          <div className="bg-slate-400 w-full rounded-t-md flex justify-between px-3 py-1 *:text-white">
                            <label className="text-sm font-medium w-20">Date</label>
                            <label className="text-sm font-medium w-24">Duration</label>
                            <label className="text-sm font-medium invisible">View</label>
                          </div>
                          <div className="w-full rounded-b-md flex justify-between px-3 py-1">
                            <p className="text-sm h-5 w-20">{new Date(log.date).toLocaleDateString()}</p>
                            <p className="text-sm h-5 w-24">{formatDuration(parseInt(log.duration))}</p>
                            <Link
                              to={`/app/workouts/logview?id=${log.id}`}
                              className="text-sm h-5 underline text-primary hover:text-yellow-500"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          ]}
        /> */}
      </div>
    </div>
  );
}