import { json, LoaderFunctionArgs } from "@remix-run/node";
import { getProgramById } from "~/models/program.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const programId = params.programId as string;
  const program = await getProgramById(programId)
  return json(program);
};
