import { Link } from "@remix-run/react";
import { useMatchesData } from "~/utils/api";

export default function CreateWorkout() {
  const matchesData = useMatchesData("route/app/workouts");
  console.log("matches data", matchesData)

  return (
    <div className={`transform transition-transform duration-300 ease-in-out bg-slate-400 h-screen`}>
      <p>Everything to know about our team</p>
      <Link to="/about" className="hover:text-accent">Back</Link>
    </div>
  )
}
