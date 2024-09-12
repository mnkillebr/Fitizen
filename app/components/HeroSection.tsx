
import { Link } from "@remix-run/react";
import fit_couple from "images/carl-barcelo-hHzzdVQnkn0-unsplash.jpg";

export default function HeroSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-x-6 lg:gap-x-16 items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-foreground">
              We're changing the way people connect.
            </h1>
            <p className="text-gray-600 dark:text-muted-foreground mb-8">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
              lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
              fugiat aliqua. Anim aute id magna aliqua ad ad non deserunt sunt.
              Qui irure qui lorem cupidatat commodo.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-3 rounded-md text-center font-medium hover:bg-yellow-300 transition duration-200"
              >
                Get started
              </Link>
              <Link
                to="/learn-more"
                className="text-primary px-6 py-3 rounded-md text-center font-medium hover:bg-yellow-50 dark:hover:bg-muted transition duration-200"
              >
                Learn more →
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={fit_couple}
              alt="People connecting"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}