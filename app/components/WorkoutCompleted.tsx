import { XMarkIcon } from "@heroicons/react/24/outline";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useCloseDialog } from "./Dialog";

interface WorkoutCompletedProps {
  workoutName: string;
  closeDialog?: () => void;
}

export function WorkoutCompleted ({ workoutName }: WorkoutCompletedProps) {
  const closeDialog = useCloseDialog();
  return (
    <div className="relative pt-16">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2">
        <div className="absolute -right-1 -top-1 z-10 rounded-full bg-primary p-1 cursor-pointer" onClick={closeDialog}>
          <XMarkIcon className="text-primary-foreground h-6 w-6"/>
        </div>
        <div className="size-72 rounded-full overflow-hidden">
          <DotLottieReact src="https://lottie.host/207c5cf1-51d7-4917-836d-7251e7b162bd/w8RRmDM4Jf.lottie" autoplay playOnHover />
        </div>
      </div>
      <div className="text-center space-y-4 mt-16">
        <div>
          <h3 className="text-xl font-semibold mb-2">Congrats!</h3>
          <p className="">You completed {workoutName}</p>
          <p className="">Keep it up! 💪</p>
        </div>
      </div>
    </div>
  )
}

export const workoutSuccessDialogOptions = {
  allowOverflow: true,
  closeButton: {
    show: false,
  },
}