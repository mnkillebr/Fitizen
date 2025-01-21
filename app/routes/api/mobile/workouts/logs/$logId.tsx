import { LoaderFunctionArgs } from "@remix-run/node";
import db from "~/db.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const logId = params.logId as string;
  const userLog = await db.workoutLog.findUnique({
    where: {
      id: logId,
      userId: user.id,
    },
    include: {
      routine: {
        select: {
          name: true,
        },
      },
      exerciseLogs: {
        include: {
          exercise: {
            select: {
              name: true,
            },
          },
          sets: true,
        },
      },
    },
  });
  if (userLog !== null && userLog.userId !== user.id) {
    throw new Response("This workout log is not yours", { status: 401 });
  }
  return userLog
}