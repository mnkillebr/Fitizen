import { useEffect, } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, data, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { ClockIcon, FireIcon, PlayIcon, BarsIcon, ContextMenuIcon, TrashIcon, PencilIcon, ChevronLeft, CalendarIcon } from "images/icons";
import db from "~/db.server";
import { Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Exercise as ExerciseType, Recurrence, RoutineExercise as RoutineExerciseType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { ErrorMessage } from "~/components/form";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";
import { deleteWorkout, getWorkout, getWorkoutLogsById } from "~/models/workout.server";
import { createUserWorkoutSession } from "~/models/calendar.server";
import { useOpenDialog } from "~/components/Dialog";
import EventForm from "~/components/EventForm";
import { convertObjectToFormData } from "~/utils/misc";
import { format, setHours, setMinutes } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { generateMuxThumbnailToken, generateMuxVideoToken } from "~/mux-tokens.server";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { newSavedWorkoutLogCookie } from "~/cookies";
import { WorkoutCompleted, workoutSuccessDialogOptions } from "~/components/WorkoutCompleted";
import { Video } from "lucide-react";
import { ExerciseDialog, exerciseDialogOptions } from "~/components/ExerciseDialog";

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

interface ExerciseDetailsType extends ExerciseType {

}

export function exerciseDetailsMap(routineExercises: Array<RoutineExerciseType> | undefined, exerciseDetails: Array<ExerciseDetailsType>) {
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
              exercises: [...item.exercises, curr].sort((a, b) => a.orderInRoutine - b.orderInRoutine)
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
  openDialog: (component: React.ReactNode, options: any ) => void;
}

function ExercisesPanel({ exerciseDetailsArray, openDialog }: ExercisesPanelProps) {
  if (exerciseDetailsArray.length) {
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
                    <div
                      className="relative group cursor-pointer shrink-0"
                      onClick={() => openDialog(
                        <ExerciseDialog exercise={ex_item} />,
                        exerciseDialogOptions(ex_item.name)
                      )}
                    >
                      <img
                        src={ex_item.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/cld-sample-3.jpg"}
                        className="h-16 rounded-sm transition-opacity duration-300 group-hover:opacity-85"
                      />
                      <Video className="absolute w-full size-4 inset-y-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex flex-col overflow-x-hidden">
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
                        <div className="flex flex-col justify-between">
                          <label className="text-xs self-start font-medium">RPE</label>
                          <p className="w-fit text-sm h-5">{ex_item.rpe}</p>
                        </div>
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
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => openDialog(
                    <ExerciseDialog exercise={exercise} />,
                    exerciseDialogOptions(exercise.name)
                  )}
                >
                  <img
                    src={exercise.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/cld-sample-3.jpg"}
                    className="h-16 rounded-sm transition-opacity duration-300 group-hover:opacity-85"
                  />
                  <Video className="absolute w-full size-4 inset-y-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex flex-col overflow-x-hidden">
                  <div className="px-3 text-sm/6 font-medium max-w-full truncate">{exercise.name}</div>
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
                    <div className="flex flex-col justify-between">
                      <label className="text-xs self-start font-medium">RPE</label>
                      <p className="w-fit text-sm h-5">{exercise.rpe}</p>
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


export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const workoutId = params.workoutId as string;
  const workout = await db.routine.findUnique({
    where: { id: workoutId },
    include: {
      exercises: {
        include: {
          exercise: true,
        }
      }
    }
  });

  const tokenMappedExercises = workout?.exercises.map(ex_item => {
    const smartCrop = () => {
      let crop = ["Lateral Lunge", "Band Assisted Leg Lowering", "Ankle Mobility", "Kettlebell Swing", "Half Kneel Kettlebell Press"]
      if (crop.includes(ex_item.exercise.name)) {
        return "smartcrop"
      } else {
        return undefined
      }
    }
    const heightAdjust = () => {
      let adjustments = ["Pushup", "Kettlebell Swing", "Kettlebell Renegade Row", "Half Kneel Kettlebell Press"]
      let expand = ["Lateral Bound", "Mini Band Walks"]
      if (adjustments.includes(ex_item.exercise.name)) {
        return "481"
      } else if (expand.includes(ex_item.exercise.name)) {
        return "1369"
      } else {
        return undefined
      }
    }
    const thumbnailToken = generateMuxThumbnailToken(ex_item.exercise.muxPlaybackId, smartCrop(), heightAdjust())
    const videoToken = generateMuxVideoToken(ex_item.exercise.muxPlaybackId)
    return {
      ...ex_item,
      ...ex_item.exercise,
      videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${ex_item.exercise.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
    }
  }) ?? []

  const exerciseDetails = exerciseDetailsMap(workout?.exercises, tokenMappedExercises)
  const logs = await getWorkoutLogsById(user.id, workoutId)
  const cookieHeader = request.headers.get("cookie");
	const newlogId = await newSavedWorkoutLogCookie.parse(cookieHeader);
  if (!workout) {
    throw data(
      { message: "The workout you are attempting to view does not exist"},
      { status: 404, statusText: "Workout Not Found" }
    )
  }
  return {
    workout: {
      ...workout,
      owns: workout?.userId === user.id,
    },
    exerciseDetails,
    logs,
    newLogSaved: logs.find(log => log.id === newlogId),
    role: user.role,
  };
}

const themeSchema = z.object({
  darkMode: z.string(),
})

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

          if (workout !== null && workout.userId && workout.userId !== user.id) {
            throw data(
              { message: "This workout routine is not yours, so you cannot delete it."},
              { status: 401 }
            )
          }
          deleteWorkout(workoutId)
          return redirect("/app/workouts");
        },
        (errors) => data({ errors }, { status: 400 })
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
        (errors) => data({ errors }, { status: 400 })
      )
    }
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => data(
          { success: true },
          {
            headers: {
              "Set-Cookie": `fitizen__darkMode=${darkMode}; SameSite=Strict; Path=/`,
            },
          }
        ),
        (errors) => data({ errors }, { status: 400 })
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
  const navigation = useNavigation();
  const isNavigatingWorkouts =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/workouts"
  const isNavigatingLog =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/workouts/log"
  const isNavigatingLogView =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/workouts/logview"
  // const imageDescriptionScrollContainerRef = useRef<HTMLDivElement>(null);
  // const [imgIndex, setImgIndex] = useState(0);

  // const panelScrollContainerRef = useRef<HTMLDivElement>(null);
  // const [panelIndex, setPanelIndex] = useState(0);
 
  const openDialog = useOpenDialog();
  const submit = useSubmit();

  // const [startWorkout, setStartWorkout] = useState(false)
  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
  }
  // const scrollToImg = (index: number) => {
  //   const scrollContainer = imageDescriptionScrollContainerRef.current;
  //   if (!scrollContainer) return;

  //   scrollContainer.scrollTo({
  //     left: index * scrollContainer.clientWidth,
  //     behavior: 'smooth'
  //   });
  // };

  // const scrollToPanel = (index: number) => {
  //   const scrollContainer = panelScrollContainerRef.current;
  //   if (!scrollContainer) return;

  //   scrollContainer.scrollTo({
  //     left: index * scrollContainer.clientWidth,
  //     behavior: 'smooth'
  //   });
  // };

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
            defaultTab: "Workout",
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
      {
        title: {
          text:"Schedule Workout",
          className: "text-foreground",
        },
        closeButton: {
          show: true,
        },
      }
    )
  }

  useEffect(() => {
    if (data.newLogSaved) {
      openDialog(<WorkoutCompleted workoutName={data.workout.name} />, workoutSuccessDialogOptions)
    }
  }, [])
  
  return (
    <div
      className={clsx(
        "px-2 md:px-3 flex flex-col h-[calc(100vh-5rem)]",
        "gap-y-4 select-none bg-background text-foreground",
        // "relative"
      )}
    >
      {/* Header Section */}
      <div className="flex-none">
        {/* Back and Context Menu */}
        <div className="flex justify-between mb-2">
          <div className="flex gap-4 items-center">
            <Link
              to="/app/workouts"
              className={clsx(
                "flex items-center text-primary-foreground text-sm bg-primary",
                "py-2 pl-2 pr-3 rounded-md hover:bg-primary/90 shadow",
                isNavigatingWorkouts ? "animate-pulse" : ""
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="">Back</div>
            </Link>
            <div className="flex-none font-semibold">
              {data.workout.name}
            </div>
          </div>
          <Popover>
            {({ open }) => (
              <>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger>
                    <PopoverButton>
                      <ContextMenuIcon className="hover:text-primary" />
                    </PopoverButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    Workout Menu
                  </TooltipContent>
                </Tooltip>
                
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
                      {data.workout?.owns || data.role === "admin" ? (
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
        {/* <div className="font-semibold text-2xl select-none mb-2">{data.workout?.name}</div> */}
        {/* Workout Image && Description */}
        {/* <Tabs defaultValue="overview" className="w-full lg:hidden">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div
              className={clsx(
                "h-72 rounded-md shadow-md text-center",
                "content-end sm:bg-center lg:flex-none lg:rounded-lg mb-3",
                "bg-background-muted bg-cover bg-center dark:shadow-border-muted"
              )}
              style={{backgroundImage: `url(https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/tfvpajxu5dj9s5xcac7t)`}}
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
                "h-72 p-4 bg-slate-50 rounded-md shadow-md mb-3",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              <div className="font-semibold">Description</div>
              <div>{data.workout.description}</div>
            </div>
          </TabsContent>
        </Tabs> */}
        <div className="relative h-[332px] mb-3 group lg:hidden">
          <div
            className={clsx(
              "absolute inset-0 transition-opacity duration-300 group-hover:opacity-30",
              "h-full w-full shadow-md lg:shadow-none rounded-md text-center content-end",
              "dark:border dark:border-border-muted dark:shadow-border-muted bg-cover bg-center"
            )}
            style={{backgroundImage: `url(https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/tfvpajxu5dj9s5xcac7t)`}}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="font-semibold mb-2">Description</div>
            <div className="text-muted-foreground text-sm">{data.workout.description}</div>
          </div>
        </div>
        <div className="hidden lg:flex gap-4">
          <div
            className={clsx(
              "flex-1 w-full h-[336px] shadow-md text-center",
              "content-end bg-center rounded-lg",
              "bg-background-muted bg-cover bg-center dark:shadow-border-muted"
            )}
            style={{backgroundImage: `url(https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/tfvpajxu5dj9s5xcac7t)`}}
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
              "flex-1 w-full h-[336px] rounded-lg flex flex-col gap-y-2",
              "dark:shadow-border-muted"
            )}
          >
            <div
              className={clsx(
                "h-3/4 flex-col py-2 px-4 bg-slate-50 rounded-lg shadow-sm",
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
                "bg-slate-50 dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted",
                isNavigatingLog ? "animate-pulse" : ""
              )}
            >
              {/* <div className="size-12"></div> */}
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
                "h-[calc(100vh-36.25rem)] bg-slate-50 rounded-md shadow-md",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
              )}
            >
              <div className="px-1 text-sm/6 font-semibold">Exercises</div>
              <div className="mt-2 max-h-[calc(100%-2.125rem)] overflow-y-auto">
                <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} openDialog={openDialog} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div
              className={clsx(
                "h-[calc(100vh-36.25rem)] bg-slate-50 rounded-md shadow-md",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
              )}
            >
              <div className="px-1 text-sm/6 font-semibold">History</div>
              <div className="mt-2 h-full">
                <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.125rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
                  {data.logs.length ? data.logs.map(log => {
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
                            className={clsx(
                              "text-sm h-5 underline text-primary hover:text-yellow-500",
                              isNavigatingLogView && navigation.location.search === `?id=${log.id}` ? "animate-pulse" : ""
                            )}
                          >
                            View Log
                          </Link>
                        </div>
                      </div>
                    )
                  }) : <div className="text-sm place-self-center mt-4 text-muted-foreground">No workout logs</div>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="hidden lg:flex gap-4">
          <div
            className={clsx(
              "flex-1 h-[calc(100vh-30rem)] bg-slate-50 rounded-lg shadow-md",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
            )}
          >
            <div className="px-1 text-sm/6 font-semibold">Exercises</div>
            <div className="mt-2 max-h-[calc(100%-2.125rem)] overflow-y-auto">
              <ExercisesPanel exerciseDetailsArray={data.exerciseDetails} openDialog={openDialog} />
            </div>
          </div>
          <div
            className={clsx(
              "flex-1 h-[calc(100vh-30rem)] bg-slate-50 rounded-lg shadow-md",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted py-4 px-3"
            )}
          >
            <div className="px-1 text-sm/6 font-semibold">History</div>
            <div className="mt-2 h-full">
              <div className="flex flex-col gap-y-2 content-center max-h-[calc(100%-2.125rem)] snap-y snap-mandatory overflow-y-auto px-1 pb-1">
                {data.logs.length ? data.logs.map(log => {
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
                          className={clsx(
                            "text-sm h-5 underline text-primary hover:text-yellow-500",
                            isNavigatingLogView && navigation.location.search === `?id=${log.id}` ? "animate-pulse" : ""
                          )}
                        >
                          View Log
                        </Link>
                      </div>
                    </div>
                  )
                }) : <div className="text-sm place-self-center mt-4 text-muted-foreground">No workout logs</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}