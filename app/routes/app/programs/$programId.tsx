import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import clsx from "clsx";
import { ChevronLeft, PlayIcon } from "images/icons";
import CustomCarousel from "~/components/CustomCarousel";
import { createIntroProgram, getProgramById } from "~/models/program.server";
import { requireLoggedInUser } from "~/utils/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  // const program = await createIntroProgram()
  // console.log("here", program)
  return null
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
  return json({
    program: {
      ...program,
      owns: program?.userId === user.id,
    },
  });
}

export default function ProgramDetail() {
  const { program } = useLoaderData<typeof loader>();
  const submit = useSubmit()
  // console.log("program", program)
  return (
    <div
      className={clsx(
        "px-5 py-6 md:px-7 md:py-8 flex flex-col h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.75rem)]",
        "gap-y-4 select-none bg-background text-foreground"
      )}
    >
      <Link className="flex-none" to="/app/programs">
        <ChevronLeft className="hover:text-primary" />
      </Link>
      <div className="flex-none font-semibold">
        {program.name}
      </div>
      <div className="flex-none h-1/4 md:h-1/3 flex flex-col lg:flex-row gap-3">
        <div
          className="h-[calc(100%-3.75rem)] lg:h-full w-full shadow-md lg:shadow-none rounded-md dark:border dark:border-border-muted dark:shadow-border-muted bg-cover bg-top"
          style={{backgroundImage: `url(${program.s3ImageKey})`}}
        />
        <div className="hidden lg:flex lg:flex-col lg:h-full w-full gap-3">
          <div
            className={clsx(
              "h-2/3 flex-col py-2 px-4 bg-slate-50 rounded-lg shadow-sm",
              "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
            )}
          >
            <div className="font-semibold mb-2">Description</div>
            <div className="text-muted-foreground text-sm">{program.description}</div>
          </div>
          <Link
            to={`/app/programs/log?id=${program.id}`}
            className={clsx(
              "flex h-1/3 items-center justify-center rounded-lg shadow-sm active:scale-95 hover:cursor-pointer",
              "bg-slate-50 dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
            )}
            // onClick={() => setStartWorkout(!startWorkout)}
          >
            {/* <div className="size-12"></div> */}
            <div className="select-none font-semibold self-center mr-4">Start Program</div>
            <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
          </Link>
        </div>
        <Link
          to={`/app/programs/log?id=${program.id}`}
          className={clsx(
            "flex lg:hidden h-12 items-center justify-between bg-slate-50",
            "shadow-md active:scale-95 hover:cursor-pointer dark:bg-background-muted",
            "dark:border dark:border-border-muted dark:shadow-border-muted",
            "rounded-full"
          )}
          // onClick={() => setStartWorkout(!startWorkout)}
        >
          <div className="size-12 invisible"></div>
          <div className="select-none font-semibold self-center">Start Program</div>
          <div className="bg-primary rounded-full p-3"><PlayIcon /></div>
        </Link>
      </div>
      <div className="flex-1 flex flex-col gap-y-3 snap-y snap-mandatory overflow-y-auto">
        {program.weeks.map((week, week_idx) => (
          <div key={`week-${week_idx}`} className="snap-start min-h-[calc(50%-0.75rem)] lg:flex-1 w-full">
            <div className="font-semibold">Week {week.weekNumber}</div>
            <div
              className={clsx(
                "hidden lg:flex h-[calc(100%-1.5rem)] *:shadow-md *:rounded-md gap-x-2 px-0.5",
                "*:w-1/3 *:dark:border *:dark:border-border-muted *:dark:shadow-border-muted",
              )}
            >
              {week.days.map((day, day_idx) => (
                <div key={`day-${day_idx}`} className="p-2 overflow-hidden overflow-y-auto">
                  <div className="font-semibold mb-2 text-muted-foreground">Day {day.dayNumber}</div>
                  <div className="flex flex-col p-1 gap-1 *:bg-slate-100 *:rounded *:px-2 *:py-1 *:dark:bg-background-muted">
                    {day.blocks.map((block, block_idx) => (
                      <div key={`block-${block_idx}`} className="">
                        {block.exercises.map((exercise, exercise_idx) => (
                          <div key={`exercise-${exercise_idx}`} className="flex">
                            <div className="w-2/3">{exercise.exercise.name}</div>
                            <div className="w-1/3">{exercise.sets} x {exercise.time ? `${exercise.time} sec` : exercise.reps}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Tabs className="w-full h-full lg:hidden px-0.5" defaultValue="day_1">
              <TabsList>
                {week.days.map((day, day_idx) => (<TabsTrigger key={`day-${day_idx}`} value={`day_${day.dayNumber}`}>Day {day.dayNumber}</TabsTrigger>))}
              </TabsList>
              {week.days.map((day, day_idx) => (
                <TabsContent
                  key={`day-${day_idx}`}
                  value={`day_${day.dayNumber}`}
                  className="p-2 shadow-md h-[calc(100%-4.25rem)] rounded-md dark:border dark:border-border-muted dark:shadow-border-muted overflow-hidden"
                >
                  <div className="font-semibold mb-2 text-muted-foreground">Day {day.dayNumber}</div>
                  <div className="flex flex-col p-1 gap-1 *:bg-slate-100 *:rounded *:px-2 *:py-1 *:dark:bg-background-muted">
                    {day.blocks.map((block, block_idx) => (
                      <div key={`block-${block_idx}`} className="">
                        {block.exercises.map((exercise, exercise_idx) => (
                          <div key={`exercise-${exercise_idx}`} className="flex">
                            <div className="w-2/3">{exercise.exercise.name}</div>
                            <div className="w-1/3">{exercise.sets} x {exercise.time ? `${exercise.time} sec` : exercise.reps}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ))}
      </div>
    </div>
  )
}

