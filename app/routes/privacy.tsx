import { useRouteError } from "@remix-run/react";

export default function Privacy() {
  return (
    <div className="flex flex-col items-center mt-24 md:mt-20">
      <div className="font-semibold text-2xl">Privacy Page Coming Soon</div>
    </div>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
      <div className="text-red-500 bg-red-200 border border-red-700 rounded p-4">
        <div>Whoops!</div>
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div className="text-red-500">An unexpected error occurred</div>
  );
};
