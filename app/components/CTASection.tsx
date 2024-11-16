import { Link } from "@remix-run/react";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl dark:text-foreground md:text-4xl font-bold mb-4">
          Boost your productivity.
          <br />
          Start using our app today.
        </h2>
        <p className="text-xl text-gray-600 dark:text-muted-foreground mb-8 max-w-2xl mx-auto">
          Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim
          id veniam aliqua proident excepteur commodo do ea.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/login"
            className="bg-primary text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-300 transition duration-200"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="text-primary px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-50 dark:hover:bg-muted transition duration-200"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </section>
  );
}
