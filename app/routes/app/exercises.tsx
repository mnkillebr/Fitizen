import { HeartIcon as HeartOutline, MagnifyingGlassIcon as SearchIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, PlusIcon, TrashIcon, ArrowDownTrayIcon, Bars3Icon } from "@heroicons/react/24/solid";

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { DeleteButton, ErrorMessage, PrimaryButton } from "~/components/form";
import { createExercise, deleteExercise, getAllExercises, updateExerciseName } from "~/models/exercise.server";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { useIsHydrated } from "~/utils/misc";
import clsx from "clsx";
import { requireLoggedInUser } from "~/utils/auth.server";
import { Role as RoleType } from "@prisma/client";
// import { useDrag, useDrop } from "react-dnd";
import { useOpenDialog } from "~/components/Dialog";

const updateExerciseNameSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string().min(1, "Exercise name cannot be blank"),
})
const deleteExerciseSchema = z.object({
  exerciseId: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const role = user.role;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises, role })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createExercise": {
      return createExercise();
    }
    case "deleteExercise": {
      return validateForm(
        formData,
        deleteExerciseSchema,
        (data) => deleteExercise(data.exerciseId),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "updateExerciseName": {
      return validateForm(
        formData,
        updateExerciseNameSchema,
        (data) => updateExerciseName(data.exerciseId, data.exerciseName),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

interface updateNameFetcherType extends ActionFunctionArgs{
  errors?: {
    exerciseId?: string
    exerciseName?: string
  }
}

interface deleteExerciseFetcherType extends ActionFunctionArgs{
  errors?: {
    exerciseId?: string
  }
}

export default function ExerciseLibrary() {
  const data = useLoaderData<typeof loader>();
  const createExerciseFetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const openDialog = useOpenDialog();

  const isSearching = navigation.formData?.has("q");
  const isCreatingExercise = createExerciseFetcher.formData?.get("_action") === "createExercise";
  return (
    <div className="py-6 px-5 md:py-8 md:px-7 flex flex-col h-full gap-y-4">
      <div className="flex flex-col gap-y-4 px-1">
        {/* <Form
          className={`flex content-center border-2 rounded-md focus-within:border-primary md:w-2/3 lg:w-1/2 xl:w-1/3 ${
            isSearching ? "animate-pulse" : ""
          }`}
        >
          <button type="submit">
            <SearchIcon className="size-6 ml-2" />
          </button>
          <input
            defaultValue={searchParams.get("q") ?? ""}
            type="search"
            name="q"
            placeholder="Search exercises ..."
            autoComplete="off"
            className="w-full p-2 outline-none rounded-md"
          />
        </Form> */}
        <h1 className="text-lg font-semibold md:text-2xl">Exercises</h1>
        {data.role === "admin" ? (
          <createExerciseFetcher.Form method="post">
            <PrimaryButton
              className="w-full sm:w-1/2 md:w-fit md:active:scale-95"
              name="_action"
              value="createExercise"
              isLoading={isCreatingExercise}
            >
              <PlusIcon className="size-6 pr-1" />
              <span>Add Exercise</span>
            </PrimaryButton>
          </createExerciseFetcher.Form>
        ) : null}
      </div>
      <div className="flex flex-col gap-y-4 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto px-1 pb-1">
        {data.exercises.map((ex_item) => (
          <Exercise key={ex_item.id} exercise={ex_item} role={data.role} onViewExercise={() => {
            openDialog(
              <div className="flex gap-x-4">
                <div className="flex-none size-96 bg-slate-100 text-center content-center rounded">Image</div>
                <div className="flex-1">{ex_item.cues.map((cue, cue_idx) => <div key={cue_idx}>{cue}</div>)}</div>
              </div>, ex_item.name
            )
          }} />
        ))}
      </div>
    </div>
  )
}

interface ExerciseItemProps {
  id: string;
  name: string;
  body: string[];
  contraction: string | null;
}

type ExerciseProps = {
  exercise: ExerciseItemProps;
  selectable?: boolean;
  selectFn?: (...args: any[]) => void;
  selected?: boolean;
  role?: RoleType;
  onViewExercise?: (exerciseItem: ExerciseItemProps) => void;
  selectCount?: number;
}

export function Exercise({ exercise, selectable, selectFn, selected, role, selectCount, onViewExercise = () => {}}: ExerciseProps) {
  const isHydrated = useIsHydrated();
  const deleteExerciseFetcher = useFetcher<deleteExerciseFetcherType>();
  const updateExerciseNameFetcher = useFetcher<updateNameFetcherType>();
  const isDeletingExercise =
    deleteExerciseFetcher.formData?.get("_action") === "deleteExercise" &&
    deleteExerciseFetcher.formData?.get("exerciseId") === exercise.id

  // const [, drop] = useDrop({
  //   accept: 'exerciseItem',
  //   drop: (item: ExerciseItemProps) => onDragExercise(item),
  // });

  return isDeletingExercise ? null : (
    <div
      className={clsx(
        "bg-slate-100 rounded-lg flex justify-between items-center hover:shadow-md snap-start shadow-md",
        selectable ? "" : "hover:shadow-primary"
      )}
      // draggable
      // onDragStart={(e) => {
      //   e.dataTransfer.setData('exerciseItem', JSON.stringify(exercise));
      // }}
    >
      <div className="flex gap-2 xs:gap-4">
        <div
          className="size-16 md:size-20 bg-white rounded-lg text-center content-center cursor-pointer"
          onClick={() => onViewExercise(exercise)}
        >
          Image
        </div>
        <div className="flex flex-col self-center">
          {role === "admin" ? (
            <updateExerciseNameFetcher.Form method="post" className="hidden sm:flex">
              <div className="flex flex-col peer">
                <input
                  type="text"
                  className={`font-bold bg-slate-100 focus:outline-none max-w-36 xs:min-w-64 truncate focus:border-b-2 ${
                    updateExerciseNameFetcher.data?.errors?.exerciseName ? "border-b-2 border-b-red-500" : ""
                  }`}
                  required
                  name="exerciseName"
                  placeholder="Exercise Name"
                  defaultValue={exercise.name}
                  autoComplete="off"
                  onChange={(event) => {
                    event.target.value !== "" &&
                    updateExerciseNameFetcher.submit(
                      {
                        _action: "updateExerciseName",
                        exerciseId: exercise.id,
                        exerciseName: event.target.value,
                      },
                      { method: "post" }
                    );
                  }}
                />
                <ErrorMessage>{updateExerciseNameFetcher.data?.errors?.exerciseName}</ErrorMessage>
              </div>
              {isHydrated ? null : (
                <button
                  name="_action"
                  value="updateExerciseName"
                  className={clsx(
                    "opacity-0 hover:opacity-100 focus:opacity-100",
                    "peer-focus-within:opacity-100"
                  )}
                >
                  <ArrowDownTrayIcon className="size-6"/>
                </button>
              )}
              <input type="hidden" name="exerciseId" value={exercise.id} />
            </updateExerciseNameFetcher.Form>
          ) : (
            <p className="font-bold max-w-40 xs:max-w-64 sm:max-w-full md:max-w-72 truncate">{exercise.name}</p>
          )}
          <div className="flex divide-x divide-gray-400 text-sm">
            {exercise.body.slice(0,2).map((body, body_idx) => (
              <p key={body_idx} className={`${body_idx > 0 ? "px-1" : "pr-1"} text-xs capitalize`}>{`${body} body`}</p>
            ))}
            <p className="px-1 text-xs capitalize">{exercise.contraction}</p>
          </div>
        </div>
      </div>
      {/* <div className="hidden lg:flex self-center pr-2">
        <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
      </div> */}
      {selectable ? (
        <div
          className="border-l-2 h-full group relative content-center hover:bg-secondary-original hover:text-white hover:rounded-r-lg cursor-pointer"
          onClick={() => selectFn ? selectFn(exercise) : null}
        >
          <button
            className={clsx(
              "lg:hidden px-2 flex flex-col",
              selected ? "text-green-600" : ""
            )}
          >
            {selected ? <CheckCircleIcon className="size-6 group-hover:text-white" /> : <PlusIcon className="size-6" />}
          </button>
          {selectCount && selectCount > 1 ? <p className="absolute bottom-2 left-6 z-10 text-xs">{selectCount}</p> : null}
        </div>
      ) : null}
      {role === "admin" ? (
        <div className="hidden sm:flex gap-3 items-center p-4">
          <HeartOutline className="size-6 hover:text-rose-500 cursor-pointer"/>
          <deleteExerciseFetcher.Form
            method="post"
            onSubmit={(event) => {
              if(!confirm("Are you sure you want to delete this exercise?")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <DeleteButton
              name="_action"
              value="deleteExercise"
              >
              <TrashIcon className="size-6" />
            </DeleteButton>
            <ErrorMessage>{deleteExerciseFetcher.data?.errors?.exerciseId}</ErrorMessage>
          </deleteExerciseFetcher.Form>
        </div>
      ) : null}
      {/* <HeartSolid className="size-6 fill-rose-500 hover:fill-rose-600 cursor-pointer"/> */}
    </div>
  )
}