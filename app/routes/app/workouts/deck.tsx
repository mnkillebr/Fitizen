import React, { BaseSyntheticEvent, useCallback, useState } from 'react';
import { Form, Link, useActionData, useFetcher, useLoaderData, useNavigation, useSearchParams, } from '@remix-run/react';
import { z } from 'zod';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { getAllExercises } from '~/models/exercise.server';
import { AnimatePresence, motion } from "framer-motion";
import { workoutFormDataToObject, useIsHydrated } from '~/utils/misc';
import { ChevronDownIcon, PlusCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { FieldErrors, validateForm, validateObject } from '~/utils/validation';
import clsx from 'clsx';
import { Button, PrimaryButton } from '~/components/form';
import Tooltip from '~/components/Tooltip';
import { requireLoggedInUser } from '~/utils/auth.server';
import { ExerciseSchemaType, createUserWorkoutWithExercises } from '~/models/workout.server';

const targetOptions = ["reps", "time"]

const restOptions = [
  "None",
  "10 sec",
  "15 sec",
  "20 sec",
  "25 sec",
  "30 sec",
  "35 sec",
  "40 sec",
  "45 sec",
  "50 sec",
  "55 sec",
  "60 sec",
  "90 sec",
  "2 min",
  "3 min",
  "4 min",
  "5 min",
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
            orderInRoutine: idx + 1,
          }))
          await createUserWorkoutWithExercises(user.id, workoutName, workoutDescription, mappedExercises)
          return redirect("/app/workouts");
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
  }
  
  return null
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
};

type ComplexCard = {
  id: string;
  circuitId: string;
  exercises: WorkoutCard[];
}

