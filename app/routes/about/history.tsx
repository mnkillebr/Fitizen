import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useRouteError } from "@remix-run/react";

export function loader({ request }: LoaderFunctionArgs) {
 return { message: 'We have are kings and queens!' };
};

export default function History() {
  const historyData = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Everything to know about the rich history at corpo</p>
      <p>{historyData.message}</p>
      <Link to="/about" className="hover:text-primary">Back</Link>
    </div>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
      <div className="text-red-500 bg-red-200 border border-red-700 rounded p-4">
        <div>You know you done f#$ked up right?!</div>
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div className="text-red-500">An unexpected error occurred</div>
  );
};
