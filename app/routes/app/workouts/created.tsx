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
// import { Exercise as ExerciseType } from '@prisma/client';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
}

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

const PlayerItem = ({
  player,
  index,
  movePlayer,
  removePlayer,
  listType,
}: {
  player: Player | RosterPlayer | ExerciseType;
  index: number;
  movePlayer: (dragIndex: number, hoverIndex: number) => void;
  removePlayer: (rosterId: number) => void;
  listType: 'roster' | 'available';
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { id: player.id, index, listType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PLAYER',
    hover: (item: { index: number; listType: string }, monitor) => {
      if (item.listType !== 'roster' || listType !== 'roster') return;
      if (item.index === index) return;
      movePlayer(item.index, index);
      item.index = index;
    },
  });

  return (
    <div
      ref={listType === 'roster' ? (node) => drag(drop(node)) : drag}
      className={`p-2 mb-2 bg-white rounded shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {player.name}
      {listType === 'roster' && (
        <button
          onClick={() =>
            removePlayer('rosterId' in player ? player.rosterId : -1)
          }
          className="ml-2 text-red-500"
        >
          X
        </button>
      )}
    </div>
  );
};

function RosterContent() {
  // Remix hooks
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = navigation.formData?.get("_action") === "createCustomWorkout";

  // local state hooks
  const [availablePlayers] = useState<Player[]>([
    { id: 1, name: 'LeBron James' },
    { id: 2, name: 'Stephen Curry' },
    { id: 3, name: 'Kevin Durant' },
    { id: 4, name: 'Giannis Antetokounmpo' },
    { id: 5, name: 'Kawhi Leonard' },
  ]);
  const [rosterPlayers, setRosterPlayers] = useState<RosterPlayer[]>([]);
  const [nextRosterId, setNextRosterId] = useState(1);
  const [workoutName, setWorkoutName] = useState("")
  const [workoutDescription, setWorkoutDescription] = useState("")
  // const [openExercisesPanel, setOpenExercisesPanel] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  // const [openIndex, setOpenIndex] = useState<null | number>(1);
  // const [selectedExercises, setSelectedExercises] = useState<Array<any>>([]);
  const [errors, setErrors] = useState<FieldErrors>({})


  // Drag and drop functions
  const movePlayer = (dragIndex: number, hoverIndex: number) => {
    const newRoster = [...rosterPlayers];
    const [removed] = newRoster.splice(dragIndex, 1);
    newRoster.splice(hoverIndex, 0, removed);
    setRosterPlayers(newRoster);
  };

  const removePlayer = (rosterId: number) => {
    setRosterPlayers((prev) => prev.filter((p) => p.rosterId !== rosterId));
  };

  const [, dropRoster] = useDrop({
    accept: 'PLAYER',
    drop: (item: { id: number; listType: string }, monitor) => {
      if (item.listType === 'available') {
        const player = availablePlayers.find((p) => p.id === item.id);
        if (player) {
          const rosterPlayer: RosterPlayer = {
            ...player,
            rosterId: nextRosterId,
          };
          setRosterPlayers((prev) => [...prev, rosterPlayer]);
          setNextRosterId((prevId) => prevId + 1);
        }
      }
    },
  });

  // form submit functions
  const handleSaveWorkout = () => {}

  return (
    <div className="flex h-screen">
      {/* Create Form */}
      <div ref={dropRoster} className="flex flex-col w-1/2 p-4">
      <h2 className="mb-2 text-lg font-semibold">Create Workout</h2>
        <fieldset className="space-y-4 rounded-xl bg-white/5">
          <div className="flex flex-col">
            <label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></label>
            <input
              type="text"
              value={workoutName}
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
        <motion.div
          animate={openDescription ? "openDescription" : "closedDescription"}
          variants={{
            openDescription: { height: "calc(100% - 16rem)" },
            closedDescription: { height: "calc(100% - 14rem)" },
          }}
          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="hidden overflow-y-auto md:flex flex-col shadow-inner bg-slate-50 rounded-md p-1 mt-1 mb-2"
        >
          {rosterPlayers.map((player, index) => (
            <PlayerItem
              key={player.rosterId}
              player={player}
              index={index}
              movePlayer={movePlayer}
              removePlayer={removePlayer}
              listType="roster"
            />
          ))}
          <p className="text-sm text-slate-400 text-center content-center p-4 border-2 bg-white border-dashed rounded-md h-full">
            Drag 'n' drop exercise(s) here
          </p>
        </motion.div>
        <div className="w-full /*lg:w-2/3 xl:w-1/2*/ flex flex-none gap-x-2 items-center">
          <Link to="/app/workouts" className="flex-1">
            <Button className="w-full text-accent outline outline-accent hover:bg-gray-50">
              Cancel
            </Button>
          </Link>
          <Form className="w-1/2" onSubmit={handleSaveWorkout}>
            <PrimaryButton
              className="w-full outline outline-secondary hover:outline-secondary-light"
              type="submit"
              isLoading={isSavingWorkout}
            >
              Save
            </PrimaryButton>
          </Form>
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
        {availablePlayers.map((player, index) => (
          <PlayerItem
            key={player.id}
            player={player}
            index={index}
            movePlayer={() => {}}
            removePlayer={() => {}}
            listType="available"
          />
        ))}
      </div>
    </div>
  );
}

export default function Roster() {
  const isHydrated = useIsHydrated();

  return (
    <>
      {isHydrated ? (
        <DndProvider backend={HTML5Backend}>
          <RosterContent />
        </DndProvider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
