import { CircleStackIcon, LockClosedIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";

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
        <h4 className="text-lg font-medium mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </li>
  );
}

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 py-20 rounded-lg shadow-lg">
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
            <h2 className="text-accent font-semibold mb-2">Deploy faster</h2>
            <h3 className="text-3xl font-bold mb-6">A better workflow</h3>
            <p className="text-gray-600 mb-8">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione.
            </p>
            <ul className="space-y-6">
              <FeatureItem
                icon={<CloudArrowUpIcon className="size-6 text-accent" />}
                title="Push to deploy"
                description="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione."
              />
              <FeatureItem
                icon={<LockClosedIcon className="size-6 text-accent" />}
                title="SSL certificates"
                description="Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo."
              />
              <FeatureItem
                icon={<CircleStackIcon className="size-6 text-accent" />}
                title="Database backups"
                description="Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit morbi lobortis."
              />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
