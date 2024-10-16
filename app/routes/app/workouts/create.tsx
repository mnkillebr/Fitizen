import { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Link, useFetcher, useLoaderData, useNavigation, useSearchParams, } from '@remix-run/react';
import { z } from 'zod';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { getAllExercises } from '~/models/exercise.server';
import { AnimatePresence, motion } from "framer-motion";
import { workoutFormDataToObject, } from '~/utils/misc';
import { ChevronDownIcon, PlusCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { validateObject } from '~/utils/validation';
import clsx from 'clsx';
import { PrimaryButton } from '~/components/form';
import Tooltip from '~/components/Tooltip';
import { requireLoggedInUser } from '~/utils/auth.server';
import { createUserWorkoutWithExercises } from '~/models/workout.server';
import { Exercise } from '../exercises';
import { Exercise as ExerciseType } from "@prisma/client";
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Search } from 'lucide-react';
import { Checkbox } from '~/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';

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

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
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

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createUserWorkout": {
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
          await createUserWorkoutWithExercises(user.id, workoutName, workoutDescription, mappedExercises)
          return redirect("/app/workouts");
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
  }
}

interface createWorkoutFetcherType extends ActionFunctionArgs{
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

export default function WorkoutBuilderForm() {
  const { exercises } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const createWorkoutFetcher = useFetcher<createWorkoutFetcherType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = navigation.formData?.get("_action") === "createUserWorkout";

  const [workoutCards, setWorkoutCards] = useState<Array<WorkoutCard | ComplexCard>>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [openDescription, setOpenDescription] = useState(false);
  const [openExercisesPanel, setOpenExercisesPanel] = useState(false);

    const toggleExercisesPanel = () => setOpenExercisesPanel(!openExercisesPanel);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'availableCards' && destination.droppableId === 'workoutCards') {
      const card = exercises[source.index];
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
      const circuitExercises = prev.find(card => card.id === circuitId)?.exercises
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
  // console.log(selectedCards, workoutCards)
  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.75rem)]">
          {/* Create Workout Form */}
          <createWorkoutFetcher.Form method="post" className="flex flex-col h-full w-full lg:w-1/2 p-8 sm:p-6 bg-background-muted text-foreground">
            <h2 className="mb-2 text-lg font-semibold">Create Workout</h2>
            <fieldset className="space-y-4 rounded-xl">
              <div className="flex flex-col">
                <label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></label>
                <Input
                  type="text"
                  id="workoutName"
                  name="workoutName"
                  autoComplete="off"
                  required
                  className={clsx(
                    "p-2 rounded-md border /*lg:w-2/3 xl:w-1/2*/ text-sm/6",
                    createWorkoutFetcher.data?.errors?.workoutName ? "border-red-500" : "",
                    "bg-background placeholder:text-muted-foreground dark:border-border-muted dark:focus:border-ring"
                  )}
                  placeholder="Name your workout"
                />
                {createWorkoutFetcher.data?.errors?.workoutName ? <span className="text-red-500 text-xs">{createWorkoutFetcher.data?.errors?.workoutName}</span> : null}
              </div>
              <div className="flex flex-col">
              <button
                className="w-full flex justify-between items-center focus:outline-none /*lg:w-2/3 xl:w-1/2*/"
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
                                    defaultValue={3}
                                    min={1}
                                    max={10}
                                    onChange={(event) => {
                                      const rounds = event.target.value
                                      onChangeCircuitRounds(card.id, rounds)
                                    }}
                                  />
                                  <label className="text-xs self-end font-medium text-muted-foreground">rounds</label>
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
                                    {card.exercises.map((ex_item: any, ex_item_idx: number) => {
                                      const exerciseIndex = flattenedWorkoutCards.findIndex((workoutCard: any) => workoutCard.id === ex_item.id)
                                      return (
                                        <div className="flex flex-col gap-1 last:pt-1" key={`${ex_item.name}-${ex_item_idx}`}>
                                          <input type="hidden" name={`exercises[${exerciseIndex}].orderInRoutine`} value={exerciseIndex+1} />
                                          <input type="hidden" name={`exercises[${exerciseIndex}].circuitId`} value={card.circuitId} />
                                          <input type="hidden" name={`exercises[${exerciseIndex}].sets`} value={ex_item.rounds ? ex_item.rounds : 3} />
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
                                                {targetOptions.map((target, target_idx) => <option key={target_idx}>{target.value}</option>)}
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
                                                {/* <Input
                                                  type="number"
                                                  className="w-10 text-sm pl-2 h-5"
                                                  defaultValue="10"
                                                  name={`exercises[${exerciseIndex}].reps`}
                                                /> */}
                                                <Input
                                                  type="number"
                                                  className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                                  defaultValue="10"
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
                                                  defaultValue="30 sec"
                                                  name={`exercises[${exerciseIndex}].time`}
                                                >
                                                  {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest.value}</option>)}
                                                </select> */}
                                                <Select
                                                  defaultValue="30 sec"
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
                                                  defaultValue="10"
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
                                  defaultValue="60 sec"
                                  onChange={(event) => {
                                    const rest = event.target.value
                                    onChangeCircuitRest(card.id, rest)
                                  }}
                                >
                                  {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest.value}</option>)}
                                </select> */}
                                <Select
                                  defaultValue="60 sec"
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
                                <label className="text-xs self-end font-medium text-muted-foreground text-nowrap">between rounds</label>
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
                                        defaultValue="3"
                                        min={1}
                                        max={10}
                                        name={`exercises[${exerciseIndex}].sets`}
                                      />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Target</label>
                                      {/* <select
                                        className="text-xs h-5 self-end"
                                        defaultValue="reps"
                                        name={`exercises[${exerciseIndex}].target`}
                                        value={card.target}
                                        onChange={(event) => onChangeTarget(event, card.id)}
                                      >
                                        {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                                      </select> */}
                                      <Select
                                        defaultValue="reps"
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
                                          defaultValue="10"
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
                                          defaultValue="30 sec"
                                          name={`exercises[${exerciseIndex}].time`}
                                        >
                                          {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest.value}</option>)}
                                        </select> */}
                                        <Select
                                          defaultValue="30 sec"
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
                                          defaultValue="10"
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
                                      />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium text-muted-foreground">Rest</label>
                                      {/* <select
                                        className="text-xs h-5 self-end"
                                        defaultValue="60 sec"
                                        name={`exercises[${exerciseIndex}].rest`}
                                      >
                                        {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest.value}</option>)}
                                      </select> */}
                                      <Select
                                        defaultValue="60 sec"
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
                  <p className="hidden lg:flex h-full text-sm text-slate-400 dark:text-muted-foreground justify-center items-center p-4 border-2 bg-white dark:bg-background-muted border-dashed border-gray-300 rounded-md select-none">
                    Drag 'n' drop exercise(s) here
                  </p>
                  <div
                    className="lg:hidden h-full border-2 border-dashed bg-white dark:bg-background-muted rounded-md px-3 py-2 flex flex-col justify-center items-center my-1 cursor-pointer"
                    onClick={toggleExercisesPanel}
                  >
                    <p className="text-sm text-slate-400 dark:text-muted-foreground select-none">Add exercise (s)</p>
                    <PlusCircleIcon className="size-10 text-primary"/>
                  </div>
                </motion.div>
              )}
            </StrictModeDroppable>
            {createWorkoutFetcher.data?.errors?.exercises ? <span className="text-red-500 text-xs">{createWorkoutFetcher.data?.errors?.exercises}</span> : null}
            <div className="flex-none flex justify-end gap-2">
              <Link to="/app/workouts" className="bg-gray-300 hover:bg-gray-200 dark:border dark:border-border-muted dark:bg-accent dark:hover:bg-border-muted px-4 py-2 rounded">Cancel</Link>
              <PrimaryButton
                type="submit"
                name="_action"
                value="createUserWorkout"
                className="px-4 py-2 rounded"
                disabled={isSavingWorkout}
                isLoading={isSavingWorkout}
              >
                {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
              </PrimaryButton>
            </div>
            {/* {createWorkoutFetcher.data?.errors?.cards && (
              <div className="mt-4 text-red-500">
                <ul>
                  {Object.values(createWorkoutFetcher.data?.errors?.cards).map((error: any) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )} */}
          </createWorkoutFetcher.Form>
          {/* Available Exercises */}
          <div className="hidden h-full lg:flex flex-col lg:w-1/2 p-8 sm:p-6 bg-gray-200 dark:bg-background text-foreground dark:border-l dark:border-border-muted">
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
                  type="text"
                  defaultValue={searchParams.get("q") ?? ""}
                  name="q"
                  placeholder="Search available exercises ..."
                  autoComplete="off"
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
                  className="flex flex-col gap-y-2 xl:grid xl:grid-cols-2 xl:gap-y-3 gap-x-3  overflow-y-auto"
                >
                  {exercises.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided: DraggableProvided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex flex-col bg-background rounded shadow dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted *:select-none"
                          style={{
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0px, 0px)',
                          }}
                        >
                          <img
                            src="https://res.cloudinary.com/dqrk3drua/image/upload/v1724263117/cld-sample-3.jpg"
                            className="w-full rounded-t"
                          />
                          <div className="flex flex-col p-4">
                            <p className="font-bold max-w-56 lg:max-w-64 truncate">{card.name}</p>
                            <div className="flex divide-x divide-gray-400 text-sm">
                              {card.body.slice(0,2).map((body, body_idx) => (
                                <p key={body_idx} className={`${body_idx > 0 ? "px-1" : "pr-1"} text-xs capitalize`}>{`${body} body`}</p>
                              ))}
                              <p className="px-1 text-xs capitalize">{card.contraction}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </StrictModeDroppable>
          </div>
        </div>
      </DragDropContext>
      {/* Available Exercises Popup */}
      <AnimatePresence>
        {openExercisesPanel && (
          <motion.div
            className={clsx(
              "lg:hidden absolute bottom-0 left-0 md:left-[219px] md:max-w-[calc(100vw-13.6875rem)]",
              "flex flex-col gap-y-2 h-3/5 bg-gray-200 w-screen rounded-t-lg p-8 sm:p-6",
              "dark:bg-border-muted"
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
                  type="text"
                  defaultValue={searchParams.get("q") ?? ""}
                  name="q"
                  placeholder="Search available exercises ..."
                  autoComplete="off"
                  className={clsx(
                    "w-full appearance-none border bg-background pl-8 shadow-none",
                    "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                    "dark:border-border-muted dark:focus:border-ring"
                  )}
                />
              </div>
            </Form>
            <div className="flex flex-col gap-y-2 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto px-0.5 pb-1 text-slate-900">
              {exercises.map((ex_item) => (
                <Exercise
                  key={ex_item.id}
                  exercise={ex_item}
                  selectable
                  selectFn={handleAddExercise}
                  selectCount={flattenedWorkoutCards.map((sel_ex: ExerciseType) => sel_ex.id.split("-")[0]).filter((id: any) => id === ex_item.id).length}
                  selected={flattenedWorkoutCards.map((sel_ex: ExerciseType) => sel_ex.id.split("-")[0]).includes(ex_item.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}