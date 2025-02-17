import { LoadUnit } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, data, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { ChevronLeft } from "images/icons";
import { Video } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import CountdownTimer from "~/components/CountdownTimer";
import CurrentDate from "~/components/CurrentDate";
import { useOpenDialog } from "~/components/Dialog";
import { ExerciseDialog, exerciseDialogOptions } from "~/components/ExerciseDialog";
import Stopwatch from "~/components/Stopwatch";
import { PrimaryButton } from "~/components/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { newSavedProgramLogCookie } from "~/cookies";
import db from "~/db.server";
import { getProgramById, getUserProgramLogsByProgramId, saveUserProgramLog } from "~/models/program.server";
import { generateMuxVideoToken } from "~/mux-tokens.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { programLogFormDataToObject } from "~/utils/misc";
import { validateForm, validateObject } from "~/utils/validation";

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
    throw data(
      { message: "The program you are attempting to log does not exist"},
      { status: 404, statusText: "Program Not Found" }
    )
  }
  const userCurrentProgramLogs = await getUserProgramLogsByProgramId(user.id, program.id)
  const programLength = program.weeks.length * program.weeks[0].days.length
  const programDay = ((userCurrentProgramLogs.length) % (programLength) % (program.weeks[0].days.length)) + 1
  const programWeek = Math.ceil(((userCurrentProgramLogs.length) % (programLength) + 1) / program.weeks[0].days.length)
  const currentProgramWorkout = program.weeks[programWeek-1].days[programDay-1]
  const movementPrep = await db.movementPrep.findUnique({
    where: {
      id: currentProgramWorkout.movementPrepId,
    },
    include: {
      foamRolling: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      mobility: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      activation: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedMovementPrep = {
    ...movementPrep,
    foamRolling: movementPrep?.foamRolling.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    })),
    mobility: movementPrep?.mobility.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    })),
    activation: movementPrep?.activation.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    }))
  }
  const warmup = await db.warmup.findUnique({
    where: {
      id: currentProgramWorkout.warmupId,
    },
    include: {
      dynamic: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      ladder: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
      power: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedWarmup = {
    ...warmup,
    dynamic: warmup?.dynamic.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    })),
    ladder: warmup?.ladder.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    })),
    power: warmup?.power.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    }))
  }
  const cooldown = await db.cooldown.findUnique({
    where: {
      id: currentProgramWorkout.cooldownId,
    },
    include: {
      exercises: {
        include: {
          exercise: {
            select: {
              name: true,
              muxPlaybackId: true,
              cues: true,
            }
          }
        }
      },
    }
  })
  const tokenMappedCooldown = {
    ...cooldown,
    exercises: cooldown?.exercises.map(ex_item => ({
      ...ex_item,
      exercise: {
        ...ex_item.exercise,
        videoToken: generateMuxVideoToken(ex_item.exercise.muxPlaybackId),
      }
    })),
  }
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
  return {
    program,
    programLength,
    programDay,
    programWeek,
    currentProgramWorkout: tokenMappedProgramWorkout,
    movementPrep: tokenMappedMovementPrep,
    warmup: tokenMappedWarmup,
    cooldown: tokenMappedCooldown,
  }
}

// Define Zod schema for form validation
const programLogSchema = z.object({
  programId: z.string(),
  programWeek: z.string(),
  programDay: z.string(),
  duration: z.string(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date string",
  }),
  blocks: z.array(z.object({
    blockId: z.string().optional(),
    blockNumber: z.string().optional(),
    programBlockId: z.string(),
    sets: z.array(z.object({
      set: z.string(),
      targetReps: z.string().optional(),
      time: z.string().optional(),
      exerciseId: z.string(),
      actualReps: z.string().optional(),
      load: z.string().optional(),
      unit: z.string(),
      notes: z.string().optional(),
    })),
  })).min(1, "You must log at least one exercise"),
});

