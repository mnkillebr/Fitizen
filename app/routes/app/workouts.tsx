import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, Outlet, ShouldRevalidateFunction, ShouldRevalidateFunctionArgs, isRouteErrorResponse, useFetcher, useLoaderData, useMatches, useNavigation, useRouteError, useSearchParams } from "@remix-run/react";
import { DeleteButton, ErrorMessage, PrimaryButton } from "~/components/form";
import { createExercise, deleteExercise, getAllExercises, updateExerciseName } from "~/models/exercise.server";
import { z } from "zod";
import { validateForm } from "~/utils/validation";
import { ExerciseSchemaType, createWorkoutWithExercise, createUserWorkoutWithExercises, getAllWorkouts, getAllUserWorkouts, deleteWorkout, getWorkout } from "~/models/workout.server";
import { useMatchesData } from "~/utils/api";
import { Exercise as ExerciseType, GroupType, Role as RoleType } from "@prisma/client";
import clsx from "clsx";
import { requireLoggedInUser } from "~/utils/auth.server";
import { ArrowRight } from "images/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Circuit, Superset } from "./workouts/create";

const createSubRoutes = ["routes/app/workouts/create","routes/app/workouts/circuit","routes/app/workouts/interval"]
const createPathnames = ["/app/workouts/create","/app/workouts/circuit","/app/workouts/interval"]

const deleteWorkoutSchema = z.object({
  workoutId: z.string(),
})