const StrictModeDroppable = ({ children, ...props }: any) => {
  const [enabled, setEnabled] = useState(false);
  React.useEffect(() => {
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

const WorkoutBuilderForm = () => {
  const { exercises } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const createWorkoutFetcher = useFetcher<createWorkoutFetcherType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = navigation.formData?.get("_action") === "createUserWorkout";

  const [workoutCards, setWorkoutCards] = useState<Array<WorkoutCard | ComplexCard>>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [openDescription, setOpenDescription] = useState(false);

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
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map(card => {
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
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map(card => {
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
    setWorkoutCards((prev: Array<WorkoutCard | ComplexCard>) => prev.map(card => {
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

  const onChangeTarget = (event: BaseSyntheticEvent, id: string) => handleChange(id, "target", event.target.value)

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        {/* Create Workout Form */}
        <createWorkoutFetcher.Form method="post" className="flex flex-col w-1/2 p-4">
          <h2 className="mb-2 text-lg font-semibold">Create Workout</h2>
          <fieldset className="space-y-4 rounded-xl bg-white/5">
            <div className="flex flex-col">
              <label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></label>
              <input
                type="text"
                id="workoutName"
                name="workoutName"
                autoComplete="off"
                required
                className={clsx(
                  "p-2 rounded-md border-2 focus:outline-accent /*lg:w-2/3 xl:w-1/2*/ text-sm/6",
                  createWorkoutFetcher.data?.errors?.workoutName ? "border-red-500" : ""
                )}
                placeholder="Name your workout"
              />
              {createWorkoutFetcher.data?.errors?.workoutName ? <span className="text-red-500 text-xs">{createWorkoutFetcher.data?.errors?.workoutName}</span> : null}
            </div>
            <div className="flex flex-col">
            <button
              className="w-full flex justify-between items-center focus:outline-none /*lg:w-2/3 xl:w-1/2*/"
              onClick={() => setOpenDescription(!openDescription)}
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
                  <textarea
                    className="p-2 rounded-md border-2 focus:outline-accent /*lg:w-2/3 xl:w-1/2*/ text-sm/6 resize-none w-full"
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
              className="bg-slate-200 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded"
              disabled={!workoutCards.length}
            >
              {workoutCards.length >= 1 && workoutCards.length === selectedCards.size ? "Deselect All" : "Select All"}
            </button>
            <button
              type="button"
              onClick={handleCircuit}
              disabled={selectedCards.size < 2}
              className="bg-slate-200 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded"
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
                className="hidden overflow-y-auto md:flex flex-col shadow-inner bg-slate-200 rounded-md p-1 mt-1 mb-2"
              >
                {workoutCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided: DraggableProvided) => {
                      if (card.circuitId) {
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex flex-col mb-2 p-2 bg-gray-100 rounded shadow"
                          >
                            <div className="flex justify-between">
                              <div className="flex gap-2 mb-2">
                                <label className="text-xs self-end font-medium">Circuit of</label>
                                <input
                                  type="number"
                                  className="w-10 text-sm pl-2"
                                  defaultValue={3}
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
                              <div className="flex">
                                <input
                                  type="checkbox"
                                  className="mr-2 border-r checked:bg-yellow-400"
                                  checked={selectedCards.has(card.id)}
                                  onChange={() => handleCardSelect(card.id)}
                                />
                                <div className="flex flex-col gap-2 divide-y-4">
                                  {card.exercises.map((ex_item, ex_item_idx) => {
                                    return (
                                      <div className="flex flex-col gap-1 last:pt-1" key={`${ex_item.name}-${ex_item_idx}`}>
                                        <input type="hidden" name={`exercises[${index}][${ex_item_idx}].circuitId`} value={card.circuitId} />
                                        <input type="hidden" name={`exercises[${index}][${ex_item_idx}].sets`} value={ex_item.rounds ? ex_item.rounds : 3} />
                                        <input type="hidden" name={`exercises[${index}][${ex_item_idx}].rest`} value={ex_item.rest ? ex_item.rest : "60 sec"} />
                                        <div className="flex flex-col justify-between">
                                          <label className="text-xs self-start font-medium">Name</label>
                                          <p className="min-w-40 max-w-60 truncate shrink select-none">{ex_item.name}</p>
                                        </div>
                                        <div className="flex gap-3 h-10">
                                          <div className="flex flex-col justify-between">
                                            <label className="text-xs self-start font-medium">Target</label>
                                            <select
                                              className="text-xs h-5 self-end"
                                              defaultValue={ex_item.target ? ex_item.target : "reps"}
                                              name={`exercises[${index}][${ex_item_idx}].target`}
                                              onChange={(event) => onChangeCircuitTarget(card.id, ex_item.id, event.target.value)}
                                            >
                                              {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                                            </select>
                                          </div>
                                          {ex_item.target === "reps" ? (
                                            <div className="flex flex-col justify-between">
                                              <label className="text-xs self-start font-medium">Reps</label>
                                              <input
                                                type="number"
                                                className="w-10 text-sm pl-2 h-5"
                                                defaultValue="10"
                                                name={`exercises[${index}][${ex_item_idx}].reps`}
                                              />
                                            </div>
                                          ) : ex_item.target === "time" ? (
                                            <div className="flex flex-col justify-between">
                                              <label className="text-xs self-start font-medium">Time</label>
                                              <select
                                                className="text-xs h-5 self-end"
                                                defaultValue="30 sec"
                                                name={`exercises[${index}][${ex_item_idx}].time`}
                                              >
                                                {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                              </select>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col justify-between">
                                              <label className="text-xs self-start font-medium">Reps</label>
                                              <input
                                                type="number"
                                                className="w-10 text-sm pl-2 h-5"
                                                defaultValue="10"
                                                name={`exercises[${index}][${ex_item_idx}].reps`}
                                              />
                                            </div>
                                          )}
                                          <div className="flex flex-col justify-between">
                                            <label className="text-xs self-start font-medium">Notes</label>
                                            <input
                                              type="text"
                                              className="w-36 text-sm px-2 h-5 self-end placeholder:text-xs"
                                              placeholder="tempo, weight, etc."
                                              name={`exercises[${index}][${ex_item_idx}].notes`}
                                            />
                                          </div>
                                        </div>
                                        <input type="hidden" name={`exercises[${index}][${ex_item_idx}].exerciseId`} value={ex_item.id} />
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="self-center">
                                <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 justify-end">
                              <label className="text-xs self-end font-medium">Rest</label>
                              <select
                                className="text-xs h-5 self-end"
                                defaultValue="60 sec"
                                onChange={(event) => {
                                  const rest = event.target.value
                                  onChangeCircuitRest(card.id, rest)
                                }}
                              >
                                {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                              </select>
                              <label className="text-xs self-end font-medium">between rounds</label>
                            </div>
                          </div>
                        )
                      } else {
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded shadow"
                          >
                            <input type="hidden" name={`exercises[${index}].exerciseId`} value={card.id} />
                            <input
                              type="checkbox"
                              checked={selectedCards.has(card.id)}
                              onChange={() => handleCardSelect(card.id)}
                            />
                            <div className="flex justify-between w-full">
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-col justify-between">
                                  <label className="text-xs self-start font-medium">Name</label>
                                  <p className="min-w-40 max-w-60 truncate shrink select-none">{card.name}</p>
                                </div>
                                <div className="flex flex-wrap max-w-full gap-3">
                                  <div className="flex flex-col justify-between">
                                    <label className="text-xs self-start font-medium">Sets</label>
                                    <input
                                      type="number"
                                      className="w-10 text-sm pl-2 h-5"
                                      defaultValue="3"
                                      min={1}
                                      max={10}
                                      name={`exercises[${index}].sets`}
                                    />
                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-xs self-start font-medium">Target</label>
                                    <select
                                      className="text-xs h-5 self-end"
                                      defaultValue="reps"
                                      name={`exercises[${index}].target`}
                                      value={card.target}
                                      onChange={(event) => onChangeTarget(event, card.id)}
                                    >
                                      {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                                    </select>
                                  </div>
                                  {card.target === "reps" ? (
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium">Reps</label>
                                      <input
                                        type="number"
                                        className="w-10 text-sm pl-2 h-5"
                                        defaultValue="10"
                                        name={`exercises[${index}].reps`}
                                      />
                                    </div>
                                  ) : card.target === "time" ? (
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium">Time</label>
                                      <select
                                        className="text-xs h-5 self-end"
                                        defaultValue="30 sec"
                                        name={`exercises[${index}].time`}
                                      >
                                        {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col justify-between">
                                      <label className="text-xs self-start font-medium">Reps</label>
                                      <input
                                        type="number"
                                        className="w-10 text-sm pl-2 h-5"
                                        defaultValue="10"
                                        name={`exercises[${index}].reps`}
                                      />
                                    </div>
                                  )}
                                  <div className="flex flex-col justify-between">
                                    <label className="text-xs self-start font-medium">Notes</label>
                                    <input
                                      type="text"
                                      className="w-36 text-sm px-2 h-5 self-end"
                                      placeholder="reps, tempo, etc."
                                      name={`exercises[${index}].notes`}
                                    />
                                  </div>
                                  <div className="flex flex-col justify-between">
                                    <label className="text-xs self-start font-medium">Rest</label>
                                    <select
                                      className="text-xs h-5 self-end"
                                      defaultValue="60 sec"
                                      name={`exercises[${index}].rest`}
                                    >
                                      {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                                    </select>
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
                <p className="text-sm text-slate-400 text-center content-center p-4 border-2 bg-white border-dashed border-gray-300 rounded-md h-full select-none">
                  Drag 'n' drop exercise(s) here
                </p>
              </motion.div>
            )}
          </StrictModeDroppable>
          {createWorkoutFetcher.data?.errors?.exercises ? <span className="text-red-500 text-xs">{createWorkoutFetcher.data?.errors?.exercises}</span> : null}
          <div className="flex-none flex justify-end gap-2">
            <Link to="/app/workouts" className="bg-gray-300 px-4 py-2 rounded">Cancel</Link>
            <PrimaryButton
              type="submit"
              name="_action"
              value="createUserWorkout"
              className="bg-blue-500 text-white px-4 py-2 rounded"
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
        <div className="flex flex-col w-1/2 p-4 bg-gray-200">
          <h2 className="mb-2 text-lg font-semibold">Available Exercises</h2>
          <Form
            className={clsx(
              "flex content-center rounded-md mb-2 focus-within:outline focus-within:outline-2 focus-within:outline-accent /*lg:w-2/3 xl:w-1/2*/ bg-white",
              isSearching ? "animate-pulse" : ""
            )}
          >
            <button type="submit">
              <SearchIcon className="size-6 ml-2 text-slate-400" />
            </button>
            <input
              defaultValue={searchParams.get("q") ?? ""}
              type="text"
              name="q"
              placeholder="Search exercises ..."
              autoComplete="off"
              className="w-full p-2 outline-none text-sm/6 rounded-md text-slate-400"
            />
          </Form>
          <StrictModeDroppable droppableId="availableCards" isDropDisabled={true}>
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="overflow-y-auto"
              >
                {exercises.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided: DraggableProvided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded shadow"
                        style={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0px, 0px)',
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-300 flex items-center justify-center rounded text-xs">
                          Image
                        </div>
                        <span>{card.name}</span>
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
  );
};

export default WorkoutBuilderForm;