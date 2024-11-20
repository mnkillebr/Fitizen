import { CircleStackIcon, LockClosedIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { ChartLine, ClipboardList, Dumbbell } from "lucide-react";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <li className="flex">
      <div className="flex-shrink-0 mr-4">{icon}</div>
      <div>
        <h4 className="text-lg font-medium mb-1 dark:text-foreground">{title}</h4>
        <p className="text-gray-600 dark:text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 dark:bg-muted py-20 rounded-lg shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <img
              src="https://images.ui8.net/uploads/8_1574528347381.png"
              alt="Product Interface"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="lg:w-1/2 lg:pl-16">
            <h2 className="text-primary font-semibold mb-2 dark:text-primary">Train smarter</h2>
            <h3 className="text-3xl font-bold mb-6 dark:text-foreground">Your fitness journey, simplified</h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-8">
              Transform your workout routine with personalized training that adapts to your goals and progress. Whether you're just starting or advancing your fitness, we've got your path covered.
            </p>
            <ul className="space-y-6">
              <FeatureItem
                icon={<Dumbbell className="size-6 text-primary" />}
                title="Create custom workouts"
                description="Access our extensive exercise library to build personalized routines that target strength, mobility, and balance. Choose from hundreds of proven movements."
              />
              <FeatureItem
                icon={<ClipboardList className="size-6 text-primary" />}
                title="Expert guidance"
                description="Follow coach-designed programs tailored to your skill level and goals. From beginners to athletes, find your perfect training plan."
              />
              <FeatureItem
                icon={<ChartLine className="size-6 text-primary" />}
                title="Track and improve"
                description="Schedule workouts easily and monitor your progress with detailed stats. Watch your achievements stack up as you reach new fitness milestones."
              />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