interface deleteWorkoutFetcherType extends ActionFunctionArgs{
  errors?: {
    workoutId?: string
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const role = user.role;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const workouts = await getAllUserWorkouts(user.id, query);

  return json({ workouts, role })
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "createWorkout": {
      return createWorkoutWithExercise();
    }
    case "createCustomWorkout": {
      const exercisesString = formData.get("selectedExercises") as string;
      const name = formData.get("name") as string
      const description = formData.get("description") as string
      const exercisesArray = JSON.parse(exercisesString);
      console.log('exercises array', exercisesArray)
    //   let restValue
    // if (changeValue === "None") {
    //   restValue = 0
    // } else {
    //   const restInterval = changeValue.split(" ")[0]
    //   const unit = changeValue.split(" ")[1]
    //   if (unit === "min") {
    //     restValue = parseInt(restInterval) * 60
    //   } else {
    //     restValue = parseInt(restInterval)
    //   }
    // }
      const mappedExercises = exercisesArray.reduce((result: Array<any>, curr: any) => {
        let resultArr = result
        let currentItem = curr
        if (currentItem.exercises) {
          const groupedExercises = currentItem.exercises.map((ex_item: any) => ({
            exerciseId: ex_item.id,
            groupId: currentItem.id,
            groupType: currentItem.itemType === GroupType.circuit ? GroupType.circuit : GroupType.regular,
            target: ex_item.target,
            reps: ex_item.reps,
            sets: ex_item.sets,
            rounds: ex_item.rounds,
            rest: ex_item.rest,
            notes: ex_item.notes,
            time: ex_item.time,
          }))
          return resultArr.concat(groupedExercises)
        } else {
          return resultArr.concat({
            exerciseId: currentItem.id,
            groupId: "",
            groupType: GroupType.regular,
            target: currentItem.target,
            reps: currentItem.reps,
            sets: currentItem.sets,
            rest: currentItem.rest,
            notes: currentItem.notes,
            time: currentItem.time,
          })
        }
      }, []).map((exercise: ExerciseSchemaType, idx: number) => ({
        ...exercise,
        orderInRoutine: idx + 1,
      }))
      console.log(mappedExercises)
      // const mappedExercises =
      //   Object.entries(exercisesObject).reduce((result, curr) => {
      //     let resultArr = result
      //     const [section, exercises]: [string, any] = curr
      //     if (section === "0") {
      //       return resultArr.concat(exercises.map((item: ExerciseType) => ({
      //         exerciseId: item.id,
      //         section: "warmup"
      //       })))
      //     }
      //     if (section === "1") {
      //       return resultArr.concat(exercises.map((item: ExerciseType) => ({
      //         exerciseId: item.id,
      //         section: "main"
      //       })))
      //     }
      //     if (section === "2") {
      //       return resultArr.concat(exercises.map((item: ExerciseType) => ({
      //         exerciseId: item.id,
      //         section: "cooldown"
      //       })))
      //     }
      //     return resultArr
      //   }, []).map((exercise: ExerciseSchemaType, idx) => ({
      //     ...exercise,
      //     orderInRoutine: idx + 1,
      //   }))
      return createUserWorkoutWithExercises(user.id, name, description, mappedExercises)
    }
    case "deleteWorkout": {
      return validateForm(
        formData,
        deleteWorkoutSchema,
        async ({ workoutId }) => {
          const workout = await getWorkout(workoutId);

          if (workout !== null && workout.userId !== user.id) {
            throw json(
              { message: "This workout routine is not yours, so you cannot delete it."},
              { status: 401 }
            )
          }
          return deleteWorkout(workoutId);
        },
        (errors) => json({ errors }, { status: 400 })
      )
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
  const [openPanel, setOpenPanel] = useState<boolean>(false)

  const isSearching = navigation.formData?.has("q");
  const isCreatingWorkout = createWorkoutFetcher.formData?.get("_action") === "createWorkout";
  const inCreateSubRoute = matches.map(m => m.id).some(id => createSubRoutes.includes(id));
  const inWorkoutDetailRoute = matches.map(m => m.id).includes("routes/app/workouts/$workoutId");
  const isNavigatingSubRoute =
    navigation.state === "loading" &&
    createPathnames.includes(navigation.location.pathname) &&
    navigation.formData === undefined;

  if (inCreateSubRoute || inWorkoutDetailRoute) {
    return (
      <div className="flex flex-col h-full">
        <Outlet />
      </div>
    )
  }

  // if (inWorkoutDetailRoute) {
  //   return (
  //     <div className="flex flex-col h-full">
  //       <Outlet />
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col h-full gap-y-4">
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
        {data.role === "admin" ? (
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
        ) : null}
        <Link
          to="create"
          className={clsx(
            "w-full sm:w-1/2 xl:w-1/3 md:active:scale-95 md:px-3",
            "bg-secondary hover:bg-secondary-light rounded-md text-center text-white py-2",
            isNavigatingSubRoute ? "animate-pulse" : ""
          )}
          // onClick={() => setOpenPanel(!openPanel)}
        >
          Create Workout
        </Link>
      </div>
      <div className="flex flex-col gap-y-4 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto px-2 pb-1">
        {data.workouts.map((workout) => (
          <Workout key={workout.id} workout={workout} role={data.role} />
        ))}
      </div>
      <AnimatePresence>
        {openPanel && (
          <motion.div
            className="absolute bottom-0 left-0 md:left-80 md:max-w-[calc(100vw-20rem)] flex flex-col gap-y-2 h-1/3 bg-slate-400 w-screen rounded-t-lg text-white px-8 py-6"
            initial={{ translateY: "100%" }}
            animate={{ translateY: "0%" }}
            exit={{ translateY: "100%" }}
            transition={{ ease: [0, 0.71, 0.2, 1.01], }}
          >
            <div className="flex justify-between *:text-white">
              <p className="font-medium">Exercises</p>
              <button onClick={(event) => setOpenPanel(false)}>
                <XMarkIcon className="size-6 hover:text-accent"/>
              </button>
            </div>
            <Link
              to="classic"
              className={clsx(
                "border border-white shadow-md text-white py-2 px-3 rounded-md",
                "hover:bg-white hover:text-black transition duration-200",
                isNavigatingSubRoute ? "animate-pulse hover:animate-pulse" : ""
              )}
              onClick={(event) => setOpenPanel(false)}
            >
              <div>Classic</div>
            </Link>
            <Link
              to="circuit"
              className={clsx(
                "border border-white shadow-md text-white py-2 px-3 rounded-md",
                "hover:bg-white hover:text-black transition duration-200",
                isNavigatingSubRoute ? "animate-pulse hover:animate-pulse" : ""
              )}
              onClick={(event) => setOpenPanel(false)}
            >
              <div>Circuit</div>
            </Link>
            <Link
              to="interval"
              className={clsx(
                "border border-white shadow-md text-white py-2 px-3 rounded-md",
                "hover:bg-white hover:text-black transition duration-200",
                isNavigatingSubRoute ? "animate-pulse hover:animate-pulse" : ""
              )}
              onClick={(event) => setOpenPanel(false)}
            >
              <div>Interval</div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type WorkoutProps = {
  workout: {
    id: string;
    name: string;
    description: string | null;
    userId: string | null;
  };
  role?: RoleType;
}

function Workout({ workout, role }: WorkoutProps) {
  const deleteWorkoutFetcher = useFetcher<deleteWorkoutFetcherType>();
  return (
    <Link to={workout.id} className="bg-slate-100 rounded-lg flex justify-between items-center hover:shadow-accent hover:cursor-pointer snap-start shadow-md">
      <div className="flex gap-4">
        <div className="size-16 md:size-20 bg-white rounded-lg text-center content-center">Image</div>
        <div className="flex flex-col self-center">
          <p className="font-bold max-w-40  xs:max-w-64 truncate sm:overflow-visible md:overflow-hidden lg:overflow-visible">{workout.name}</p>
          <p className="text-sm max-w-40 xs:max-w-64 truncate sm:overflow-visible md:overflow-hidden lg:overflow-visible">{workout.description}</p>
        </div>
      </div>
      <div className="px-2 border-l-2 h-full flex flex-col justify-center hover:bg-accent rounded-r-lg">
        <ArrowRight className=""/>
      </div>
      {/* {role === "admin" || workout.userId ? (
        <deleteWorkoutFetcher.Form
          method="post"
          onSubmit={(event) => {
            if(!confirm("Are you sure you want to delete this workout?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="workoutId" value={workout.id} />
          <DeleteButton
            name="_action"
            value="deleteWorkout"
            >
            <TrashIcon className="size-6" />
          </DeleteButton>
          <ErrorMessage>{deleteWorkoutFetcher.data?.errors?.workoutId}</ErrorMessage>
        </deleteWorkoutFetcher.Form>
      ) : null} */}
    </Link>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-4 bg-red-500 text-white rounded-md">
        <h1 className="text-2xl pb-2">{error.status} - {error.statusText}</h1>
        <p className="my-2 font-bold">{error.data.message}</p>
      </div>
    )
  }
  return (
    <div className="p-4 bg-red-500 text-white rounded-md">
      <h1>An unexpected error occurred</h1>
    </div>
  );
}
