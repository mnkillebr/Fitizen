import { LoaderFunctionArgs } from "@remix-run/node";
import { getProgramById } from "~/models/program.server";
import { requireAuth } from "~/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const programId = params.programId as string;
  const program = await getProgramById(programId)
  return program;
};
