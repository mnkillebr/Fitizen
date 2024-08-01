import { BaseSyntheticEvent, useCallback, useState } from "react";
import { Field, Fieldset, Input, Label, Legend, Textarea } from "@headlessui/react";
import { ChevronDownIcon, PlusCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { getWorkout } from "~/models/workout.server";
import { Exercise as ExerciseType, RoutineExercise as RoutineExerciseType } from "@prisma/client";
import { requireLoggedInUser } from "~/utils/auth.server";
import { FieldErrors } from "~/utils/validation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Tooltip from "~/components/Tooltips";
import db from "~/db.server";
import { Button, PrimaryButton } from "~/components/form";
import { isEmptyObject } from "~/utils/misc";
import { Exercise } from "../library";
import { getAllExercises } from "~/models/exercise.server";

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

interface ExerciseProps {
  id: string;
  name: string;
  body: string[];
  order: number;
  target: 'reps' | 'time';
  reps?: number;
  sets?: number;
  rounds?: number;
  time?: number;
  rest?: number;
  notes?: string;
  contraction: string | null;
  side?: "left" | "right";
  itemType: "regular";
}

export interface Circuit {
  id: string;
  exercises: ExerciseProps[];
  itemType: "circuit";
  rounds: number;
  rest: string;
}

type WorkoutItem = ExerciseProps | Circuit;

function isWorkoutItemExercise(item: WorkoutItem): item is ExerciseProps {
  return item.itemType === "regular";
}
function isWorkoutItemCircuit(item: WorkoutItem): item is Circuit {
  return item.itemType === "circuit";
}

type DraggableExerciseItemProps = {
  checkedItems: Array<WorkoutItem>;
  handleCheckItem: (item: WorkoutItem) => void;
  index: number;
  item: WorkoutItem;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  ungroupFn: (item: Circuit) => void;
  handleChange: (id: string, subId: string | null, field: string, value: string | number) => void;
}

const DraggableExerciseItem = ({
  item,
  handleCheckItem,
  checkedItems,
  index,
  moveItem,
  ungroupFn,
  handleChange,
}: DraggableExerciseItemProps) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'exercise',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'exercise',
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  const onChangeRest = (event: BaseSyntheticEvent, id: string, subId: string | null) => handleChange(id, subId, "rest", event.target.value)
  const onChangeTarget = (event: BaseSyntheticEvent, id: string, subId: string | null) => handleChange(id, subId, "target", event.target.value)
  const onChangeReps = (reps: number, id: string, subId: string | null) => handleChange(id, subId, "reps", reps)
  const onChangeTime = (event: BaseSyntheticEvent, id: string, subId: string | null) => handleChange(id, subId, "time", event.target.value)
  const onChangeNotes = (event: BaseSyntheticEvent, id: string, subId: string | null) => handleChange(id, subId, "notes", event.target.value)

  if (isWorkoutItemCircuit(item)) {
    return (
      <div
        key={item.id}
        ref={dragPreview}
        className={clsx(
          "border-2 border-dashed rounded-lg my-2 shadow-inner",
          isDragging ? "opacity-50" : "",
        )}
      >
        <div ref={drop} className="m-1 p-2 rounded-md bg-slate-100 shadow-md">
          <div className="flex justify-between">
            <div className="flex gap-2 mb-2">
              <label className="text-xs self-end font-medium">Circuit of</label>
              <input
                type="number"
                className="w-10 text-sm pl-2"
                defaultValue={item.rounds ? item.rounds : 3}
                min={1}
                max={10}
                onChange={(event) => {
                  const rounds = parseInt(event.target.value)
                  handleChange(item.id, null, "rounds", rounds)
                }}
              />
              <label className="text-xs self-end font-medium">rounds</label>
            </div>
            <button className="text-xs font-medium underline" onClick={() => ungroupFn(item)}>Ungroup</button>
          </div>
          <div className="flex h-full w-full justify-between">
            <div className="flex">
              <input
                type="checkbox"
                className="mr-2 border-r checked:bg-yellow-400"
                onChange={() => handleCheckItem(item)}
                checked={checkedItems.map(checked => checked.id).includes(item.id)}
              />
              <div className="flex flex-col gap-1 divide-y-4">
                {item.exercises.map((ex_item, ex_item_idx) => {
                  return (
                    <div className="flex flex-col gap-1 last:pt-1" key={`${ex_item.name}-${ex_item_idx}`}>
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
                            onChange={(event) => onChangeTarget(event, item.id, ex_item.id)}
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
                              defaultValue={ex_item.reps ? ex_item.reps : 10}
                              onChange={(event) => {
                                const sets = parseInt(event.target.value)
                                onChangeReps(sets, item.id, ex_item.id)
                              }}
                            />
                          </div>
                        ) : ex_item.target === "time" ? (
                          <div className="flex flex-col justify-between">
                            <label className="text-xs self-start font-medium">Time</label>
                            <select
                              className="text-xs h-5 self-end"
                              defaultValue={ex_item.time ? ex_item.time : "30 sec"}
                              onChange={(event) => onChangeTime(event, item.id, ex_item.id)}
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
                              defaultValue={ex_item.reps ? ex_item.reps : 10}
                              onChange={(event) => {
                                const sets = parseInt(event.target.value)
                                onChangeReps(sets, item.id, ex_item.id)
                              }}
                            />
                          </div>
                        )}
                        <div className="flex flex-col justify-between">
                          <label className="text-xs self-start font-medium">Notes</label>
                          <input
                            type="text"
                            className="w-36 text-sm px-2 h-5 self-end placeholder:text-xs"
                            placeholder="tempo, weight, etc."
                            defaultValue={ex_item.notes ? ex_item.notes : undefined}
                            onChange={(event) => onChangeNotes(event, item.id, ex_item.id)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div ref={drag} className="self-center">
              <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
            </div>
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <label className="text-xs self-end font-medium">Rest</label>
            <select
              className="text-xs h-5 self-end"
              defaultValue={item.rest ? item.rest : "60 sec"}
              onChange={(event) => onChangeRest(event, item.id, null)}
            >
              {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
            </select>
            <label className="text-xs self-end font-medium">between rounds</label>
          </div>
        </div>
      </div>
    )
  } else if (isWorkoutItemExercise(item)) {
    return (
      <div
        key={`${item.itemType}-${item.id}`}
        ref={dragPreview}
        className={clsx(
          "bg-slate-100 rounded-lg my-2 shadow-md py-2",
          isDragging ? "opacity-50" : "",
        )}
      >
        <div ref={drop} className="flex items-center h-full">
          <input
            type="checkbox"
            className="mx-2 border-r checked:bg-yellow-400"
            onChange={() => handleCheckItem(item)}
            checked={checkedItems.map(checked => checked.id).includes(item.id)}
          />
          {/* <p className="border-r w-8 text-center select-none">{idx+1}</p> */}
          <div className="flex justify-between w-full">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col justify-between">
                <label className="text-xs self-start font-medium">Name</label>
                <p className="min-w-40 max-w-60 truncate shrink select-none">{item.name}</p>
              </div>
              <div className="flex flex-wrap max-w-full gap-3">
                <div className="flex flex-col justify-between">
                  <label className="text-xs self-start font-medium">Sets</label>
                  <input
                    type="number"
                    className="w-10 text-sm pl-2 h-5"
                    defaultValue={item.sets ? item.sets : 3}
                    min={1}
                    max={10}
                    onChange={(event) => {
                      const sets = parseInt(event.target.value)
                      handleChange(item.id, null, "sets", sets)
                    }}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <label className="text-xs self-start font-medium">Target</label>
                  <select
                    className="text-xs h-5 self-end"
                    defaultValue={item.target ? item.target : "reps"}
                    onChange={(event) => onChangeTarget(event, item.id, null)}
                  >
                    {targetOptions.map((target, target_idx) => <option key={target_idx}>{target}</option>)}
                  </select>
                </div>
                {item.target === "reps" ? (
                  <div className="flex flex-col justify-between">
                    <label className="text-xs self-start font-medium">Reps</label>
                    <input
                      type="number"
                      className="w-10 text-sm pl-2 h-5"
                      defaultValue={item.reps ? item.reps : 10}
                      onChange={(event) => {
                        const sets = parseInt(event.target.value)
                        onChangeReps(sets, item.id, null)
                      }}
                    />
                  </div>
                ) : item.target === "time" ? (
                  <div className="flex flex-col justify-between">
                    <label className="text-xs self-start font-medium">Time</label>
                    <select
                      className="text-xs h-5 self-end"
                      defaultValue={item.time ? item.time : "30 sec"}
                      onChange={(event) => onChangeTime(event, item.id, null)}
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
                      defaultValue={10}
                      onChange={(event) => {
                        const sets = parseInt(event.target.value)
                        onChangeReps(sets, item.id, null)
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col justify-between">
                  <label className="text-xs self-start font-medium">Notes</label>
                  <input
                    type="text"
                    className="w-36 text-sm px-2 h-5 self-end"
                    placeholder="reps, tempo, etc."
                    defaultValue={item.notes ? item.notes : undefined}
                    onChange={(event) => onChangeNotes(event, item.id, null)}
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <label className="text-xs self-start font-medium">Rest</label>
                  <select
                    className="text-xs h-5 self-end"
                    defaultValue={item.rest ? item.rest : "60 sec"}
                    onChange={(event) => onChangeRest(event, item.id, null)}
                  >
                    {restOptions.map((rest, rest_idx) => <option key={rest_idx}>{rest}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div ref={drag} className="self-center">
              <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing mr-2" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

type PanelItemProps = {
  addCallbackFn: () => void;
  removeCallbackFn: (items: Array<WorkoutItem>) => void;
  handleMoveFn: (dragIndex: number, hoverIndex: number) => void;
  handleCircuitFn: (items: Array<WorkoutItem>) => void;
  handleUngroupFn: (item: Circuit) => void;
  handleChangeFieldFn: (id: string, subId: string | null, field: string, value: string | number) => void;
  panelText: string;
  subItems?: Array<WorkoutItem>;
}

const PanelItem = ({
  addCallbackFn,
  removeCallbackFn,
  handleMoveFn,
  handleCircuitFn,
  handleUngroupFn,
  handleChangeFieldFn,
  panelText,
  subItems = [],
}: PanelItemProps) => {
  const [checkedSubItems, setCheckedSubItems] = useState<Array<WorkoutItem>>([]);

  const handleCheckSubItem = (exercise: WorkoutItem) => {
    return checkedSubItems.map(checked => checked.id).includes(exercise.id) ? setCheckedSubItems(checkedSubItems.filter(item => item.id !== exercise.id)) : setCheckedSubItems([...checkedSubItems, exercise]);
  }
  const handleRemoveCheckedSubItems = () => {
    setCheckedSubItems([])
    return removeCallbackFn(checkedSubItems)
  }

  const handleCreateCircuit = () => {
    setCheckedSubItems([])
    return handleCircuitFn(checkedSubItems.filter(subItem => subItem.itemType !== "circuit"))
  }
  // console.log(checkedSubItems.filter(subItem => subItem.itemType !== "circuit"))
  return (
    <div className="lg:w-2/3 xl:w-1/2">
      <div className="flex justify-between">
        <div className="flex *:px-1 gap-2 *:border *:border-black *:text-sm">
          <button
            className="hover:bg-slate-200 disabled:opacity-30"
            disabled={!subItems.length}
            onClick={() => subItems.length === checkedSubItems.length ? setCheckedSubItems([]) : setCheckedSubItems(subItems)}
          >
            {subItems.length >= 1 && subItems.length === checkedSubItems.length ? "Deselect All" : "Select All"}
          </button>
          {/* <button
            className="hover:bg-slate-200 disabled:opacity-30"
            disabled={checkedSubItems.length < 2}
            onClick={handleCreateSuperset}
          >
            Superset
          </button> */}
          <button
            className="hover:bg-slate-200 disabled:opacity-30"
            disabled={checkedSubItems.filter(subItem => subItem.itemType !== "circuit").length < 2}
            onClick={handleCreateCircuit}
          >
            Circuit
          </button>
          {/* <button
            className="hover:bg-slate-200 disabled:opacity-30"
            // disabled={checkedSubItems.length < 2}
            // onClick={handleAddRest}
          >
            Add Rest
          </button> */}
        </div>
        <button className="disabled:opacity-30" disabled={!checkedSubItems.length} onClick={handleRemoveCheckedSubItems}>
          <Tooltip label="Delete" className="bottom-5 right-1">
            <TrashIcon className="size-4 text-red-500" />
          </Tooltip>
        </button>
      </div>
      <div>
        {subItems.map((subItem, idx) => (
          <DraggableExerciseItem
            key={`${subItem.itemType}-${subItem.id}`}
            item={subItem}
            index={idx}
            handleCheckItem={handleCheckSubItem}
            checkedItems={checkedSubItems}
            moveItem={handleMoveFn}
            ungroupFn={handleUngroupFn}
            handleChange={handleChangeFieldFn}
          />
        ))}
      </div>
      <div className="border-2 border-dashed rounded-md px-3 py-2 flex flex-col justify-center items-center my-1">
        <p className="text-sm text-slate-400">{panelText}</p>
        <button onClick={addCallbackFn}>
          <PlusCircleIcon className="size-10 text-accent"/>
        </button>
      </div>
    </div>
  )
}

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
    const nonGrouped = detailedExercises.filter(ex => ex.groupType === "regular").map(ex => ({...ex, itemType: ex.groupType }))
    const grouped = detailedExercises.filter(ex => ex.groupType === "circuit").reduce((result: any, curr: any) => {
      let resultArr = result
      if (curr.groupId?.length) {
        const groupId = curr.groupId
        if (resultArr.find((ex_item: any) => ex_item.groupId === groupId)) {
          return resultArr.map((ex_item: any) => {
            if (ex_item.groupId === groupId) {
              return {
                ...ex_item,
                exercises: ex_item.exercises.concat(curr)
              }
            }
          })
        } else {
          return resultArr.concat({
            groupId,
            id: groupId,
            groupType: curr.groupType,
            itemType: curr.groupType,
            orderInRoutine: curr.orderInRoutine,
            rounds: curr.rounds,
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

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const allExercises = await getAllExercises(query);
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
  const exerciseIds = workout?.exercises?.map(item => item.exerciseId)
  const exercises = await db.exercise.findMany({
    where: {
      id: {
        in: exerciseIds
      }
    }
  });
  const exerciseDetails = exerciseDetailsMap(workout?.exercises, exercises)
  return json({ workout, exerciseDetails, allExercises })
}

export default function Edit() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const [openExercisesPanel, setOpenExercisesPanel] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Array<any>>(data.exerciseDetails);
  const [workoutName, setWorkoutName] = useState(data.workout?.name);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [workoutDescription, setWorkoutDescription] = useState<string>(data.workout?.description || "");

  const isSearching = navigation.formData?.has("q");
  const isUpdatingWorkout = navigation.formData?.get("_action") === "updateCustomWorkout";

  const toggleExercisesPanel = () => setOpenExercisesPanel(!openExercisesPanel);

  const handleAddExercise = useCallback((exercise: WorkoutItem) => {
    const newExercise = {
      ...exercise,
      target: "reps",
      reps: 10,
      sets: 3,
      rest: "60 sec",
      time: "30 sec",
      itemType: "regular"
    }
    const currentExercises = selectedExercises
    const isIncluded = currentExercises.map(sel_ex => sel_ex.id).includes(exercise.id);
    const updatedExerciseList = isIncluded 
      ? currentExercises.filter(sel_ex => sel_ex.id !== exercise.id)
      : [...currentExercises, newExercise];
    setSelectedExercises(updatedExerciseList)
    updatedExerciseList.length && setErrors({ ...errors, "exercises": "" })
  }, [selectedExercises])

  const handleRemoveExercises = useCallback((exercises: Array<WorkoutItem>) => {
    const currentExercises = selectedExercises
    const comparisonIds = exercises.map(item => item.id);
    const updatedExerciseList = currentExercises.filter(item => !comparisonIds.includes(item.id))
      .concat(exercises.filter(item => !currentExercises.some(currentItem => currentItem.id === item.id)))
    setSelectedExercises(updatedExerciseList)
  }, [selectedExercises]);

  const handleMoveExercise = useCallback((dragIndex: number, hoverIndex: number) => {
    const currentExercises = selectedExercises
    const draggedItem = currentExercises[dragIndex];
    const updatedExerciseList = [...currentExercises];
    updatedExerciseList.splice(dragIndex, 1);
    updatedExerciseList.splice(hoverIndex, 0, draggedItem);
    setSelectedExercises(updatedExerciseList)
  }, [selectedExercises]);

  const handleCircuit = useCallback((items: Array<WorkoutItem>) => {
    const currentExercises = selectedExercises

    // remove items 
    const comparisonIds = items.map(item => item.id);
    const updatedExerciseList = currentExercises.filter(item => !comparisonIds.includes(item.id))
      .concat(items.filter(item => !currentExercises.some(currentItem => currentItem.id === item.id)))
    
    const circuitId = updatedExerciseList.filter(item => item.itemType === "circuit").length ? `circuit-${updatedExerciseList.filter(item => item.itemType === "circuit").length + 1}` : "circuit-1"
    // add items as circuit
    const listWithCircuit = [...updatedExerciseList, {
      id: circuitId,
      exercises: items.map(item => ({
        ...item,
        rounds: 3,
        rest: "60 sec"
      })),
      itemType: "circuit",
      groupType: "circuit",
    }]

    setSelectedExercises(listWithCircuit)
  }, [selectedExercises])

  const handleUngroup = useCallback((item: Circuit) => {
    const currentExercises = selectedExercises

    // remove item
    const filteredList = currentExercises.filter(curr_ex => curr_ex.id !== item.id)
    // console.log('filtered b4', filteredList)
    // add items as individual exercises
    const updatedExerciseList = [
      ...filteredList,
      ...item.exercises.map(subItem => ({
        ...subItem,
        itemType: "regular",
        groupType: "regular",
        groupId: "",
        sets: subItem.rounds,
      })),
    ]
    setSelectedExercises(updatedExerciseList)
  }, [selectedExercises])

  const handleChangeField = useCallback((id: string, subId: string | null, field: string, value: string | number) => {
    const currentExercises = selectedExercises
    const updatedExerciseList = currentExercises.map(exercise => {
      if (exercise.id === id) {
        if (exercise.exercises) {
          if (subId) {
            return {
              ...exercise,
              exercises: exercise.exercises.map((item: ExerciseProps) => {
                if (item.id === subId) {
                  return {
                    ...item,
                    [field]: value,
                  }
                } else {
                  return item
                }
              }),
            }
          } else {
            return {
              ...exercise,
              exercises: exercise.exercises.map((item: ExerciseProps) => {
                return {
                  ...item,
                  [field]: value,
                }
              }),
            }
          }
        } else {
          return {
            ...exercise,
            [field]: value,
          }
        }
      } else {
        return exercise
      }
    })
    setSelectedExercises(updatedExerciseList)
  }, [selectedExercises])

  const handleUpdateWorkout = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workoutName) {
      return setErrors({ ...errors, "workoutName": "Name cannot be blank", })
    } else if (isEmptyObject(selectedExercises)) {
      return setErrors({ ...errors, "exercises": "You must add at least one exercise" })
    }
    if (isEmptyObject(errors)) {
      const formData = new FormData();
      const workoutId = data.workout?.id as string;
      const orderMappedExercises = selectedExercises.reduce((result, curr) => {
        let resultArr = result
        if (curr) {
          if (curr.exercises) {
            const mappedGroup = curr.exercises.map((ex: any) => ({
              ...ex,
              groupId: curr.id,
              groupType: curr.itemType,
              itemType: curr.itemType
            }))
            return resultArr.concat(mappedGroup)
          } else {
            return resultArr.concat(curr)
          }
        }
        return resultArr
      }, []).map((selected: any, idx: number) => ({
        ...selected,
        orderInRoutine: idx + 1,
      }))
      const prevExercises = data.exerciseDetails.reduce((result: any, curr: any) => {
        let resultArr = result
        if (curr) {
          if (curr.exercises) {
            return resultArr.concat(curr.exercises)
          } else {
            return resultArr.concat(curr)
          }
        }
        return resultArr
      }, [])
      const newExercises = orderMappedExercises.reduce((result: any, curr: any) => {
        let resultArr = result
        if (curr) {
          if (curr.exercises) {
            const newFilter = curr.exercises.filter((ex: any) => !prevExercises.map((prev: any) => prev.exerciseId).includes(ex.exerciseId))
            return resultArr.concat(newFilter)
          } else if (!prevExercises.map((prev: any) => prev.exerciseId).includes(curr.exerciseId)) {
            return resultArr.concat(curr)
          }
        }
        return resultArr
      }, [])
      const updatedExercises = orderMappedExercises.filter((selected: any) => !newExercises.map((ex: any) => ex.exerciseId).includes(selected.exerciseId))
      const deletedExercises = prevExercises.filter((prev: any) => !newExercises.map((ex: any) => ex.exerciseId).includes(prev.exerciseId) && !updatedExercises.map((ex: any) => ex.exerciseId).includes(prev.exerciseId))
      formData.append("_action", "updateCustomWorkout")
      formData.append("id", workoutId)
      formData.append("name", workoutName)
      formData.append("description", workoutDescription)
      formData.append("updatedExercises", JSON.stringify(updatedExercises));
      formData.append("newExercises", JSON.stringify(newExercises));
      formData.append("deletedExercises", JSON.stringify(deletedExercises));
      // console.log(updatedExercises, newExercises, deletedExercises)
  
      return submit(formData, { method: "post", action: "/app/workouts" });
    }
  }, [selectedExercises, workoutName, workoutDescription, errors, setErrors, data.workout, data.exerciseDetails])

  // console.log(selectedExercises)
  return (
    <>
      <div className="px-4 md:px-6 py-6 md:py-8 flex flex-col gap-y-2 h-full relative justify-between">
        <div className="px-2 overflow-y-auto">
          <Fieldset className="space-y-4 rounded-xl bg-white/5">
            <Legend className="text-base/7 font-semibold">Edit Workout</Legend>
            <Field className="flex flex-col">
              <Label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></Label>
              <Input
                type="text"
                value={workoutName}
                autoComplete="off"
                onChange={(e) => {
                  const inputValue = e.target.value
                  setWorkoutName(inputValue)
                  inputValue.length ? setErrors({ ...errors, "workoutName": "" }) : null
                }}
                className={clsx(
                  "p-2 rounded-md border-2 focus:outline-accent lg:w-2/3 xl:w-1/2 text-sm/6",
                  errors["workoutName"] ? "border-red-500" : ""
                )}
                placeholder="Name your workout"
              />
              {errors["workoutName"] ? <span className="text-red-500 text-xs">{errors["workoutName"]}</span> : null}
            </Field>
            <Field className="flex flex-col">
              <button
                className="w-full flex justify-between items-center focus:outline-none lg:w-2/3 xl:w-1/2"
                onClick={() => setOpenDescription(!openDescription)}
              >
                <Label className="text-sm/6 font-medium">Description</Label>
                <motion.div
                  animate={{ rotate: openDescription ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </motion.div>
              </button>
              {/* <Description className="text-xs">
                A good way to reference the goals of the workout
              </Description> */}
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
                      className="p-2 rounded-md border-2 focus:outline-accent lg:w-2/3 xl:w-1/2 text-sm/6 resize-none w-full"
                      placeholder="Optional"
                      autoFocus
                      rows={3}
                      value={workoutDescription}
                      onChange={(e) => setWorkoutDescription(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Field>
          </Fieldset>
          <DndProvider backend={HTML5Backend}>
            <div className="mt-4">
              <p className="text-sm/6 font-medium">Exercises<span className="text-xs ml-1">*</span></p>
              <PanelItem
                addCallbackFn={toggleExercisesPanel}
                removeCallbackFn={handleRemoveExercises}
                handleMoveFn={handleMoveExercise}
                handleCircuitFn={handleCircuit}
                handleUngroupFn={handleUngroup}
                handleChangeFieldFn={handleChangeField}
                panelText="Add exercise(s)"
                subItems={selectedExercises}
              />
            </div>
          </DndProvider>
          {errors["exercises"] ? <span className="text-red-500 text-xs">{errors["exercises"]}</span> : null}
        </div>
        <div className="w-full lg:w-2/3 xl:w-1/2 flex flex-none gap-x-2 items-center px-2">
          <Link to={`/app/workouts/${data.workout?.id}`} className="flex-1">
            <Button className="w-full border-2 text-accent border-accent hover:bg-gray-50">
              Cancel
            </Button>
          </Link>
          <Form onSubmit={handleUpdateWorkout} className="w-1/2">
            <PrimaryButton
              className="w-full"
              type="submit"
              isLoading={isUpdatingWorkout}
            >
              Save
            </PrimaryButton>
          </Form>
        </div>
        {/* <div>Edit Page {data.workout?.name}</div> */}
      </div>
      <AnimatePresence>
        {openExercisesPanel && (
          <motion.div
            className="absolute bottom-0 left-0 md:left-64 md:max-w-[calc(100vw-16rem)] flex flex-col gap-y-2 h-2/3 bg-slate-400 w-screen rounded-t-lg text-white p-6 md:p-8"
            initial={{ translateY: "100%" }}
            animate={{ translateY: "0%" }}
            exit={{ translateY: "100%" }}
            transition={{ ease: [0, 0.71, 0.2, 1.01], }}
          >
            <div className="flex justify-between">
              <p>Exercises</p>
              <button onClick={(event) => {
                setOpenExercisesPanel(false)
                setSearchParams((prev) => {
                  prev.set("q", "");
                  return prev;
                });
              }}>
                <XMarkIcon className="size-6 hover:text-accent"/>
              </button>
            </div>
            <Form
              className={`flex content-center border-2 rounded-md focus-within:border-accent lg:w-2/3 xl:w-1/2 bg-white ${
                isSearching ? "animate-pulse" : ""
              }`}
            >
              <button type="submit">
                <SearchIcon className="size-6 ml-2 text-slate-400" />
              </button>
              <input
                type="hidden"
                name="id"
                value={data.workout?.id}
              />
              <input
                defaultValue={searchParams.get("q") ?? ""}
                type="text"
                name="q"
                placeholder="Search exercises ..."
                autoComplete="off"
                className="w-full p-2 outline-none rounded-md text-slate-400"
              />
            </Form>
            <div className="flex flex-col gap-y-2 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto text-slate-900">
              {data.allExercises.map((ex_item) => (
                <Exercise
                  key={ex_item.id}
                  exercise={ex_item}
                  selectable
                  selectFn={handleAddExercise}
                  selected={selectedExercises.reduce((result, curr) => {
                    let resultArr = result
                    if (curr.exercises) {
                      return resultArr.concat(curr.exercises)
                    } else {
                      return resultArr.concat(curr)
                    }
                  }, []).map((sel_ex: ExerciseProps) => sel_ex.id).includes(ex_item.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}