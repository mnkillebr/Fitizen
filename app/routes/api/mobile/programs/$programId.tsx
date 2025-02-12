import { ProgramLog } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import { getProgramById, getUserProgramLogsByProgramId } from "~/models/program.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const programId = params.programId as string;
  const program = await getProgramById(programId)
  if (!program) {
    throw data(
      { message: "The program you are attempting to view does not exist"},
      { status: 404, statusText: "Program Not Found" }
    )
  }
  const userCurrentProgramLogs = await getUserProgramLogsByProgramId(user.id, programId) as Array<ProgramLog>
  const programLength = program.weeks.length * program.weeks[0].days.length
  const programDay = ((userCurrentProgramLogs.length) % (programLength) % (program.weeks[0].days.length)) + 1
  const programWeek = Math.ceil(((userCurrentProgramLogs.length) % (programLength) + 1) / program.weeks[0].days.length)
  return {
    program: {
      ...program,
      owns: program?.userId === user.id,
    },
    userCurrentProgramLogs,
    programDay,
    programWeek,
    programLength,
  }
};
