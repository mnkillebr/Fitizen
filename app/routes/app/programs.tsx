import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
// import boxDude from "images/boxer_dude.jpeg"
// import squatGirl from "images/squat_lady.jpeg"
import { z } from "zod";
import { darkModeCookie } from "~/cookies";
import { getAllPrograms } from "~/models/program.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const role = user.role;

  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const programs = await getAllPrograms(query);
  return json({ programs, });
}

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

export default function Programs() {
  const { programs } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const navigate = useNavigate();
  const inProgramDetailRoute = matches.map(m => m.id).includes("routes/app/programs/$programId");
  const inLogSubRoute = matches.map(m => m.id).includes("routes/app/programs/log");
  const inLogViewSubRoute = matches.map(m => m.id).includes("routes/app/programs/logview");

  if (inProgramDetailRoute || inLogSubRoute || inLogViewSubRoute) {
    return (
      <div className="flex flex-col h-full">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 flex flex-col h-full gap-x-6 gap-y-4 snap-y snap-mandatory overflow-y-auto bg-background">
      {/* <h1 className="text-lg font-semibold md:text-2xl text-foreground">Programs</h1> */}
      {programs.map((program, program_idx) => (
        <div
          key={program_idx}
          className="relative flex-1 shadow-md dark:shadow-border-muted dark:border dark:border-border-muted cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-top snap-start text-center"
          style={{backgroundImage: `url(${program.s3ImageKey})`}}
          onClick={() => navigate(program.id)}
        >
          <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
            <div className="font-bold">{program.name}</div>
            <div className="italic">Difficulty: Beginner</div>
          </div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
            <div className="content-center select-none bg-primary text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
          </div>
        </div>
      ))}
      <div
        className="relative flex-1 shadow-md dark:shadow-border-muted dark:border dark:border-border-muted cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-center snap-start bg-slate-50 text-center"
        style={{backgroundImage: `url(https://res.cloudinary.com/dqrk3drua/image/upload/f_auto,q_auto/v1/fitizen/s2j4mlhnvppquh8j9jk9)`, opacity: 0.6}}
      >
        <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
          <div className="font-bold">Pre/Post-Natal Program</div>
          <div className="flex gap-2">
            <div>Difficulty:</div>
            <div className="italic">Beginner</div>
          </div>
        </div>
        <div className="absolute top-[calc(40%)] left-[calc(27%)] text-white font-semibold text-[64px]">COMING SOON</div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
          <div className="content-center select-none bg-primary text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
        </div>
      </div>
    </div>
  )
}