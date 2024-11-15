import { HeartIcon as HeartOutline, MagnifyingGlassIcon as SearchIcon, } from "@heroicons/react/24/outline";
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
import { CheckCircleIcon, PlusCircleIcon } from "images/icons";
import { darkModeCookie } from "~/cookies";
import MuxPlayer from '@mux/mux-player-react';
import { generateMuxThumbnailToken, generateMuxVideoToken } from "~/mux-tokens.server";
import { hash } from "~/cryptography.server";

const updateExerciseNameSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string().min(1, "Exercise name cannot be blank"),
})
const deleteExerciseSchema = z.object({
  exerciseId: z.string(),
})
const themeSchema = z.object({
  darkMode: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const role = user.role;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  const tokenMappedExercises = exercises.map(ex_item => {
    const smartCrop = () => {
      switch (ex_item.name) {
       case "Lateral Lunge":
        return "smartcrop"
      case "Band Assisted Leg Lowering":
        return "smartcrop"
      case "Ankle Mobility":
        return "smartcrop"
       default:
        return undefined
      }
    }
    const videoToken = generateMuxVideoToken(ex_item.muxPlaybackId)
    const thumbnailToken = generateMuxThumbnailToken(ex_item.muxPlaybackId, smartCrop())
    return {
      ...ex_item,
      token: videoToken,
      thumbnail: thumbnailToken ? `https://image.mux.com/${ex_item.muxPlaybackId}/thumbnail.png?token=${thumbnailToken}` : undefined,
    }
  })
  const exercisesEtag = hash(JSON.stringify(tokenMappedExercises))
  return json(
    {
      exercises: tokenMappedExercises,
      role
    },
    {
      headers: {
        exercisesEtag,
        "Cache-control": "max-age=600, stale-while-revalidate=3600"
      }
    })
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
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => json("ok", {
          headers: {
            "Set-Cookie": await darkModeCookie.serialize(darkMode),
          }
        }),
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
  const { exercises, role } = useLoaderData<typeof loader>();
  const createExerciseFetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const openDialog = useOpenDialog();

  const isSearching = navigation.formData?.has("q");
  const isCreatingExercise = createExerciseFetcher.formData?.get("_action") === "createExercise";

  return (
    <div className="px-1 pt-0 md:px-2 md:pt-0 flex flex-col gap-y-4 bg-background h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
      {/* <div className="flex flex-col gap-y-4">
        <h1 className="text-lg font-semibold md:text-2xl text-foreground px-1">Exercises</h1>
        {role === "admin" ? (
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
      </div> */}
      {/* <div className="flex flex-col gap-y-4 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto px-1 pb-1"> */}
      <div className="flex flex-col gap-y-3 pb-6 overflow-y-auto md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 px-1">
        {exercises.map((ex_item) => (
          <Exercise key={ex_item.id} exercise={ex_item} role={role} onViewExercise={() => {
            openDialog(
              <div className="flex flex-col md:flex-row gap-y-3 gap-x-4">
                <div className="w-full">
                  <MuxPlayer
                    streamType="on-demand"
                    playbackId={ex_item.muxPlaybackId ? ex_item.muxPlaybackId : undefined}
                    tokens={{ playback: ex_item.token, thumbnail: ex_item.token }}
                    metadataVideoTitle="Placeholder (optional)"
                    metadataViewerUserId="Placeholder (optional)"
                    primaryColor="#FFFFFF"
                    secondaryColor="#000000"
                    style={{
                      aspectRatio: 9/16,
                      width: "100%",
                      height: "100%",
                      maxHeight: 640,
                      maxWidth: 360,
                    }}
                  />
                </div>
                <div className="w-full">
                  <div className="font-bold mb-2">Cues</div>
                  <div className="flex-1">{ex_item.cues.map((cue, cue_idx) => (
                    <div key={cue_idx} className="flex w-full">
                      <div className="flex-none w-5">{cue_idx+1}.</div>
                      <div className="flex-1">{cue}</div>
                    </div>
                  ))}</div>
                </div>
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
  thumbnail?: string;
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
        "dark:bg-background-muted text-foreground dark:border dark:border-border-muted rounded-lg flex flex-col snap-start shadow-md dark:shadow-border-muted",
        selectable ? "bg-background" : "bg-muted hover:shadow-primary"
      )}
      // draggable
      // onDragStart={(e) => {
      //   e.dataTransfer.setData('exerciseItem', JSON.stringify(exercise));
      // }}
    >
      <div className="flex flex-col overflow-hidden justify-between h-full">
        <img
          src={exercise.thumbnail ?? "https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/cld-sample-3.jpg"}
          className={clsx("w-full rounded-t-lg flex-1", selectable ? "" : "cursor-pointer")}
          onClick={() => onViewExercise(exercise)}
        />
        <div className="flex p-4 justify-between items-center">
          <div className="flex flex-col w-full">
            {role === "admin" ? (
              <updateExerciseNameFetcher.Form method="post" className="hidden sm:flex justify-between">
                <div className="flex flex-col peer">
                  <input
                    type="text"
                    className={`font-bold bg-background-muted focus:outline-none truncate focus:border-b-2 ${
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
              <p className="font-bold w-full md:max-w-[calc(100%-2rem)] truncate">{exercise.name}</p>
            )}
            <div className="flex divide-x divide-muted-foreground text-muted-foreground text-sm">
              {exercise.body.slice(0,2).map((body, body_idx) => (
                <p key={body_idx} className={`${body_idx > 0 ? "px-1" : "pr-1"} text-xs capitalize`}>{`${body} body`}</p>
              ))}
              <p className="px-1 text-xs capitalize">{exercise.contraction}</p>
            </div>
          </div>
          {selectable ? (
            <div
              className="relative flex items-center text-foreground"
              onClick={() => selectFn ? selectFn(exercise) : null}
            >
              <button>
                {selected ? <CheckCircleIcon className="xs:h-8 xs:w-8 text-primary" /> : <PlusCircleIcon className="xs:h-8 xs:w-8" />}
              </button>
              {selectCount && selectCount > 1 ? <p className="absolute -bottom-1 left-7 z-10 text-xs text-primary">{selectCount}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
      {/* <div className="hidden lg:flex self-center pr-2">
        <Bars3Icon className="size-6 cursor-grab active:cursor-grabbing" />
      </div> */}
      {/* {selectable ? (
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
      ) : null} */}
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