import { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Link, useFetcher, useLoaderData, useLocation, useNavigation, useSearchParams, useSubmit, } from '@remix-run/react';
import { z } from 'zod';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { getAllExercises, getAllExercisesPaginated, getExercisesById } from '~/models/exercise.server';
import { AnimatePresence, motion } from "framer-motion";
import { workoutFormDataToObject, } from '~/utils/misc';
import { ChevronDownIcon, PlusCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { validateForm, validateObject } from '~/utils/validation';
import clsx from 'clsx';
import { PrimaryButton } from '~/components/form';
import Tooltip from '~/components/Tooltip';
import { requireLoggedInUser } from '~/utils/auth.server';
import { getWorkoutWithExercises, updateUserWorkoutWithExercises } from '~/models/workout.server';
import { Exercise } from '../exercises';
import { Exercise as ExerciseType, RoutineExercise as RoutineExerciseType } from "@prisma/client";
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Search, Video } from 'lucide-react';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { generateMuxThumbnailToken, generateMuxVideoToken } from '~/mux-tokens.server';
import { useSidebar } from '~/components/ui/sidebar';
import { EXERCISE_ITEMS_PER_PAGE } from '~/utils/magicNumbers';
import { AppPagination } from '~/components/AppPagination';
import { hash } from '~/cryptography.server';
import { ExerciseDialog, exerciseDialogOptions } from '~/components/ExerciseDialog';
import { useOpenDialog } from '~/components/Dialog';
import { Skeleton } from '~/components/ui/skeleton';

const targetOptions = [
  {value: "reps", label: "Repetitions"},
  {value: "time", label: "Time"}
]

const restOptions = [
  {value: "None", label: "None"},
  {value: "10 sec", label: "10 sec"},
  {value: "15 sec", label: "15 sec"},
  {value: "20 sec", label: "20 sec"},
  {value: "25 sec", label: "25 sec"},
  {value: "30 sec", label: "30 sec"},
  {value: "35 sec", label: "35 sec"},
  {value: "40 sec", label: "40 sec"},
  {value: "45 sec", label: "45 sec"},
  {value: "50 sec", label: "50 sec"},
  {value: "55 sec", label: "55 sec"},
  {value: "60 sec", label: "60 sec"},
  {value: "90 sec", label: "90 sec"},
  {value: "2 min", label: "2 min"},
  {value: "3 min", label: "3 min"},
  {value: "4 min", label: "4 min"},
  {value: "5 min", label: "5 min"},
]

export function exerciseDetailsMap(routineExercises: Array<RoutineExerciseType> | undefined, exerciseDetails: Array<ExerciseType>, dateId: boolean) {
  if (routineExercises) {
    const detailedExercises = routineExercises.map((item) => {
      const itemId = item.exerciseId
      const exerciseDetail = exerciseDetails.find(detail => detail.id === itemId)
      return {
        ...item,
        ...exerciseDetail,
        id: dateId ? `${item.exerciseId}-${Date.now()}` : item.exerciseId,
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
                exercises: ex_item.exercises.concat(curr).sort((a: any, b: any) => a.orderInRoutine - b.orderInRoutine)
              }
            } else {
              return ex_item
            }
          })
        } else {
          return resultArr.concat({
            circuitId,
            id: circuitId,
            orderInRoutine: curr.orderInRoutine,
            exercises: [curr]
          })
        }
      }
      return resultArr
    }, [])
    const detailMappedExercises = [...nonGrouped, ...grouped].sort((a, b) => a.orderInRoutine - b.orderInRoutine)
    return detailMappedExercises

  } else {
    return []
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const skip = (page - 1) * EXERCISE_ITEMS_PER_PAGE;
  const allExercises = await getAllExercises(query);
  const pageExercises = await getAllExercisesPaginated(query, skip, EXERCISE_ITEMS_PER_PAGE) as { exercises: ExerciseType[]; count: number }
  const totalPages = Math.ceil(pageExercises.count / EXERCISE_ITEMS_PER_PAGE);
  const workoutId = url.searchParams.get("id") as string;
  const workout = await getWorkoutWithExercises(workoutId);
  if (workout !== null && workout.userId && workout.userId !== user.id) {
    throw redirect("/app", 401)
  }
  if (!workout) {
    throw json(
      { message: "The workout you are attempting to edit does not exist"},
      { status: 404, statusText: "Workout Not Found" }
    )
  }
  const tokenMappedExercises = pageExercises ? pageExercises.exercises.map(ex_item => {
    const smartCrop = () => {
      let crop = ["Lateral Lunge", "Band Assisted Leg Lowering", "Ankle Mobility", "Kettlebell Swing", "Half Kneel Kettlebell Press"]
      if (crop.includes(ex_item.name)) {
        return "smartcrop"
      } else {
        return undefined
      }
    }
    const heightAdjust = () => {
      let adjustments = ["Pushup", "Kettlebell Swing", "Kettlebell Renegade Row", "Half Kneel Kettlebell Press"]
      let expand = ["Lateral Bound", "Mini Band Walks"]
      if (adjustments.includes(ex_item.name)) {
        return "481"
      } else if (expand.includes(ex_item.name)) {
        return "1369"
      } else {
        return undefined
      }
    }
    const thumbnailToken = generateMuxThumbnailToken(ex_item.muxPlaybackId, smartCrop(), heightAdjust())
    const videoToken = generateMuxVideoToken(ex_item.muxPlaybackId)
    return {
      ...ex_item,
      videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${ex_item.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
    }
  }) : []
  const exerciseDetails = exerciseDetailsMap(workout?.exercises, allExercises, true)
  const exercisesEtag = hash(JSON.stringify(tokenMappedExercises))
  return json(
    {
      workout,
      exerciseDetails,
      allExercises: tokenMappedExercises,
      page,
      totalPages
    },
    {
      headers: {
        exercisesEtag,
        "Cache-control": "max-age=3300, stale-while-revalidate=3600"
      }
    }
  )
}

// Define Zod schema for form validation
const workoutSchema = z.object({
  workoutName: z.string().min(1, "Workout name is required"),
  workoutDescription: z.string().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    circuitId: z.string().optional(),
    sets: z.string(),
    target: z.string(),
    reps: z.string().optional(),
    time: z.string().optional(),
    rest: z.string(),
    notes: z.string().optional(),
    orderInRoutine: z.string(),
  })).min(1, "You must add at least one exercise"),
});

