import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { PlusIcon, } from "@heroicons/react/24/solid";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, Outlet, ShouldRevalidateFunction, ShouldRevalidateFunctionArgs, useFetcher, useLoaderData, useMatches, useNavigation, useSearchParams } from "@remix-run/react";
import { PrimaryButton } from "~/components/form";
import { createExercise, deleteExercise, getAllExercises, updateExerciseName } from "~/models/exercise.server";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { createWorkoutWithExercise, getAllWorkouts } from "~/models/workout.server";
import { useMatchesData } from "~/utils/api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllWorkouts(query);
  // const exercises = await getAllExercises(null);
  return json({ workouts })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createWorkout": {
      return createWorkoutWithExercise();
    }
    default: {
      return null;
    }
  }
}

export function shouldRevalidate({ nextUrl, currentUrl }: ShouldRevalidateFunctionArgs) {
  // Always revalidate if we're coming from the workouts create route
  // console.log('current url', currentUrl)
  if (currentUrl.pathname === "/app/workouts/create") {
    return true;
  }
  // Otherwise, use the default behavior
  return false;
};

export default function Workouts() {
  const data = useLoaderData<typeof loader>();
  const createWorkoutFetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const matches = useMatches();

  const isSearching = navigation.formData?.has("q");
  const isCreatingWorkout = createWorkoutFetcher.formData?.get("_action") === "createWorkout";
  const inWorkoutsSubRoute = matches.map(m => m.id).includes("routes/app/workouts/create");
  // console.log('loader data', data, 'navigation state', navigation.state)

  if (inWorkoutsSubRoute) {
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
            className="w-full sm:w-1/2 md:w-fit md:active:scale-95"
            name="_action"
            value="createWorkout"
            isLoading={isCreatingWorkout}
          >
            <PlusIcon className="size-6 pr-1" />
            <span>Add Workout</span>
          </PrimaryButton>
        </createWorkoutFetcher.Form>
        <Link to="create" className="w-full sm:w-1/2 md:w-fit md:active:scale-95 md:px-3 bg-secondary hover:bg-secondary-light rounded-md text-center text-white py-2">Create Workout</Link>
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
          <p className="font-bold max-w-48 xs:max-w-64 sm:hidden truncate">{workout.name}</p>
          <p className="text-sm max-w-48 xs:max-w-64 sm:hidden truncate">{workout.description}</p>
        </div>
      </div>
    </div>
  )
}
