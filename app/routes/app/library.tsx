import { useState } from "react";

import { HeartIcon as HeartOutline, MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, PlusIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { DeleteButton, ErrorMessage, PrimaryButton } from "~/components/form";
import { createExercise, deleteExercise, getAllExercises, updateExerciseName } from "~/models/exercise.server";
import { z } from "zod";
import { validateForm } from "~/utils/validation";

const updateExerciseNameSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string().min(1, "Exercise name cannot be blank"),
})
const deleteExerciseSchema = z.object({
  exerciseId: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
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

export default function Library() {
  const data = useLoaderData<typeof loader>();
  const createExerciseFetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  const isSearching = navigation.formData?.has("q");
  const isCreatingExercise = createExerciseFetcher.formData?.get("_action") === "createExercise";
  return (
    <div className="flex flex-col h-full gap-x-6 gap-y-4 snap-y snap-mandatory overflow-y-auto px-2 pb-4 mb-4">
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
          placeholder="Search exercises ..."
          autoComplete="off"
          className="w-full p-2 outline-none rounded-md"
        />
      </Form>
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
      {data.exercises.map((ex_item) => (
        <Exercise key={ex_item.id} exercise={ex_item} />
      ))}
    </div>
  )
}

type ExerciseProps = {
  exercise: {
    id: string
    name: string
    body: string[]
    contraction: string | null
  }
}

function Exercise({ exercise }: ExerciseProps) {
  const deleteExerciseFetcher = useFetcher<deleteExerciseFetcherType>();
  const updateExerciseNameFetcher = useFetcher<updateNameFetcherType>();
  const isDeletingExercise =
    deleteExerciseFetcher.formData?.get("_action") === "deleteExercise" &&
    deleteExerciseFetcher.formData?.get("exerciseId") === exercise.id
  return isDeletingExercise ? null : (
    <div className="p-4 bg-slate-100 rounded-lg flex justify-between items-center hover:shadow-md hover:shadow-accent snap-start">
      <div className="flex gap-4">
        <div className="size-20 bg-white rounded-lg text-center content-center">Image</div>
        <div className="flex flex-col self-center">
          <updateExerciseNameFetcher.Form method="post" className="flex">
            <div className="flex flex-col">
              <input
                type="text"
                className={`font-bold bg-slate-100 focus:outline-none focus:border-b-2 ${
                  updateExerciseNameFetcher.data?.errors?.exerciseName ? "border-b-2 border-b-red-500" : ""
                }`}
                name="exerciseName"
                placeholder="Exercise Name"
                defaultValue={exercise.name}
                autoComplete="off"
              />
              <ErrorMessage>{updateExerciseNameFetcher.data?.errors?.exerciseName}</ErrorMessage>
            </div>
            <button name="_action" value="updateExerciseName">
              <ArrowDownTrayIcon className="size-6 hover:text-accent"/>
            </button>
            <input type="hidden" name="exerciseId" value={exercise.id} />
          </updateExerciseNameFetcher.Form>
          <div className="flex divide-x divide-gray-400 text-sm">
            {exercise.body.map((body, body_idx) => (
              <p key={body_idx} className={`${body_idx > 0 ? "px-1" : "pr-1"} text-xs capitalize`}>{`${body} body`}</p>
            ))}
            <p className="px-1 text-xs capitalize">{exercise.contraction}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <HeartOutline className="size-6 hover:text-rose-500 cursor-pointer"/>
        <deleteExerciseFetcher.Form method="post">
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
      {/* <HeartSolid className="size-6 fill-rose-500 hover:fill-rose-600 cursor-pointer"/> */}
    </div>
  )
}