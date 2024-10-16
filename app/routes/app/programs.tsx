import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import boxDude from "images/boxer_dude.jpeg"
import squatGirl from "images/squat_lady.jpeg"
import { z } from "zod";
import { darkModeCookie } from "~/cookies";
import { requireLoggedInUser } from "~/utils/auth.server";
import { validateForm } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedInUser(request);
  return null;
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
  return (
    <div className="p-6 md:p-8 flex flex-col h-full gap-x-6 gap-y-4 snap-y snap-mandatory overflow-y-auto bg-background">
      <h1 className="text-lg font-semibold md:text-2xl text-foreground">Programs</h1>
      <div
        className="relative flex-1 shadow-md dark:shadow-border-muted dark:border dark:border-border-muted cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-center snap-start text-center"
        style={{backgroundImage: `url(${boxDude})`}}
      >
        <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
          <div className="font-bold">Box Dude Program</div>
          <div className="italic">Difficulty: Advanced</div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
          <div className="content-center select-none bg-primary text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
        </div>
      </div>
      <div
        className="relative flex-1 shadow-md dark:shadow-border-muted dark:border dark:border-border-muted cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-center snap-start bg-slate-50 text-center"
        style={{backgroundImage: `url(${squatGirl})`}}
      >
        <div className="absolute top-2 left-2 text-white p-2 flex flex-col items-start">
          <div className="font-bold">Squat Girl Program</div>
          <div className="flex gap-2">
            <div>Difficulty:</div>
            <div className="italic">Beginner</div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/6 bg-transparent flex justify-center">
          <div className="content-center select-none bg-primary text-slate-900 font-bold rounded-tl-lg rounded-br-lg w-full h-full">Go &rarr;</div>
        </div>
      </div>
    </div>
  )
}