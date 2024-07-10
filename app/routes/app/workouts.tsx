import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { PlusIcon, } from "@heroicons/react/24/solid";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, Outlet, ShouldRevalidateFunction, ShouldRevalidateFunctionArgs, useFetcher, useLoaderData, useMatches, useNavigation, useSearchParams } from "@remix-run/react";
import { PrimaryButton } from "~/components/form";
import { createExercise, deleteExercise, getAllExercises, updateExerciseName } from "~/models/exercise.server";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { ExerciseSchemaType, createWorkoutWithExercise, createWorkoutWithExercises, getAllWorkouts } from "~/models/workout.server";
import { useMatchesData } from "~/utils/api";
import { Exercise as ExerciseType } from "@prisma/client";
import clsx from "clsx";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllWorkouts(query);
  return json({ workouts })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createWorkout": {
      return createWorkoutWithExercise();
    }
    case "createCustomWorkout": {
      const exercisesString = formData.get("selectedExercises") as string;
      const name = formData.get("name") as string
      const description = formData.get("description") as string
      const exercisesObject = JSON.parse(exercisesString);
      const mappedExercises =
        Object.entries(exercisesObject).reduce((result, curr) => {
          let resultArr = result
          const [section, exercises]: [string, any] = curr
          if (section === "0") {
            return resultArr.concat(exercises.map((item: ExerciseType) => ({
              exerciseId: item.id,
              section: "warmup"
            })))
          }
          if (section === "1") {
            return resultArr.concat(exercises.map((item: ExerciseType) => ({
              exerciseId: item.id,
              section: "main"
            })))
          }
          if (section === "2") {
            return resultArr.concat(exercises.map((item: ExerciseType) => ({
              exerciseId: item.id,
              section: "cooldown"
            })))
          }
          return resultArr
        }, []).map((exercise: ExerciseSchemaType, idx) => ({
          ...exercise,
          orderInRoutine: idx + 1,
        }))
      return createWorkoutWithExercises(name, description, mappedExercises)
    }
    default: {
      return null;
    }
  }
}

// export function shouldRevalidate({ nextUrl, currentUrl }: ShouldRevalidateFunctionArgs) {
//   // Always revalidate if we're coming from the workouts create route
//   console.log('current url', currentUrl)
//   if (currentUrl.pathname === "/app/workouts/create") {
//     return true;
//   }
//   // Otherwise, use the default behavior
//   return false;
// };

export default function Workouts() {
  const data = useLoaderData<typeof loader>();
  const createWorkoutFetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const matches = useMatches();

  const isSearching = navigation.formData?.has("q");
  const isCreatingWorkout = createWorkoutFetcher.formData?.get("_action") === "createWorkout";
  const inCreateSubRoute = matches.map(m => m.id).includes("routes/app/workouts/create");
  const isNavigatingSubRoute =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/workouts/create" &&
    navigation.formData === undefined;

  if (inCreateSubRoute) {
    return (
      <div className="flex flex-col h-full">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-y-4 mb-4">
      <div className="flex flex-col gap-y-4 px-2">
        <Form
          className={`flex content-center border-2 rounded-md focus-within:border-accent md:w-1/2 ${
            isSearching ? "animate-pulse" : ""
          }`}
        >
          <button type="submit">
            <SearchIcon className="size-6 ml-2" />
          </button>
          <input
            defaultValue={searchParams.get("q") ?? ""}
            type="text"
            name="q"
            placeholder="Search workouts ..."
            autoComplete="off"
            className="w-full p-2 outline-none rounded-md"
          />
        </Form>
        <createWorkoutFetcher.Form method="post">
          <PrimaryButton
            className="w-full sm:w-1/2 xl:w-1/3 md:active:scale-95"
            name="_action"
            value="createWorkout"
            isLoading={isCreatingWorkout}
          >
            <PlusIcon className="size-6 pr-1" />
            <span>Add Workout</span>
          </PrimaryButton>
        </createWorkoutFetcher.Form>
        <Link
          to="create"
          className={clsx(
            "w-full sm:w-1/2 xl:w-1/3 md:active:scale-95 md:px-3",
            "bg-secondary hover:bg-secondary-light rounded-md text-center text-white py-2",
            isNavigatingSubRoute ? "animate-pulse" : ""
          )}
        >
          Create Workout
        </Link>
      </div>
      <div className="flex flex-col gap-y-4 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto px-2">
        {data.workouts.map((workout) => (
          <Workout key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  )
}

type WorkoutProps = {
  workout: {
    id: string
    name: string
    description: string | null
  }
}

function Workout({ workout }: WorkoutProps) {
  return (
    <div className="p-4 bg-slate-100 rounded-lg flex justify-between items-center hover:shadow-md hover:shadow-accent snap-start">
      <div className="flex gap-4">
        <div className="size-16 md:size-20 bg-white rounded-lg text-center content-center">Image</div>
        <div className="flex flex-col self-center">
          <p className="font-bold max-w-48 xs:max-w-64 truncate sm:overflow-visible">{workout.name}</p>
          <p className="text-sm max-w-48 xs:max-w-64 truncate sm:overflow-visible">{workout.description}</p>
        </div>
      </div>
    </div>
  )
}
