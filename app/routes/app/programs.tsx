import { LoaderFunctionArgs } from "@remix-run/node";
import boxDude from "images/metin-ozer-S1kp1toFK0A-unsplash.jpg"
import squatGirl from "images/sven-mieke-jO6vBWX9h9Y-unsplash.jpg"
import { requireLoggedInUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireLoggedInUser(request);
  return null;
}

export default function Programs() {
  return (
    <div className="p-6 md:p-8 flex flex-col h-full gap-x-6 gap-y-4 snap-y snap-mandatory overflow-y-auto">
      <h1 className="text-lg font-semibold md:text-2xl">Programs</h1>
      <div
        className="relative flex-1 shadow-md cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-center snap-start text-center"
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
        className="relative flex-1 shadow-md cursor-pointer rounded-lg hover:shadow-primary transition duration-150 bg-cover bg-center snap-start bg-slate-50 text-center"
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