import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { ChevronLeft } from "images/icons";
import { z } from "zod";
import CurrentDate from "~/components/CurrentDate";
import db from "~/db.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const logId = url.searchParams.get("id") as string;
  const userLog = await db.programLog.findUnique({
    where: {
      id: logId,
      userId: user.id,
    },
    include: {
      program: {
        select: {
          name: true,
        },
      },
      exerciseLogs: {
        include: {
          sets: true,
          blockExercise: {
            include: {
              block: {
                select: {
                  blockNumber: true,
                },
              },
              exercise: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const mappedBlocks = userLog?.exerciseLogs.reduce((result: any, curr: any) => {
    let resultArr = result
    if (resultArr.length && resultArr.find((obj: { programBlockId: string }) => obj.programBlockId === curr.programBlockId)) {
      resultArr = resultArr.map((obj: { programBlockId: string, sets: any[] }) => {
        if (obj.programBlockId === curr.programBlockId) {
          if (obj.sets.find(set => set.set === parseInt(curr.sets[0].set))) {
            return {
              ...obj,
              sets: obj.sets.map(set => {
                if (set.set === parseInt(curr.sets[0].set)) {
                  return {
                    ...set,
                    exercises: set.exercises.concat({
                      ...curr.sets[0],
                      ...curr.blockExercise,
                      exerciseName: curr.blockExercise.exercise.name,
                      exerciseId: curr.exerciseId,
                    }).sort((a: any, b: any) => a.orderInBlock - b.orderInBlock)
                  }
                } else {
                  return set
                }
              })
            }
          } else {
            return {
              ...obj,
              sets: obj.sets.concat({
                set: parseInt(curr.sets[0].set),
                exercises: [{
                  ...curr.sets[0],
                  ...curr.blockExercise,
                  exerciseName: curr.blockExercise.exercise.name,
                  exerciseId: curr.exerciseId,
                }]
              })
            }
          }
        } else {
          return obj
        }
      })
    } else {
      if (curr.programBlockId) {
        resultArr = resultArr.concat({
          blockNumber: curr.blockExercise.block.blockNumber,
          programBlockId: curr.programBlockId,
          sets: [{
            set: parseInt(curr.sets[0].set),
            exercises: [{
              ...curr.sets[0],
              ...curr.blockExercise,
              exerciseName: curr.blockExercise.exercise.name,
              exerciseId: curr.exerciseId,
            }]
          }]
        })
      }
    }
    return resultArr
  }, [])
  return json({ userLog, mappedBlocks })
};

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

export default function LogView() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isNavigatingBack =
    navigation.state === "loading" &&
    navigation.location.pathname === `/app/programs/${data.userLog?.programId}`
  return (
    <div className="px-2 pt-0 md:px-3 md:pt-0 flex flex-col h-[calc(100vh-4rem)] gap-y-3 select-none bg-background text-foreground">
      {/* <div className="flex">
        <Link to={`/app/programs/${data.userLog?.programId}`}>
          <ChevronLeft className="hover:text-primary" />
        </Link>
      </div> */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link
            to={`/app/programs/${data.userLog?.programId}`}
            className={clsx(
              "flex items-center text-primary-foreground text-sm bg-primary",
              "py-2 pl-2 pr-3 rounded-md hover:bg-primary/90 shadow",
              isNavigatingBack ? "animate-pulse" : ""
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <div className="">Back</div>
          </Link>
          <div className="flex-none font-semibold">{`Program Log - Week ${data.userLog?.programWeek} - Day ${data.userLog?.programDay}`}</div>
        </div>
        <div className="*:text-sm"><CurrentDate incomingDate={data.userLog?.date} /></div>
      </div>
      {/* <div className="flex flex-col">
        <div className="font-semibold text-md">{data.userLog?.program.name}</div>
        <div className="font-medium text-xs text-muted-foreground">Week {data.userLog?.programWeek} - Day {data.userLog?.programDay}</div>
      </div> */}
      <div className="font-semibold text-lg">Logged Exercises</div>
      <div
        className={clsx(
          "overflow-y-auto flex flex-col gap-y-3 bg-background-muted",
          "rounded-md shadow-md bg-slate-50 py-4 px-3",
          "dark:bg-background-muted dark:border dark:border-border-muted dark:shadow-border-muted"
        )}
      >
        <div className="overflow-y-auto flex flex-col gap-y-3">
          {data.mappedBlocks.map((block, block_idx) => {
            return (
              <div key={`${block.programBlockId}-${block_idx}`} className="flex flex-col">
                <div className="flex gap-x-1 flex-nowrap">
                  <div className="flex-none font-semibold w-28">{`Block #${block.blockNumber}:`}</div>
                </div>
                <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-2">
                  {block.sets.map((set, set_idx) => (
                    <div key={`${block_idx}-${set_idx}`} className="border rounded dark:border-none dark:shadow-sm dark:shadow-border-muted">
                      <div className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                        <div className="tex-base font-semibold mb-1">{`Set ${set.set}`}</div>
                        {set.exercises.map((ex_item, ex_idx) => (
                          <div key={`${ex_idx}-${ex_item.id}`} className="py-1">
                            <div className="flex flex-wrap gap-x-3">
                              <div className="flex flex-col w-full sm:w-56">
                                <label className="text-xs font-semibold text-muted-foreground">Name</label>
                                <div className="flex gap-2 w-full">
                                  <div className="truncate">{ex_item.exerciseName}</div>
                                </div>
                              </div>
                              {ex_item.target === "reps" ? (
                                <>
                                  <div className="flex flex-col">
                                    <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                                    <div className="text-start">{ex_item.reps}</div>
                                  </div>
                                  <div className="flex flex-col">
                                    <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                                    <div className="text-start">{ex_item.actualReps}</div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col">
                                  <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                                  <div className="text-start">{ex_item.time}</div>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Load</label>
                                <div className="text-start">{ex_item.load}</div>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                                <div className="text-start">{ex_item.unit === "kilogram" ? "kg(s)" : ex_item.unit === "pound" ? "lb(s)": ex_item.unit}</div>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                                <div className="text-start">{ex_item.notes}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};
