import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";

export function loader({ request }: LoaderFunctionArgs) {
  return json(
    {
      items: [
        'item 1',
        'item 2',
        'item 3',
        'item 4',
      ]
    },
    {
      status: 200,
      headers: {
        custom: 'gotcha',
      },
    }
  );
};

export default function About() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>About Page</h1>
      <p>Here we share our deepest darkest secrets</p>
      <ul>
        {data.items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <div className="flex gap-4 transition duration-150">
        <Link to="team" className="hover:text-accent">Team</Link>
        <Link to="history" className="hover:text-accent">History</Link>
      </div>
      <Outlet />
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
    <div className="text-red-500">An unexpected error occured</div>
  );
};
