import MuxPlayer from "@mux/mux-player-react";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { ChevronLeft } from "images/icons";
import { Video } from "lucide-react";
import { useState } from "react";
import CountdownTimer from "~/components/CountdownTimer";
import CurrentDate from "~/components/CurrentDate";
import { useOpenDialog } from "~/components/Dialog";
import Stopwatch from "~/components/Stopwatch";
import { PrimaryButton } from "~/components/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getProgramById, getUserProgramLogs } from "~/models/program.server";
import { generateMuxVideoToken } from "~/mux-tokens.server";
import { requireLoggedInUser } from "~/utils/auth.server";

const unitOptions = [
  { value: "bw", label: "Bodyweight" },
  { value: "lb(s)", label: "Pounds" },
  { value: "kg(s)", label: "Kilograms" },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const programId = url.searchParams.get("id") as string;
  const program = await getProgramById(programId)
  if (program !== null && program.isFree === false) {
    throw redirect("/app", 401)
  }
  if (!program) {
    throw json(
      { message: "The program you are attempting to log does not exist"},
      { status: 404, statusText: "Program Not Found" }
    )
  }
  const userLogs = await getUserProgramLogs(user.id, program.id)
  const programLength = program.weeks.length * program.weeks[0].days.length
  const programDay = ((userLogs.length) % (programLength) % (program.weeks[0].days.length)) + 1
  const programWeek = Math.ceil(programDay / program.weeks[0].days.length)
  const currentProgramWorkout = program.weeks[programWeek-1].days[programDay-1]
  const tokenMappedProgramWorkout = {
    ...currentProgramWorkout,
    blocks: currentProgramWorkout.blocks.map(block => ({
      ...block,
      exercises: block.exercises.map(block_ex_item => ({
        ...block_ex_item,
        exercise: {
          ...block_ex_item.exercise,
          videoToken: generateMuxVideoToken(block_ex_item.exercise.muxPlaybackId),
        }
      }))
    }))
  }
  return json({ program, programLength, programDay, programWeek, currentProgramWorkout: tokenMappedProgramWorkout })
}

export async function action({ request }: ActionFunctionArgs) {
  return null
}