const themeSchema = z.object({
  darkMode: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const workoutId = url.searchParams.get("id") as string;
  const prevWorkout = await getWorkoutWithExercises(workoutId);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "updateUserWorkout": {
      return validateObject(
        workoutFormDataToObject(formData),
        workoutSchema,
        async (data) => {      
          const workoutName = data.workoutName;
          const workoutDescription = data.workoutDescription as string;
          const mappedExercises = data.exercises.map((exercise: any, idx: number) => ({
            ...exercise,
            exerciseId: exercise.exerciseId.split("-")[0],
            orderInRoutine: parseInt(exercise.orderInRoutine),
          }))
          const prevExercises = prevWorkout?.exercises;
          const newExercises = mappedExercises.reduce((result: any, curr: any) => {
            let resultArr = result
            if (curr) {
              if (prevExercises && !prevExercises.map((prev: any) => prev.exerciseId).includes(curr.exerciseId)) {
                return resultArr.concat(curr)
              }
            }
            return resultArr
          }, []);
          const updatedExercises = mappedExercises.filter((selected: any) => !newExercises.map((ex: any) => ex.exerciseId).includes(selected.exerciseId));
          const deletedExercises = prevExercises ? prevExercises.filter((prev: any) => !newExercises.map((ex: any) => ex.exerciseId).includes(prev.exerciseId) && !updatedExercises.map((ex: any) => ex.exerciseId).includes(prev.exerciseId)) : [];
          const deletedExerciseIds = deletedExercises.map((ex_item: any) => ex_item.exerciseId);

          await updateUserWorkoutWithExercises(user.id, workoutId, workoutName, workoutDescription, updatedExercises, newExercises, deletedExerciseIds)
          return redirect(`/app/workouts/${workoutId}`);
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => json(
          { success: true },
          {
            headers: {
              "Set-Cookie": `fitizen__darkMode=${darkMode}; SameSite=Strict; Path=/`,
            },
          }
        ),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

interface updateWorkoutFetcherType extends ActionFunctionArgs{
  errors?: {
    workoutName?: string;
    workoutDescription?: string;
    exercises?: string;
  }
}

type Card = {
  id: string;
  name: string;
};

type WorkoutCard = Card & {
  target: string;
  exercises?: any;
};

type ComplexCard = {
  id: string;
  circuitId: string;
  exercises: WorkoutCard[];
}

const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

type WorkoutCardComponentProps = {
  card: any;
  openDialog: (component: React.ReactNode, options: any) => void;
}

const WorkoutCardComponent = ({ card, openDialog }: WorkoutCardComponentProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <>
      <div
        className="relative group cursor-pointer aspect-[1.496]"
        onClick={() => openDialog(
          <ExerciseDialog exercise={card} />,
          exerciseDialogOptions(card.name)
        )}
      >
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={card.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/cld-sample-3.jpg"}
          className={clsx(
            "w-full rounded-t transition-opacity duration-300 group-hover:opacity-85",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        <Video className="absolute w-full size-8 inset-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex flex-col p-4">
        <p className="font-bold max-w-56 lg:max-w-64 truncate">{card.name}</p>
        <div className="flex divide-x divide-gray-400 text-sm">
          {card.body.slice(0,2).map((body: string, body_idx: number) => (
            <p key={body_idx} className={`${body_idx > 0 ? "px-1" : "pr-1"} text-xs capitalize`}>{`${body} body`}</p>
          ))}
          <p className="px-1 text-xs capitalize">{card.contraction}</p>
        </div>
      </div>
    </>
  )
}

export default function Edit() {
  const { allExercises, exerciseDetails, workout, page, totalPages } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const location = useLocation();
  const { open } = useSidebar();
  const navigation = useNavigation();
  const updateWorkoutFetcher = useFetcher<updateWorkoutFetcherType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = updateWorkoutFetcher.formData?.get("_action") === "updateUserWorkout";

  const [workoutCards, setWorkoutCards] = useState<Array<WorkoutCard | ComplexCard>>(exerciseDetails);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [openDescription, setOpenDescription] = useState(false);
  const [openExercisesPanel, setOpenExercisesPanel] = useState(false);

  const toggleExercisesPanel = () => setOpenExercisesPanel(!openExercisesPanel);
  const openDialog = useOpenDialog();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'availableCards' && destination.droppableId === 'workoutCards') {
      const card = allExercises[source.index];
      // Create a new unique ID for the duplicate card
      const newId = `${card.id}-${Date.now()}`;
      const newDeckCard: WorkoutCard = {
        ...card,
        id: newId,
        target: "reps",
      };
      
      setWorkoutCards(prevWorkoutCards => {
        const newWorkoutCards = Array.from(prevWorkoutCards);
        newWorkoutCards.splice(destination.index, 0, newDeckCard);
        return newWorkoutCards;
      });
    } else if (source.droppableId === 'workoutCards' && destination.droppableId === 'workoutCards') {
      setWorkoutCards(prevWorkoutCards => {
        const newWorkoutCards = Array.from(prevWorkoutCards);
        const [reorderedItem] = newWorkoutCards.splice(source.index, 1);
        newWorkoutCards.splice(destination.index, 0, reorderedItem);
        return newWorkoutCards;
      });
    }
  };

  const handleAddExercise = (exercise: { id: string, name: string }) => {
    const newId = `${exercise.id}-${Date.now()}`;
    const newDeckCard: WorkoutCard = {
      ...exercise,
      id: newId,
      target: "reps",
    };
    
    setWorkoutCards(prevWorkoutCards => [...prevWorkoutCards, newDeckCard]);
  }

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedCards(new Set(workoutCards.map(card => card.id)));
  };

  const handleDeselectAll = () => {
    setSelectedCards(new Set());
  };

  const handleDeleteSelected = () => {
    setWorkoutCards(prev => prev.filter(card => !selectedCards.has(card.id)));
    setSelectedCards(new Set());
  };

  const handleCircuit = useCallback(() => {
    setWorkoutCards((prev: any) => {
      const circuitCards = prev.filter((card: WorkoutCard) => selectedCards.has(card.id))
      const filteredDeck = prev.filter((card: WorkoutCard) => !selectedCards.has(card.id))
      return [...filteredDeck, {
        id: circuitCards.map((card: WorkoutCard) => card.id).join("-"),
        circuitId: `circuit-${Date.now()}`,
        exercises: circuitCards,
      }]
    })
    setSelectedCards(new Set());
  }, [[workoutCards, setWorkoutCards, selectedCards, setSelectedCards]])

  const handleChange = useCallback((id: string, field: string, value: string | number) => {
    setWorkoutCards(prev => prev.map(card => {
      if (card.id === id) {
        return {
          ...card,
          [field]: value
        }
      } else {
        return card
      }
    }))
  }, [workoutCards, setWorkoutCards])

  const handleUngroup = useCallback((circuitId: string) => {
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => {
      const filteredDeck = prev.filter(card => card.id !== circuitId)
      const circuitExercises = prev.find(card => card.id === circuitId)?.exercises.map((ex_item: {}) => ({ ...ex_item, circuitId: null }))
      return [...filteredDeck, ...circuitExercises]
    })
  }, [workoutCards, setWorkoutCards])

  const onChangeCircuitRounds = useCallback((cardId: string, rounds: string) => {
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map((card: any) => {
      if (card.id === cardId) {
        return {
          ...card,
          exercises: card.exercises.map((exercise: WorkoutCard) => ({
            ...exercise,
            rounds,
          }))
        }
      } else {
        return card
      }
    }))
  }, [workoutCards, setWorkoutCards])

  const onChangeCircuitRest = useCallback((cardId: string, rest: string) => {
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map((card: any) => {
      if (card.id === cardId) {
        return {
          ...card,
          exercises: card.exercises.map((exercise: WorkoutCard) => ({
            ...exercise,
            rest,
          }))
        }
      } else {
        return card
      }
    }))
  }, [workoutCards, setWorkoutCards])

  const onChangeCircuitTarget = useCallback((circuitId: string, circuitExerciseId: string, target: string) => {
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map((card: any) => {
      if (card.id === circuitId) {
        return {
          ...card,
          exercises: card.exercises.map((exercise: WorkoutCard) => {
            if (exercise.id === circuitExerciseId) {
              return {
                ...exercise,
                target,
              }
            } else {
              return exercise
            }
          })
        }
      } else {
        return card
      }
    }))
  }, [workoutCards, setWorkoutCards])

  const onChangeTarget = (value: string, id: string) => handleChange(id, "target", value)

  const flattenedWorkoutCards = useMemo(() => {
    return workoutCards.reduce((result: any, curr: any) => {
      let resultArr = result
      if (curr.exercises) {
        return resultArr.concat(curr.exercises)
      } else {
        return resultArr.concat(curr)
      }
    }, [])
  }, [workoutCards])

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
          {/* Edit Workout Form */}
          <updateWorkoutFetcher.Form method="post" className="flex flex-col h-full w-full xl:w-1/2 p-6 bg-background-muted text-foreground">
            <h2 className="mb-2 text-lg font-semibold">Edit Workout</h2>
            <fieldset className="space-y-4 rounded-xl">
              <div className="flex flex-col">
                <label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></label>
                <Input
                  type="text"
                  id="workoutName"
                  name="workoutName"
                  autoComplete="off"
                  defaultValue={workout?.name}
                  required
                  className={clsx(
                    "p-2 rounded-md border text-sm/6",
                    updateWorkoutFetcher.data?.errors?.workoutName ? "border-red-500" : "",
                    "bg-background placeholder:text-muted-foreground dark:border-border-muted dark:focus:border-ring"
                  )}
                  placeholder="Name your workout"
                />
                {updateWorkoutFetcher.data?.errors?.workoutName ? <span className="text-red-500 text-xs">{updateWorkoutFetcher.data?.errors?.workoutName}</span> : null}
              </div>
              <div className="flex flex-col">
              <button
                className="w-full flex justify-between items-center focus:outline-none"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenDescription(!openDescription);
                }}
              >
                <label className="text-sm/6 font-medium">Description</label>
                <motion.div
                  animate={{ rotate: openDescription ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openDescription && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <Textarea
                      className={clsx(
                        "p-2 rounded-md border text-sm/6 resize-none w-full bg-background",
                        "placeholder:text-muted-foreground dark:border-border-muted dark:focus:border-ring"
                      )}
                      placeholder="Optional"
                      name="workoutDescription"
                      id="workoutDescription"
                      defaultValue={workout?.description ? workout.description : undefined}
                      autoFocus
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </fieldset>
            <div className="mt-2">
              <label className="text-sm/6 font-medium">Exercises<span className="text-xs ml-1">*</span></label>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => workoutCards.length === selectedCards.size ? handleDeselectAll() : handleSelectAll()}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-accent dark:hover:bg-border-muted dark:border dark:border-border-muted disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded"
                disabled={!workoutCards.length}
              >
                {workoutCards.length >= 1 && workoutCards.length === selectedCards.size ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={handleCircuit}
                disabled={selectedCards.size < 2}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-accent dark:hover:bg-border-muted dark:border dark:border-border-muted disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded"
              >
                Circuit
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="px-2 py-1 rounded disabled:opacity-30"
                disabled={!selectedCards.size}
              >
                <Tooltip label="Delete" className="bottom-5 left-0 text-sm">
                  <TrashIcon className="size-4 text-red-500" />
                </Tooltip>
              </button>
            </div>
            <StrictModeDroppable droppableId="workoutCards">
              {(provided: DroppableProvided) => (
                <motion.div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  initial="closedDescription"
                  animate={openDescription ? "openDescription" : "closedDescription"}
                  variants={{
                    openDescription: { height: "calc(100% - 16rem)" },
                    closedDescription: { height: "calc(100% - 14rem)" },
                  }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-y-auto flex flex-col shadow-inner bg-slate-200 dark:bg-background rounded-md p-3 mt-1 mb-2"
                >
                  {workoutCards.map((card: any, index: number) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided: DraggableProvided) => {
                        if (card.circuitId) {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex flex-col mb-2 p-2 bg-gray-100 dark:bg-background-muted dark:border dark:border-border-muted rounded shadow"
                            >
                              <div className="flex justify-between">
                                <div className="flex gap-2 mb-2">
                                  <label className="text-xs self-end font-medium text-muted-foreground">Circuit of</label>
                                  <Input
                                    type="number"
                                    className="w-12 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                    defaultValue={card.exercises && card.exercises.find((ex_item: any) => ex_item.sets) ? card.exercises.find((ex_item: any) => ex_item.sets).sets : 3}
                                    min={1}
                                    max={10}
                                    onChange={(event) => {
                                      const rounds = event.target.value
                                      onChangeCircuitRounds(card.id, rounds)
                                    }}
                                  />
                                  <label className="text-xs self-end font-medium">rounds</label>
                                </div>
                                <button className="text-xs font-medium underline" onClick={() => handleUngroup(card.id)}>Ungroup</button>
                              </div>
                              <div className="flex h-full w-full justify-between">
                                <div className="flex items-center">
                                  <Checkbox
                                    className="mr-2"
                                    checked={selectedCards.has(card.id)}
                                    onCheckedChange={() => handleCardSelect(card.id)}
                                  />
                                  <div className="flex flex-col gap-2 divide-y-4">
                                    {card.exercises && card.exercises.map((ex_item: any, ex_item_idx: number) => {
                                      const exerciseIndex = flattenedWorkoutCards.findIndex((workoutCard: any) => workoutCard.id === ex_item.id)
                                      return (
                                        <div className="flex flex-col gap-1 last:pt-1" key={`${ex_item.name}-${ex_item_idx}`}>
                                          <input type="hidden" name={`exercises[${exerciseIndex}].orderInRoutine`} value={exerciseIndex+1} />
                                          <input type="hidden" name={`exercises[${exerciseIndex}].circuitId`} value={card.circuitId} />
                                          <input type="hidden" name={`exercises[${exerciseIndex}].sets`} value={ex_item.sets ? ex_item.sets : 3} />
                                          <input type="hidden" name={`exercises[${exerciseIndex}].rest`} value={ex_item.rest ? ex_item.rest : "60 sec"} />
                                          <div className="flex flex-col justify-between">
                                            <label className="text-xs self-start font-medium text-muted-foreground">Name</label>
                                            <p className="min-w-40 max-w-60 truncate shrink select-none">{ex_item.name}</p>
                                          </div>
                                          <div className="flex gap-3 h-full w-full flex-wrap">
                                            <div className="flex flex-col justify-between">
                                              <label className="text-xs self-start font-medium text-muted-foreground">Target</label>
                                              {/* <select
                                                className="text-xs h-5 self-end"
                                                defaultValue={ex_item.target ? ex_item.target : "reps"}
                                                name={`exercises[${exerciseIndex}].target`}
                                                onChange={(event) => onChangeCircuitTarget(card.id, ex_item.id, event.target.value)}
                                              >
                                                {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                                              </select> */}
                                              <Select
                                                defaultValue={ex_item.target ? ex_item.target : "reps"}
                                                name={`exercises[${exerciseIndex}].target`}
                                                value={card.target}
                                                onValueChange={(val) => onChangeCircuitTarget(card.id, ex_item.id, val)}
                                              >
                                                <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                                  <SelectValue placeholder="Select Target" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:border-border-muted">
                                                  <SelectGroup>
                                                    <SelectLabel>Target</SelectLabel>
                                                    {targetOptions.map((target, target_idx) => <SelectItem key={target_idx} value={target.value}>{target.label}</SelectItem>)}
                                                  </SelectGroup>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            {ex_item.target === "reps" ? (
                                              <div className="flex flex-col justify-between">
                                                <label className="text-xs self-start font-medium text-muted-foreground">Reps</label>
                                                <Input
                                                  type="number"
                                                  className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                                  defaultValue={ex_item.reps ? ex_item.reps : 10}
                                                  min={1}
                                                  max={20}
                                                  name={`exercises[${exerciseIndex}].reps`}
                                                />
                                              </div>
                                            ) : ex_item.target === "time" ? (
                                              <div className="flex flex-col justify-between">
                                                <label className="text-xs self-start font-medium text-muted-foreground">Time</label>
                                                {/* <select
                                                  className="text-xs h-5 self-end"
                                                  defaultValue={ex_item.time ? ex_item.time : "30 sec"}
                                                  name={`exercises[${exerciseIndex}].time`}
                                                >
                                                  {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                                </select> */}
                                                <Select
                                                  defaultValue={ex_item.time ? ex_item.time : "30 sec"}
                                                  name={`exercises[${exerciseIndex}].time`}
                                                >
                                                  <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                                    <SelectValue placeholder="Select Time" />
                                                  </SelectTrigger>
                                                  <SelectContent className="dark:border-border-muted">
                                                    <SelectGroup>
                                                      <SelectLabel>Time</SelectLabel>
                                                      {restOptions.map((rest, rest_idx) => <SelectItem key={rest_idx} value={rest.value}>{rest.label}</SelectItem>)}
                                                    </SelectGroup>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col justify-between">
                                                <label className="text-xs self-start font-medium text-muted-foreground">Reps</label>
                                                <Input
                                                  type="number"
                                                  className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                                  defaultValue={ex_item.reps ? ex_item.reps : 10}
                                                  min={1}
                                                  max={20}
                                                  name={`exercises[${exerciseIndex}].reps`}
                                                />
                                              </div>
                                            )}
                                            <div className="flex flex-col justify-between">
                                              <label className="text-xs self-start font-medium text-muted-foreground">Notes</label>
                                              <Input
                                                type="text"
                                                className="w-36 text-sm px-2 h-5 self-end bg-background dark:border-border-muted"
                                                placeholder="tempo, weight, etc."
                                                defaultValue={ex_item.notes ? ex_item.notes : undefined}
                                                name={`exercises[${exerciseIndex}].notes`}
                                              />
                                            </div>
                                          </div>
                                          <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={ex_item.id} />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                                <div className="self-center">
                                  <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2 justify-end w-full">
                                <label className="text-xs self-end font-medium text-muted-foreground">Rest</label>
                                {/* <select
                                  className="text-xs h-5 self-end"
                                  defaultValue={card.exercises.find((ex_item: any) => ex_item.rest) ? card.exercises.find((ex_item: any) => ex_item.rest).rest : "60 sec"}
                                  onChange={(event) => {
                                    const rest = event.target.value
                                    onChangeCircuitRest(card.id, rest)
                                  }}
                                >
                                  {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                </select> */}
                                <Select
                                  defaultValue={card.exercises && card.exercises.find((ex_item: any) => ex_item.rest) ? card.exercises.find((ex_item: any) => ex_item.rest).rest : "60 sec"}
                                  onValueChange={(val) => onChangeCircuitRest(card.id, val)}
                                >
                                  <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted self-center w-fit">
                                    <SelectValue placeholder="Select Rest" />
                                  </SelectTrigger>
                                  <SelectContent className="dark:border-border-muted">
                                    <SelectGroup>
                                      <SelectLabel>Rest</SelectLabel>
                                      {restOptions.map((rest, rest_idx) => <SelectItem key={rest_idx} value={rest.value}>{rest.label}</SelectItem>)}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <label className="text-xs self-end font-medium text-muted-foreground">between rounds</label>
                              </div>
                            </div>
                          )
                        } else {
                          const exerciseIndex = flattenedWorkoutCards.findIndex((workoutCard: any) => workoutCard.id === card.id)
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center gap-2 mb-2 p-2 bg-gray-100 dark:bg-background-muted dark:border dark:border-border-muted rounded shadow"
                            >
                              <input type="hidden" name={`exercises[${exerciseIndex}].orderInRoutine`} value={exerciseIndex+1} />
                              <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={card.id} />
                              <Checkbox
                                checked={selectedCards.has(card.id)}
                                onCheckedChange={() => handleCardSelect(card.id)}
                              />
                              <div className="flex justify-between w-full">
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-col justify-between">
                                    <label className="text-xs self-start font-medium text-muted-foreground">Name</label>
                                    <p className="min-w-40 max-w-60 truncate shrink select-none">{card.name}</p>
                                  </div>
                                  <div className="flex flex-wrap max-w-full gap-3">
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Sets</label>
                                      <Input
                                        type="number"
                                        className="w-12 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                        defaultValue={card.sets ? card.sets : "3"}
                                        min={1}
                                        max={10}
                                        name={`exercises[${exerciseIndex}].sets`}
                                      />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Target</label>
                                      {/* <select
                                        className="text-xs h-5 self-end"
                                        defaultValue={card.target ? card.target : "reps"}
                                        name={`exercises[${exerciseIndex}].target`}
                                        // value={card.target}
                                        onChange={(event) => onChangeTarget(event, card.id)}
                                      >
                                        {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                                      </select> */}
                                      <Select
                                        defaultValue={card.target ? card.target : "reps"}
                                        name={`exercises[${exerciseIndex}].target`}
                                        value={card.target}
                                        onValueChange={(val) => onChangeTarget(val, card.id)}
                                      >
                                        <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                          <SelectValue placeholder="Select Target" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:border-border-muted">
                                          <SelectGroup>
                                            <SelectLabel>Target</SelectLabel>
                                            {targetOptions.map((target, target_idx) => <SelectItem key={target_idx} value={target.value}>{target.label}</SelectItem>)}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {card.target === "reps" ? (
                                      <div className="flex flex-col justify-between">
                                        <label className="text-xs self-start font-medium text-muted-foreground">Reps</label>
                                        <Input
                                          type="number"
                                          className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                          defaultValue={card.reps ? card.reps : "10"}
                                          min={1}
                                          max={20}
                                          name={`exercises[${exerciseIndex}].reps`}
                                        />
                                      </div>
                                    ) : card.target === "time" ? (
                                      <div className="flex flex-col justify-between">
                                        <label className="text-xs self-start font-medium text-muted-foreground">Time</label>
                                        {/* <select
                                          className="text-xs h-5 self-end"
                                          defaultValue={card.time ? card.time : "30 sec"}
                                          name={`exercises[${exerciseIndex}].time`}
                                        >
                                          {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                        </select> */}
                                        <Select
                                          defaultValue={card.time ? card.time : "30 sec"}
                                          name={`exercises[${exerciseIndex}].time`}
                                        >
                                          <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                            <SelectValue placeholder="Select Time" />
                                          </SelectTrigger>
                                          <SelectContent className="dark:border-border-muted">
                                            <SelectGroup>
                                              <SelectLabel>Time</SelectLabel>
                                              {restOptions.map((rest, rest_idx) => <SelectItem key={rest_idx} value={rest.value}>{rest.label}</SelectItem>)}
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col justify-between">
                                        <label className="text-xs self-start font-medium text-muted-foreground">Reps</label>
                                        <Input
                                          type="number"
                                          className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                          defaultValue={card.reps ? card.reps : "10"}
                                          min={1}
                                          max={20}
                                          name={`exercises[${exerciseIndex}].reps`}
                                        />
                                      </div>
                                    )}
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Notes</label>
                                      <Input
                                        type="text"
                                        className="w-36 text-sm px-2 h-5 self-end bg-background dark:border-border-muted"
                                        placeholder="reps, tempo, etc."
                                        name={`exercises[${exerciseIndex}].notes`}
                                        defaultValue={card.notes ? card.notes : undefined}
                                      />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Rest</label>
                                      {/* <select
                                        className="text-xs h-5 self-end"
                                        defaultValue={card.rest ? card.rest : "60 sec"}
                                        name={`exercises[${exerciseIndex}].rest`}
                                      >
                                        {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                      </select> */}
                                      <Select
                                        defaultValue={card.rest ? card.rest : "60 sec"}
                                        name={`exercises[${exerciseIndex}].rest`}
                                      >
                                        <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                          <SelectValue placeholder="Select Rest" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:border-border-muted">
                                          <SelectGroup>
                                            <SelectLabel>Rest</SelectLabel>
                                            {restOptions.map((rest, rest_idx) => <SelectItem key={rest_idx} value={rest.value}>{rest.label}</SelectItem>)}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                                <div className="self-center">
                                  <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing mr-2" />
                                </div>
                              </div>
                            </div>
                          )
                        }
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <p className="hidden xl:flex h-full text-sm text-slate-400 dark:text-muted-foreground justify-center items-center p-4 border-2 bg-white dark:bg-background-muted border-dashed border-gray-300 rounded-md select-none">
                    Drag 'n' drop exercise(s) here
                  </p>
                  <div
                    className="xl:hidden h-full border-2 border-dashed border-gray-300 bg-white dark:bg-background-muted rounded-md px-3 py-2 flex flex-col justify-center items-center my-1 cursor-pointer"
                    onClick={toggleExercisesPanel}
                  >
                    <p className="text-sm text-slate-400 dark:text-muted-foreground select-none">Add exercise (s)</p>
                    <PlusCircleIcon className="size-10 text-primary"/>
                  </div>
                </motion.div>
              )}
            </StrictModeDroppable>
            {updateWorkoutFetcher.data?.errors?.exercises ? <span className="text-red-500 text-xs">{updateWorkoutFetcher.data?.errors?.exercises}</span> : null}
            <div className="flex-none flex justify-end gap-2">
              <Link to={`/app/workouts/${workout?.id}`} className="bg-gray-300 hover:bg-gray-200 dark:border dark:border-border-muted dark:bg-accent dark:hover:bg-border-muted px-4 py-2 rounded">Cancel</Link>
              <PrimaryButton
                type="submit"
                name="_action"
                value="updateUserWorkout"
                className="px-4 py-2 rounded"
                disabled={isSavingWorkout}
                isLoading={isSavingWorkout}
              >
                {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
              </PrimaryButton>
            </div>
            {/* {updateWorkoutFetcher.data?.errors?.cards && (
              <div className="mt-4 text-red-500">
                <ul>
                  {Object.values(updateWorkoutFetcher.data?.errors?.cards).map((error: any) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )} */}
          </updateWorkoutFetcher.Form>
          {/* Available Exercises */}
          <div className="hidden h-full xl:flex flex-col xl:w-1/2 p-8 sm:p-6 bg-gray-200 dark:bg-background text-foreground dark:border-l dark:border-border-muted">
            <h2 className="mb-2 text-lg font-semibold">Available Exercises</h2>
            <Form
              className={clsx("mb-2", isSearching ? "animate-pulse" : "",
                // "flex content-center rounded-md mb-2 focus-within:border focus-within:outline-border-ring /*lg:w-2/3 xl:w-1/2*/",
                // "bg-background placeholder:text-muted-foreground"
              )}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-muted-foreground peer-focus:text-foreground" />
                <Input
                  type="search"
                  defaultValue={searchParams.get("q") ?? ""}
                  name="q"
                  placeholder="Search available exercises ..."
                  autoComplete="off"
                  onChange={(e) => {
                    !e.target.value && submit({}, { action: location?.pathname })
                  }}
                  className={clsx(
                    "w-full appearance-none border bg-background pl-8 shadow-none",
                    "dark:bg-background-muted dark:text-muted-foreground dark:focus:text-foreground",
                    "dark:border-border-muted dark:focus:border-ring"
                  )}
                />
              </div>
            </Form>
            <StrictModeDroppable droppableId="availableCards" isDropDisabled={true}>
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-y-2 2xl:grid 2xl:grid-cols-2 2xl:gap-y-3 gap-x-3 snap-y snap-mandatory overflow-y-auto"
                >
                  {allExercises.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided: DraggableProvided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex flex-col bg-background snap-start rounded shadow dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted *:select-none"
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0px, 0px)',
                          }}
                        >
                          <WorkoutCardComponent card={card} openDialog={openDialog} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
            <AppPagination page={page} totalPages={totalPages} />
          </div>
        </div>
      </DragDropContext>
      {/* Available Exercises Popup */}
      <AnimatePresence>
        {openExercisesPanel && (
          <motion.div
            className={clsx(
              "xl:hidden absolute bottom-0 left-0 dark:bg-border-muted transition ease-linear",
              "flex flex-col gap-y-2 h-3/5 bg-gray-200 w-screen rounded-t-lg px-6 pt-6",
              open ? "md:max-w-[calc(100vw-16rem)]" : "md:max-w-[calc(100vw-3rem)]"
            )}
            initial={{ translateY: "100%" }}
            animate={{ translateY: "0%" }}
            exit={{ translateY: "100%" }}
            transition={{ ease: [0, 0.71, 0.2, 1.01], }}
          >
            <div className="flex justify-between text-foreground">
              <p className="text-lg font-semibold">Exercises</p>
              <button
                onClick={(event) => {
                  setOpenExercisesPanel(false)
                  setSearchParams((prev) => {
                    prev.set("q", "");
                    return prev;
                  });
                }}
              >
                <XMarkIcon className="size-6 hover:text-primary"/>
              </button>
            </div>
            <Form
              className={isSearching ? "animate-pulse" : ""}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-muted-foreground peer-focus:text-foreground" />
                <Input
                  type="search"
                  defaultValue={searchParams.get("q") ?? ""}
                  name="q"
                  placeholder="Search available exercises ..."
                  autoComplete="off"
                  onChange={(e) => {
                    !e.target.value && submit({}, { action: location?.pathname })
                  }}
                  className={clsx(
                    "w-full appearance-none border bg-background pl-8 shadow-none",
                    "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                    "dark:border-border-muted dark:focus:border-ring"
                  )}
                />
              </div>
            </Form>
            <div className="flex flex-col gap-y-2 lg:grid lg:grid-cols-2 lg:gap-4 snap-y snap-mandatory overflow-y-auto px-0.5 pb-1 text-slate-900">
              {allExercises.map((ex_item) => (
                <Exercise
                  key={ex_item.id}
                  exercise={ex_item}
                  selectable
                  selectFn={handleAddExercise}
                  selectCount={flattenedWorkoutCards.map((sel_ex: ExerciseType) => sel_ex.id.split("-")[0]).filter((id: any) => id === ex_item.id).length}
                  selected={flattenedWorkoutCards.map((sel_ex: ExerciseType) => sel_ex.id.split("-")[0]).includes(ex_item.id)}
                  onViewExercise={() => {
                    openDialog(
                      <ExerciseDialog exercise={ex_item} />,
                      exerciseDialogOptions(ex_item.name)
                    )
                  }}
                />
              ))}
            </div>
            <AppPagination page={page} totalPages={totalPages} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}