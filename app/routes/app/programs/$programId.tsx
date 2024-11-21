import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import clsx from "clsx";
import { ChevronLeft, PlayIcon } from "images/icons";
import CustomCarousel from "~/components/CustomCarousel";
import { createIntroProgram, getProgramById, getUserProgramLogsByProgramId } from "~/models/program.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { ProgramLog } from "@prisma/client";
import { validateForm } from "~/utils/validation";
import { newSavedProgramLogCookie } from "~/cookies";
import { z } from "zod";
import { useEffect } from "react";
import { useOpenDialog } from "~/components/Dialog";
import { WorkoutCompleted, workoutSuccessDialogOptions } from "~/components/WorkoutCompleted";

const themeSchema = z.object({
  darkMode: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get("_action")) {
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => json(
          { success: true },
          {
            headers: {
              "Set-Cookie": `fitizen__darkMode=${darkMode}; SameSite=Strict; Path=/`,
            },
          }
        ),
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const programId = params.programId as string;
  const program = await getProgramById(programId)
  if (!program) {
    throw json(
      { message: "The program you are attempting to view does not exist"},
      { status: 404, statusText: "Program Not Found" }
    )
  }
  const userCurrentProgramLogs = await getUserProgramLogsByProgramId(user.id, programId) as Array<ProgramLog>
  const programLength = program.weeks.length * program.weeks[0].days.length
  const programDay = ((userCurrentProgramLogs.length) % (programLength) % (program.weeks[0].days.length)) + 1
  const programWeek = Math.ceil(((userCurrentProgramLogs.length) % (programLength) + 1) / program.weeks[0].days.length)
  const cookieHeader = request.headers.get("cookie");
	const newlogId = await newSavedProgramLogCookie.parse(cookieHeader);
  return json({
    program: {
      ...program,
      owns: program?.userId === user.id,
    },
    userCurrentProgramLogs,
    programDay,
    programWeek,
    newLogSaved: userCurrentProgramLogs.find(log => log.id === newlogId)
  });
}

export default function ProgramDetail() {
  const { program, userCurrentProgramLogs, programWeek, programDay, newLogSaved } = useLoaderData<typeof loader>();
  // const submit = useSubmit()
  const navigation = useNavigation();
  const isNavigatingPrograms =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/programs"
  const isNavigatingLog =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/programs/log"
  const isNavigatingLogView =
    navigation.state === "loading" &&
    navigation.location.pathname === "/app/programs/logview"

  const openDialog = useOpenDialog();
  useEffect(() => {
    if (newLogSaved) {
      openDialog(<WorkoutCompleted workoutName={`Week ${newLogSaved.programWeek} - Day ${newLogSaved.programDay}`} />, workoutSuccessDialogOptions)
    }
  }, [])

  return (
    <div
      className={clsx(
        "px-2 pt-0 md:px-3 md:pt-0 flex flex-col h-[calc(100vh-4rem)]",
        "gap-y-4 select-none bg-background text-foreground"
      )}
    >
      {/* <Link className="flex-none" to="/app/programs">
        <ChevronLeft className="hover:text-primary" />
      </Link> */}
      <div className="flex gap-4 items-center">
        <Link
          to="/app/programs"
          className={clsx(
            "flex items-center text-primary-foreground bg-primary text-sm w-fit",
            "py-2 pl-2 pr-3 rounded-md hover:bg-primary/90 shadow",
            isNavigatingPrograms ? "animate-pulse" : ""
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <div className="">Back</div>
        </Link>
        <div className="flex-none font-semibold">
          {program.name}
        </div>
      </div>
      <div className="flex-none h-1/4 md:h-1/3 flex flex-col lg:flex-row gap-3">
        <div className="relative h-full group lg:hidden">
          <div
            className={clsx(
              "absolute inset-0 transition-opacity duration-300 group-hover:opacity-30",
              "h-full w-full shadow-md lg:shadow-none rounded-md",
              "dark:border dark:border-border-muted dark:shadow-border-muted bg-cover bg-top"
            )}
            style={{backgroundImage: `url(${program.s3ImageKey})`}}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="font-semibold mb-2">Description</div>
            <div className="text-muted-foreground text-sm">{program.description}</div>
          </div>
        </div>
        <div
          className="hidden lg:flex h-full w-full shadow-md lg:shadow-none rounded-md dark:border dark:border-border-muted dark:shadow-border-muted bg-cover bg-top"
          style={{backgroundImage: `url(${program.s3ImageKey})`}}
        />
        <div className="hidden lg:flex lg:flex-col lg:h-full w-full gap-3">
          <div
            className={clsx(
              "h-2/3 flex-col py-2 px-4 bg-slate-50 rounded-lg shadow-md",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted",
              "dark:shadow-sm"
            )}
          >
            <div className="font-semibold mb-2">Description</div>
            <div className="text-muted-foreground text-sm">{program.description}</div>
          </div>
          <Link
            to={`/app/programs/log?id=${program.id}`}
            className={clsx(
              "flex h-1/3 items-center justify-center rounded-lg shadow-md active:scale-95 hover:cursor-pointer bg-slate-50",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted dark:shadow-sm",
              isNavigatingLog ? "animate-pulse" : ""
            )}
          >
            {/* <div className="size-12"></div> */}
            <div className="flex flex-col">
              <div className="select-none font-semibold self-center mr-4">{userCurrentProgramLogs.length ? 'Continue Program' : 'Start Program'}</div>
              {userCurrentProgramLogs.length ? <div className="select-none self-center text-sm text-muted-foreground mr-4">Week {programWeek} - Day {programDay}</div> : null}
            </div>
            <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
          </Link>
        </div>
        <Link
          to={`/app/programs/log?id=${program.id}`}
          className={clsx(
            "flex lg:hidden h-12 items-center justify-between shadow-md active:scale-95 rounded-full bg-slate-50",
            "hover:cursor-pointer dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted",
            isNavigatingLog ? "animate-pulse" : ""
          )}
        >
          <div className="size-12 invisible"></div>
          <div className="flex gap-2">
            <div className="select-none font-semibold self-center">{userCurrentProgramLogs.length ? 'Continue Program' : 'Start Program'}</div>
            {userCurrentProgramLogs.length ? <div className="select-none self-center text-sm text-muted-foreground">Week {programWeek} - Day {programDay}</div> : null}
          </div>
          <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
        </Link>
      </div>
      <div className="md:pb-6 flex-1 flex flex-col gap-y-3 snap-y snap-mandatory overflow-y-auto">
        {program.weeks.map((week, week_idx) => (
          <div key={`week-${week_idx}`} className="snap-start min-h-[calc(50%-0.75rem)] lg:flex-1 w-full">
            <div className="font-semibold">Week {week.weekNumber}</div>
            <div
              className={clsx(
                "hidden lg:flex h-[calc(100%-1.5rem)] *:shadow-md *:rounded-md gap-x-2 px-0.5",
                "*:w-1/3 *:dark:border *:dark:border-border-muted *:dark:shadow-border-muted",
              )}
            >
              {week.days.map((day, day_idx) => {
                const logExists = userCurrentProgramLogs.find(log => log.programDay === day.dayNumber && log.programWeek === week.weekNumber)
                return (
                  <div key={`day-${day_idx}`} className="p-2 overflow-hidden overflow-y-auto">
                    <div className="flex items-end justify-between mb-2">
                      <div className="font-semibold text-muted-foreground">Day {day.dayNumber}</div>
                      {logExists ? (
                        <Link
                          to={`/app/programs/logview?id=${logExists?.id}`}
                          className={clsx(
                            "text-sm h-5 underline text-primary hover:text-yellow-500",
                            isNavigatingLogView && navigation.location.search === `?id=${logExists?.id}` ? "animate-pulse" : ""
                          )}
                        >
                          View Log
                        </Link>
                      ) : null}
                    </div>
                    <div className="flex flex-col p-1 gap-1 *:bg-slate-100 *:rounded *:px-2 *:py-1 *:dark:bg-background-muted">
                      {day.blocks.map((block, block_idx) => (
                        <div key={`block-${block_idx}`} className="">
                          {block.exercises.map((exercise, exercise_idx) => (
                            <div key={`exercise-${exercise_idx}`} className="flex">
                              <div className="w-2/3 truncate">{exercise.exercise.name}</div>
                              <div className="w-1/3">{exercise.sets} x {exercise.time ? `${exercise.time} sec` : exercise.reps}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <Tabs className="w-full h-full lg:hidden px-0.5" defaultValue="day_1">
              <TabsList>
                {week.days.map((day, day_idx) => (<TabsTrigger key={`day-${day_idx}`} value={`day_${day.dayNumber}`}>Day {day.dayNumber}</TabsTrigger>))}
              </TabsList>
              {week.days.map((day, day_idx) => {
                const logExists = userCurrentProgramLogs.find(log => log.programDay === day.dayNumber && log.programWeek === week.weekNumber)
                return (
                  <TabsContent
                    key={`day-${day_idx}`}
                    value={`day_${day.dayNumber}`}
                    className="p-2 shadow-md h-[calc(100%-4.25rem)] rounded-md dark:border dark:border-border-muted dark:shadow-border-muted overflow-hidden"
                  >
                    <div className="flex items-end justify-between mb-2">
                      <div className="font-semibold text-muted-foreground">Day {day.dayNumber}</div>
                      {logExists ? (
                        <Link
                          to={`/app/programs/logview?id=${logExists?.id}`}
                          className={clsx(
                            "text-sm h-5 underline text-primary hover:text-yellow-500",
                            isNavigatingLogView && navigation.location.search === `?id=${logExists?.id}` ? "animate-pulse" : ""
                          )}
                        >
                          View Log
                        </Link>
                      ) : null}
                    </div>
                    <div className="flex flex-col p-1 gap-1 *:bg-slate-100 *:rounded *:px-2 *:py-1 *:dark:bg-background-muted">
                      {day.blocks.map((block, block_idx) => (
                        <div key={`block-${block_idx}`} className="">
                          {block.exercises.map((exercise, exercise_idx) => (
                            <div key={`exercise-${exercise_idx}`} className="flex">
                              <div className="w-2/3 truncate">{exercise.exercise.name}</div>
                              <div className="w-1/3">{exercise.sets} x {exercise.time ? `${exercise.time} sec` : exercise.reps}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>
        ))}
      </div>
    </div>
  )
}