export default function ProgramLog() {
  const {
    currentProgramWorkout,
    program,
    programLength,
    programDay,
    programWeek,
  } = useLoaderData<typeof loader>();
  const [showStopwatch, setShowStopwatch] = useState(false);
  const openDialog = useOpenDialog();

  return (
    <Form method="post" className="p-6 md:p-8 flex flex-col gap-y-3 overflow-hidden select-none lg:w-3/4 xl:w-2/3 text-foreground">
      <div className="flex">
        <Link to={`/app/programs/${program?.id}`}>
          <ChevronLeft className="hover:text-primary" />
        </Link>
      </div>
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="font-semibold text-lg">Week {programWeek} - Day {programDay}</div>
        <div className="*:text-sm"><CurrentDate /></div>
        <input
          type="hidden"
          name="date"
          value={new Date().toISOString()}
        />
        <input
          type="hidden"
          name="workoutId"
          value={program.id}
        />
      </div>
      <div className="flex flex-col">
        <div className="font-medium text-xs text-muted-foreground">Program Name</div>
        <div className="font-semibold text-md">{program?.name}</div>
      </div>
      {showStopwatch ? (
        <Stopwatch autoStart label="Elapsed Time" />
      ) : (
        <CountdownTimer
          autoStart
          defaultTime={15}
          label="Get Ready!"
          showPresetTimes={false}
          showCustomInput={false}
          showControls={false}
          showSound
          onCountdownEnd={() => setShowStopwatch(true)}
        />
      )}
      <div className="font-semibold text-lg">Exercises</div>
      <div
        className={clsx(
          "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted",
          "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
        )}
      >
        <div className="overflow-y-auto flex flex-col gap-y-3">
          {currentProgramWorkout.blocks.map((block, block_idx) => {
            return (
              <div key={`${block.id}-${block_idx}`} className="flex flex-col">
                <div className="flex gap-x-1 flex-nowrap">
                  <div className="flex-none font-semibold w-28">{`Block #${block.blockNumber}:`}</div>
                </div>
                <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-2">
                  {[...Array(block.exercises.sort((a, b) => b.sets - a.sets)[0].sets)].map((set: unknown, set_idx: number) =>
                    <div key={`${block_idx}-${set_idx}`} className="border rounded dark:border-none dark:shadow-sm dark:shadow-border-muted">
                      {block.exercises.map((ex_item: any, ex_idx: number) => {
                        const currentSet = set_idx + 1
                        return (
                          <div key={`${set_idx}-${ex_idx}`} className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                            {ex_idx === 0 ? <div className="tex-base font-semibold">{`Set ${currentSet}`}</div> : null}
                            <div className="flex flex-wrap gap-x-3">
                              <div className="flex flex-col w-full sm:w-56">
                                <label className="text-xs font-semibold text-muted-foreground">Name</label>
                                <div className="flex gap-2">
                                  <div>{ex_item.exercise.name}</div>
                                  {currentSet === 1 ? (
                                    <Video
                                      className="hover:cursor-pointer"
                                      onClick={() => openDialog(
                                        <div className="flex flex-col md:flex-row gap-y-3 gap-x-4">
                                          <div className="w-full">
                                            <MuxPlayer
                                              streamType="on-demand"
                                              playbackId={ex_item.exercise.muxPlaybackId ? ex_item.exercise.muxPlaybackId : undefined}
                                              tokens={{ playback: ex_item.exercise.videoToken, thumbnail: ex_item.exercise.videoToken }}
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
                                            <div className="flex-1">{ex_item.exercise.cues.map((cue, cue_idx) => (
                                              <div key={cue_idx} className="flex w-full">
                                                <div className="flex-none w-5">{cue_idx+1}.</div>
                                                <div className="flex-1">{cue}</div>
                                              </div>
                                            ))}</div>
                                          </div>
                                        </div>, ex_item.exercise.name
                                      )}
                                    />
                                  ) : null}
                                </div>
                              </div>
                              {ex_item.reps ? (
                                <>
                                  <div className="flex flex-col">
                                    <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                                    <div className="text-start text-sm">{ex_item?.reps}</div>
                                  </div>
                                  <div className="flex flex-col">
                                    <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                                    <Input
                                      type="number"
                                      className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                      // name={`exercises[${exerciseIndex}].sets[${idx}].actualReps`}
                                      placeholder={ex_item?.reps}
                                      min={1}
                                      max={999}
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col">
                                  <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                                  <div className="text-start text-sm">{ex_item?.time}</div>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Load</label>
                                <Input
                                  type="number"
                                  className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                  // name={`exercises[${exerciseIndex}].sets[${idx}].load`}
                                  min={0}
                                  max={999}
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                                {/* <select
                                  defaultValue="lb(s)"
                                  name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                                >
                                  {unitOptions.map((unit, unit_idx) => <option key={unit_idx}>{unit}</option>)}
                                </select> */}
                                <Select
                                  defaultValue="lb(s)"
                                  // name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                                >
                                  <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                                    <SelectValue placeholder="Select Units" />
                                  </SelectTrigger>
                                  <SelectContent className="dark:border-border-muted">
                                    <SelectGroup>
                                      <SelectLabel>Load Unit</SelectLabel>
                                      {unitOptions.map((unit, unit_idx) => <SelectItem key={unit_idx} value={unit.value}>{unit.label}</SelectItem>)}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                                <Input
                                  type="text"
                                  className="w-36 text-sm px-2 h-5 self-end bg-background dark:border-border-muted"
                                  placeholder="Optional"
                                  // name={`exercises[${exerciseIndex}].sets[${idx}].notes`}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <PrimaryButton
        type="submit"
        name="_action"
        value="saveUserWorkoutLog"
        className="text-foreground px-4 py-2 rounded w-fit self-end"
        // disabled={isSavingWorkout}
        // isLoading={isSavingWorkout}
      >
        Save
      </PrimaryButton>
    </Form>
  )
}