const themeSchema = z.object({
  darkMode: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "saveUserProgramLog": {
      return validateObject(
        programLogFormDataToObject(formData),
        programLogSchema,
        async (data) => {
          const mappedExerciseLogs = data.blocks.reduce((result: any, curr: any) => {
            let resultArr = result
            if (curr.sets) {
              const mappedSets = curr.sets.map((set: any) => ({
                ...set,
                programBlockId: curr.programBlockId,
                load: set.load ? parseFloat(set.load) : undefined,
                unit: set.unit === "bw" ? LoadUnit.bodyweight : set.unit === "lb(s)" ? LoadUnit.pound : LoadUnit.kilogram,
              }))
              return resultArr.concat(mappedSets)
            } else {
              return resultArr
            }
          }, [])
          const savedLog = await saveUserProgramLog(user.id, data.programId, parseInt(data.programWeek), parseInt(data.programDay), data.duration, mappedExerciseLogs)
          return redirect(`/app/programs/${data.programId}`, {
            headers: {
              "Set-Cookie": await newSavedProgramLogCookie.serialize(savedLog.id, { maxAge: 5 }),
            }
          });
        },
        (errors) => data({ errors }, { status: 400 })
      )
    }
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => data(
          { success: true },
          {
            headers: {
              "Set-Cookie": `fitizen__darkMode=${darkMode}; SameSite=Strict; Path=/`,
            },
          }
        ),
        (errors) => data({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

export default function ProgramLog() {
  const {
    currentProgramWorkout,
    program,
    programLength,
    programDay,
    programWeek,
    movementPrep,
    warmup,
    cooldown,
  } = useLoaderData<typeof loader>();
  const [showStopwatch, setShowStopwatch] = useState(false);
  const openDialog = useOpenDialog();
  const navigation = useNavigation();
  const isNavigatingBack =
    navigation.state === "loading" &&
    navigation.location.pathname === `/app/programs/${program?.id}`
  const isSavingWorkout =
    navigation.state === "submitting" ||
    navigation.state === "loading" && navigation.formMethod === "POST"

  return (
    <Form method="post" className="px-2 pt-0 md:px-3 md:pt-0 flex flex-col gap-y-3 overflow-hidden select-none text-foreground">
      {/* <div className="flex">
        <Link to={`/app/programs/${program?.id}`}>
          <ChevronLeft className="hover:text-primary" />
        </Link>
      </div> */}
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link
            to={`/app/programs/${program?.id}`}
            className={clsx(
              "flex items-center text-primary-foreground bg-primary text-sm",
              "py-2 pl-2 pr-3 rounded-md hover:bg-primary/90 shadow",
              isNavigatingBack ? "animate-pulse" : ""
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="">Back</div>
          </Link>
          <div className="flex-none font-semibold">{`New Program Log - Week ${programWeek} - Day ${programDay}`}</div>
        </div>
        <div className="*:text-sm"><CurrentDate /></div>
        <input type="hidden" name="date" value={new Date().toISOString()} />
        <input type="hidden" name="programId" value={program.id} />
        <input type="hidden" name="programWeek" value={programWeek} />
        <input type="hidden" name="programDay" value={programDay} />
      </div>
      {/* <div className="flex flex-col">
        <div className="font-medium text-xs text-muted-foreground">Program Name</div>
        <div className="font-semibold text-md">{program?.name}</div>
      </div> */}
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
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="font-semibold text-lg">Movement Prep</div>
          </AccordionTrigger>
          <AccordionContent>
            <div
              className={clsx(
                "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted flex flex-col gap-y-2",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              {movementPrep.foamRolling && movementPrep.foamRolling.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Foam Rolling</div>
                  <div className="flex flex-col gap-1">
                    {movementPrep.foamRolling.map((roll, roll_idx) => (
                      <div key={roll_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{roll.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={roll.exercise} />,
                              exerciseDialogOptions(roll.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{roll.reps}</div>
                        </div>
                        {roll.time ? (
                          <div className="flex flex-col w-11">
                            <label className="text-xs font-semibold text-muted-foreground">Time</label>
                            <div className="text-start text-sm">{roll.time} sec</div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {movementPrep.mobility && movementPrep.mobility.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Mobility</div>
                  <div className="flex flex-col gap-1">
                    {movementPrep.mobility.map((mob, mob_idx) => (
                      <div key={mob_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{mob.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={mob.exercise} />,
                              exerciseDialogOptions(mob.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{mob.reps}</div>
                        </div>
                        {mob.time ? (
                          <div className="flex flex-col w-11">
                            <label className="text-xs font-semibold text-muted-foreground">Time</label>
                            <div className="text-start text-sm">{mob.time} sec</div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {movementPrep.activation && movementPrep.activation.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Activation</div>
                  <div className="flex flex-col gap-1">
                    {movementPrep.activation.map((act, act_idx) => (
                      <div key={act_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{act.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={act.exercise} />,
                              exerciseDialogOptions(act.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{act.reps}</div>
                        </div>
                        {act.time ? (
                          <div className="flex flex-col w-11">
                            <label className="text-xs font-semibold text-muted-foreground">Time</label>
                            <div className="text-start text-sm">{act.time} sec</div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <div className="font-semibold text-lg">Warm-up</div>
          </AccordionTrigger>
          <AccordionContent>
            <div
              className={clsx(
                "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted flex flex-col gap-y-2",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              {warmup.dynamic && warmup.dynamic.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Dynamic Drills</div>
                  <div className="flex flex-col gap-1">
                    {warmup.dynamic.map((drill, drill_idx) => (
                      <div key={drill_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{drill.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={drill.exercise} />,
                              exerciseDialogOptions(drill.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{drill.reps}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {warmup.ladder && warmup.ladder.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Ladder</div>
                  <div className="flex flex-col gap-1">
                    {warmup.ladder.map((ladder, ladder_idx) => (
                      <div key={ladder_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{ladder.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={ladder.exercise} />,
                              exerciseDialogOptions(ladder.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{ladder.reps}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {warmup.power && warmup.power.length ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="tex-base font-semibold mb-1">Activation</div>
                  <div className="flex flex-col gap-1">
                    {warmup.power.map((power, power_idx) => (
                      <div key={power_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{power.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={power.exercise} />,
                              exerciseDialogOptions(power.exercise.name)
                            )}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                          <div className="text-start text-sm">{power.reps}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="font-semibold text-lg">Exercises</div>
      <div
        className={clsx(
          "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted",
          "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
        )}
      >
        <div className="overflow-y-auto flex flex-col gap-y-3">
          {currentProgramWorkout.blocks.map((block, block_idx) => {
            let overallSetNumber = 0
            return (
              <div key={`${block.id}-${block_idx}`} className="flex flex-col">
                <div className="flex gap-x-1 flex-nowrap">
                  <div className="flex-none font-semibold w-28">{`Block #${block.blockNumber}:`}</div>
                </div>
                <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-2">
                  {[...Array(block.exercises.sort((a: any, b: any) => b.sets - a.sets)[0].sets)].map((set: unknown, set_idx: number) =>
                    <div key={`${block_idx}-${set_idx}`} className="border rounded dark:border-none dark:shadow-sm dark:shadow-border-muted">
                      {block.exercises.sort((a, b) => a.orderInBlock - b.orderInBlock).map((ex_item: any, ex_idx: number) => {
                        const currentSet = set_idx + 1
                        if (currentSet <= ex_item.sets) {
                          overallSetNumber+=1
                        }
                        return (
                          <div key={`${set_idx}-${ex_idx}`} className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                            {ex_idx === 0 ? <div className="tex-base font-semibold mb-1">{`Set ${currentSet}`}</div> : null}
                            <input type="hidden" name={`blocks[${block_idx}].blockId`} value={block.id} />
                            <input type="hidden" name={`blocks[${block_idx}].blockNumber`} value={block.blockNumber} />
                            <input type="hidden" name={`blocks[${block_idx}].programBlockId`} value={ex_item.programBlockId} />
                            {currentSet <= ex_item.sets ? (
                              <div className="flex flex-wrap gap-x-3">
                                <input type="hidden" name={`blocks[${block_idx}].sets[${overallSetNumber-1}].exerciseId`} value={ex_item.exercise.id} />
                                <input type="hidden" name={`blocks[${block_idx}].sets[${overallSetNumber-1}].targetReps`} value={ex_item.reps ?? ""} />
                                <input type="hidden" name={`blocks[${block_idx}].sets[${overallSetNumber-1}].time`} value={ex_item.time ?? ""} />
                                <input type="hidden" name={`blocks[${block_idx}].sets[${overallSetNumber-1}].set`} value={currentSet} />
                                <div className="flex flex-col w-full sm:w-56">
                                  <label className="text-xs font-semibold text-muted-foreground">Name</label>
                                  <div className="flex gap-2 w-full">
                                    <div className="truncate">{ex_item.exercise.name}</div>
                                  </div>
                                </div>
                                {currentSet === 1 ? (
                                  <div className="flex flex-col">
                                    <label className="text-xs font-semibold text-muted-foreground">Video</label>
                                    <Video
                                      className="hover:cursor-pointer min-w-6"
                                      onClick={() => openDialog(
                                        <ExerciseDialog exercise={ex_item.exercise} />,
                                        exerciseDialogOptions(ex_item.exercise.name)
                                      )}
                                    />
                                  </div>
                                ) : null}
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
                                        name={`blocks[${block_idx}].sets[${overallSetNumber-1}].actualReps`}
                                        placeholder={ex_item?.reps}
                                        min={1}
                                        max={999}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex flex-col w-11">
                                    <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                                    <div className="text-start text-sm">{ex_item?.time} sec</div>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <label className="text-xs font-semibold text-muted-foreground">Load</label>
                                  <Input
                                    type="number"
                                    className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                                    name={`blocks[${block_idx}].sets[${overallSetNumber-1}].load`}
                                    min={0}
                                    max={999}
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                                  <Select
                                    defaultValue="lb(s)"
                                    name={`blocks[${block_idx}].sets[${overallSetNumber-1}].unit`}
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
                                    name={`blocks[${block_idx}].sets[${overallSetNumber-1}].notes`}
                                  />
                                </div>
                              </div>
                            ) : null}
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
      <Accordion type="single" collapsible>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="font-semibold text-lg">Cooldown</div>
          </AccordionTrigger>
          <AccordionContent>
            <div
              className={clsx(
                "rounded-md shadow-md bg-slate-50 py-4 px-3 bg-background-muted flex flex-col gap-y-2",
                "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
              )}
            >
              {cooldown.exercises ? (
                <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  <div className="flex flex-col gap-1">
                    {cooldown.exercises.map((cldwn, cldwn_idx) => (
                      <div key={cldwn_idx} className="flex flex-wrap gap-x-3">
                        <div className="flex flex-col w-full sm:w-56">
                          <label className="text-xs font-semibold text-muted-foreground">Name</label>
                          <div className="flex gap-2 w-full">
                            <div className="truncate">{cldwn.exercise.name}</div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Video</label>
                          <Video
                            className="hover:cursor-pointer min-w-6"
                            onClick={() => openDialog(
                              <ExerciseDialog exercise={cldwn.exercise} />,
                              exerciseDialogOptions(cldwn.exercise.name)
                            )}
                          />
                        </div>
                        {cldwn.reps ? (
                          <div className="flex flex-col">
                            <label className="text-xs font-semibold text-muted-foreground">Reps</label>
                            <div className="text-start text-sm">{cldwn.reps}</div>
                          </div>
                        ) : null}
                        {cldwn.time ? (
                          <div className="flex flex-col w-11">
                            <label className="text-xs font-semibold text-muted-foreground">Time</label>
                            <div className="text-start text-sm">{cldwn.time} sec</div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <PrimaryButton
        type="submit"
        name="_action"
        value="saveUserProgramLog"
        className={clsx(
          "text-primary-foreground px-4 py-2 rounded w-fit self-end",
          "disabled:cursor-not-allowed disabled:bg-primary/70 disabled:text-primary-foreground/70"
        )}
        disabled={!showStopwatch}
        isLoading={isSavingWorkout}
      >
        Save
      </PrimaryButton>
    </Form>
  )
}