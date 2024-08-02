import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, Link, useLoaderData, useNavigation, useSearchParams, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getAllExercises } from '~/models/exercise.server';
import { AnimatePresence, motion } from "framer-motion";
import { useIsHydrated } from '~/utils/misc';
import { ChevronDownIcon, PlusCircleIcon, XMarkIcon, Bars3Icon, TrashIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { FieldErrors } from '~/utils/validation';
import clsx from 'clsx';
import { Button, PrimaryButton } from '~/components/form';
import Tooltip from '~/components/Tooltip';
// import { Exercise as ExerciseType } from '@prisma/client';

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

interface Player {
  id: number;
  name: string;
}

interface RosterPlayer extends Player {
  rosterId: number;
}

type ExerciseType = {
  id: string;
  name: string;
}

interface WorkoutExercise extends ExerciseType {
  listId: number;
  circuit?: boolean
}

const ExerciseItem = ({
  exercise,
  checked,
  index,
  checkExercise,
  moveExercise,
  removeExercise,
  listType,
}: {
  exercise: ExerciseType | WorkoutExercise;
  checked?: boolean
  index: number;
  checkExercise: (exercise: WorkoutExercise) => void;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  removeExercise: (listId: number) => void;
  listType: "workoutList" | "available";
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'EXERCISE',
    item: { id: exercise.id, index, listType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'EXERCISE',
    hover: (item: { index: number; listType: string }, monitor) => {
      if (item.listType !== "workoutList" || listType !== "workoutList") return;
      if (item.index === index) return;
      moveExercise(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={listType === "workoutList" ? (node) => drag(drop(node)) : drag}
      className={clsx(
        "flex p-2 mb-2 bg-white rounded shadow cursor-move",
        listType === "available" ? "hover:shadow-accent" : "",
        isDragging ? "opacity-50" : "",
      )}
    >
      {listType === "workoutList" && (
        <input
          type="checkbox"
          className="mr-2"
          onChange={() => "listId" in exercise ? checkExercise(exercise) : null}
          checked={checked}
        />
      )}
      <div className="flex justify-between w-full">
        {exercise.name}
        {listType === "workoutList" && (
          <button
            onClick={() =>
              removeExercise("listId" in exercise ? exercise.listId : -1)
            }
            className="ml-2 text-red-500"
          >
            X
          </button>
        )}
        {listType === "available" && (
          <div className="hidden lg:flex self-center">
            <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
          </div>
        )}
      </div>
    </div>
  );
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
}

function CreateContent() {
  // Remix hooks
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = navigation.formData?.get("_action") === "createCustomWorkout";

  // local state hooks
  // const [availablePlayers] = useState<Player[]>([
  //   { id: 1, name: 'LeBron James' },
  //   { id: 2, name: 'Stephen Curry' },
  //   { id: 3, name: 'Kevin Durant' },
  //   { id: 4, name: 'Giannis Antetokounmpo' },
  //   { id: 5, name: 'Kawhi Leonard' },
  // ]);
  const [workoutList, setWorkoutList] = useState<WorkoutExercise[]>([]);
  const [checkedItems, setCheckedItems] = useState<WorkoutExercise[]>([]);
  const [nextListId, setNextListId] = useState(1);
  const [workoutName, setWorkoutName] = useState("")
  const [workoutDescription, setWorkoutDescription] = useState("")
  // const [openExercisesPanel, setOpenExercisesPanel] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  // const [openIndex, setOpenIndex] = useState<null | number>(1);
  // const [selectedExercises, setSelectedExercises] = useState<Array<any>>([]);
  const [errors, setErrors] = useState<FieldErrors>({})


  // Drag and drop functions
  const moveExercise = (dragIndex: number, hoverIndex: number) => {
    const newWorkoutList = [...workoutList];
    const [removed] = newWorkoutList.splice(dragIndex, 1);
    newWorkoutList.splice(hoverIndex, 0, removed);
    setWorkoutList(newWorkoutList);
  };
  const removeExercise = (listId: number) => {
    setWorkoutList((prev) => prev.filter((p) => p.listId !== listId));
  };
  const [, dropWorkoutList] = useDrop({
    accept: 'EXERCISE',
    drop: (item: { id: string; listType: string }, monitor) => {
      if (item.listType === 'available') {
        const exercise = data.exercises.find((p) => p.id === item.id);
        if (exercise) {
          const workoutListItem: WorkoutExercise = {
            ...exercise,
            listId: nextListId,
          };
          setWorkoutList((prev) => [...prev, workoutListItem]);
          setNextListId((prevId) => prevId + 1);
        }
      }
    },
  });

  // Workout list functions
  const handleCheckItem = (exercise: WorkoutExercise) => {
    return checkedItems.map(checked => checked.id).includes(exercise.id) ? setCheckedItems(checkedItems.filter(item => item.id !== exercise.id)) : setCheckedItems([...checkedItems, exercise]);
  }
  const handleRemoveExercises = () => {
    setWorkoutList((prev) => prev.filter((p) => !checkedItems.map((item) => item.listId).includes(p.listId)));
    setCheckedItems([])
  }
  // form submit functions
  const handleSaveWorkout = () => {}
  console.log(checkedItems)
  return (
    <div className="flex h-screen">
      {/* Create Form */}
      <div ref={dropWorkoutList} className="flex flex-col w-1/2 p-4">
        <h2 className="mb-2 text-lg font-semibold">Create Workout</h2>
        <fieldset className="space-y-4 rounded-xl bg-white/5">
          <div className="flex flex-col">
            <label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></label>
            <input
              type="text"
              value={workoutName}
              name="workoutName"
              autoComplete="off"
              onChange={(e) => {
                const inputValue = e.target.value
                setWorkoutName(inputValue)
                inputValue.length ? setErrors({ ...errors, "workoutName": "" }) : null
              }}
              className={clsx(
                "p-2 rounded-md border-2 focus:outline-accent /*lg:w-2/3 xl:w-1/2*/ text-sm/6",
                errors["workoutName"] ? "border-red-500" : ""
              )}
              placeholder="Name your workout"
            />
            {errors["workoutName"] ? <span className="text-red-500 text-xs">{errors["workoutName"]}</span> : null}
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
                    autoFocus
                    rows={3}
                    value={workoutDescription}
                    onChange={(e) => setWorkoutDescription(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </fieldset>
        <div className="mt-2">
          <label className="text-sm/6 font-medium">Exercises<span className="text-xs ml-1">*</span></label>
        </div>
        <div className="flex justify-between">
          <div className="flex *:rounded-sm *:px-1 gap-2 *:border *:border-black *:text-sm my-1">
            <button
              className="hover:bg-slate-200 disabled:opacity-30"
              disabled={!workoutList.length}
              onClick={() => workoutList.length === checkedItems.length ? setCheckedItems([]) : setCheckedItems(workoutList)}
            >
              {workoutList.length >= 1 && workoutList.length === checkedItems.length ? "Deselect All" : "Select All"}
            </button>
            <button
              className="hover:bg-slate-200 disabled:opacity-30"
              disabled={checkedItems.filter(item => item.circuit).length < 2}
              // onClick={handleCreateCircuit}
            >
              Circuit
            </button>
          </div>
          <button className="disabled:opacity-30" disabled={!checkedItems.length} onClick={handleRemoveExercises}>
            <Tooltip label="Delete" className="bottom-5 right-1 text-sm">
              <TrashIcon className="size-4 text-red-500" />
            </Tooltip>
          </button>
        </div>
        <motion.div
          initial="closedDescription"
          animate={openDescription ? "openDescription" : "closedDescription"}
          variants={{
            openDescription: { height: "calc(100% - 16rem)" },
            closedDescription: { height: "calc(100% - 14rem)" },
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="hidden overflow-y-auto md:flex flex-col shadow-inner bg-slate-50 rounded-md p-1 mt-1 mb-2"
        >
          {workoutList.map((exercise, index) => (
            <ExerciseItem
              key={exercise.listId}
              exercise={exercise}
              index={index}
              checked={checkedItems.map(item => item.listId).includes(exercise.listId)}
              checkExercise={handleCheckItem}
              moveExercise={moveExercise}
              removeExercise={removeExercise}
              listType="workoutList"
            />
          ))}
          <p className="text-sm text-slate-400 text-center content-center p-4 border-2 bg-white border-dashed rounded-md h-full select-none">
            Drag 'n' drop exercise(s) here
          </p>
        </motion.div>
        <div className="w-full /*lg:w-2/3 xl:w-1/2*/ flex flex-none gap-x-2 items-center">
          <Link to="/app/workouts" className="flex-1">
            <Button className="w-full text-accent outline outline-accent hover:bg-gray-50">
              Cancel
            </Button>
          </Link>
          <PrimaryButton
            className="w-full outline outline-secondary hover:outline-secondary-light"
            type="submit"
            isLoading={isSavingWorkout}
          >
            Save
          </PrimaryButton>
        </div>
      </div>
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
        {data.exercises.map((exercise, index) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            index={index}
            checkExercise={() => {}}
            moveExercise={() => {}}
            removeExercise={() => {}}
            listType="available"
          />
        ))}
      </div>
    </div>
  );
}

export default function Create() {
  const isHydrated = useIsHydrated();

  return (
    <>
      {isHydrated ? (
        <DndProvider backend={HTML5Backend}>
          <CreateContent />
        </DndProvider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
