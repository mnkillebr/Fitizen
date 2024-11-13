import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useRouteError,
  isRouteErrorResponse,
  json,
  useSubmit,
  useLoaderData,
} from "@remix-run/react";
import "./tailwind.css";
import { useState, } from "react";
import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import globalStyles from "~/tailwind.css?url";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowLeftEndOnRectangleIcon, Bars3Icon, BookOpenIcon, CalendarIcon, FireIcon, TableCellsIcon } from "@heroicons/react/24/solid";
import logo from "images/Sample Fitizen.png?url";
import { AppNavLink, MobileNavLink, RootNavLink } from "./components/AppNavLink";
import { getCurrentUser } from "./utils/auth.server";
import { destroySession, getSession } from "./sessions";
import clsx from "clsx";
import { DialogProvider } from "./components/Dialog";
import { Toaster } from "~/components/ui/sonner"
import { DashboardLayout } from "./components/layout";
import { darkModeCookie } from "./cookies";
import { ChartIcon } from "images/icons";

const navigation = [
  { name: "Settings", href: "settings" },
  { name: "About", href: "about" },
]

const dashNavigation = [
  {
    name: "Programs",
    href: "app/programs",
    icon: <TableCellsIcon />,
    label: "Programs",
  },
  {
    name: "Workouts",
    href: "app/workouts",
    icon: <FireIcon />,
    label: "Workouts"
  },
  {
    name: "Exercise Library",
    href: "app/exercises",
    icon: <BookOpenIcon />,
    label: "Library",
  },
  {
    name: "Calendar",
    href: "app/calendar",
    icon: <CalendarIcon />,
    label: "Calendar",
  },
  {
    name: "Statistics",
    href: "app/stats",
    icon: <ChartIcon className="h-4 w-4"/>,
    label: "Statistics",
  },
]

export const meta: MetaFunction = () => {
  return [
    { title: "Fitizen" },
    { name: "description", content: "Are you a fitizen?" },
  ];
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStyles },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request);
  const cookieHeader = request.headers.get("cookie");
	const darkModeCookieValue = await darkModeCookie.parse(cookieHeader);
  const darkMode = darkModeCookieValue === "true" ? true : false
  return json({ isLoggedIn: user !== null, darkMode, avatar: user?.profilePhotoUrl, initials: `${user?.firstName[0]}${user?.lastName[0]}` })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "logout": {
      const cookieHeader = request.headers.get("cookie")
      const session = await getSession(cookieHeader)
      return json("logging out", {
        headers: {
          "Set-Cookie": await destroySession(session)
        }
      });
    }
    default: {
      return null;
    }
  }
}

const DarkModeScript = ({ darkMode }: { darkMode: boolean }) => {
  const script = `
  ;(() => {
    const darkMode = ${JSON.stringify(darkMode)};
    // we're running in the server
    if (typeof window === 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
      return;
    }
    // we're running in the browser
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })()
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { darkMode } = useLoaderData<typeof loader>();
  return (
    <html lang="en" className={darkMode ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <DarkModeScript darkMode={darkMode} />
      </head>
      <body className="bg-background">
        <DialogProvider>
          {children}
        </DialogProvider>
        <ScrollRestoration />
        <Scripts />
        <Toaster richColors />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>
      </body>
    </html>
  );
}

export default function App() {
  const { avatar, darkMode, initials } = useLoaderData<typeof loader>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const matches = useMatches();
  const inAppRoute = matches.map(m => m.id).includes("routes/app");
  const submit = useSubmit();

  const handleLogout = () => {
    return submit({ "_action": "logout" }, { method: "post" })
  }

  if (inAppRoute) {
    return <DashboardLayout navLinks={dashNavigation} darkModeEnabled={darkMode} avatar={avatar ?? undefined} initials={initials} />
    return (
      <div className="bg-white h-screen overflow-y-hidden">
        <div className="flex flex-col-reverse sm:flex-col md:flex-row h-full">
          <div className="flex shadow-[0_-5px_3px_-3px_rgba(0,0,0,0.1)] sm:shadow-[0_5px_3px_-3px_rgba(0,0,0,0.1)] text-white px-8 py-2 sm:py-4 sm:bg-slate-100 md:bg-slate-100 md:w-48 lg:w-64 md:flex-col md:flex-none md:shadow-[5px_0_3px_-3px_rgba(0,0,0,0.1)] md:px-4 md:py-8">
            <div className="flex md:flex-col md:gap-y-4 items-center justify-center sm:justify-between w-full">
              <div className="hidden md:flex justify-center">
                <img className="rounded-full drop-shadow-lg" src="https://i.pravatar.cc/200?img=16"/>
              </div>
              <img className="hidden sm:max-lg:flex md:hidden rounded-full drop-shadow-lg flex-none" src="https://i.pravatar.cc/50?img=16"/>
              <div className="hidden md:flex md:flex-col self-start pl-3 text-slate-900">
                <h1 className="text-base lg:text-xl font-bold">Welcome back 👋</h1>
                <p className="text-sm lg:text-base">Let's get active 💪</p>
              </div>
              <div className="md:divide-y divide-gray-500/10 md:w-full">
                <div className="hidden sm:flex sm:flex-row md:flex-col flex-none md:my-2 sm:gap-x-2">
                  {dashNavigation.map((item) => (
                    <AppNavLink
                      key={item.name}
                      to={item.href}
                    >
                      {item.name}
                    </AppNavLink>
                  ))}
                </div>
                <div className="flex flex-row justify-around w-screen sm:hidden">
                  {dashNavigation.map((item) => (
                    <MobileNavLink
                      key={item.name}
                      to={item.href}
                    >
                      <div className="size-6">{item.icon}</div>
                      <p>{item.label}</p>
                    </MobileNavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      "min-w-14 p-1 sm:hidden flex-none rounded-lg text-primary",
                      "hover:text-yellow-500 hover:bg-slate-200 flex flex-col text-xs items-center"
                    )}
                  >
                    <div className="size-6"><ArrowLeftEndOnRectangleIcon /></div>
                    <p>Log Out</p>
                  </button>
                </div>
                <div className="hidden md:flex md:py-2 md:mx-1">
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      "hidden sm:block md:w-full rounded-lg px-3 py-2 text-base font-semibold leading-7",
                      "text-gray-900 hover:bg-gray-50 hover:text-primary transition duration-100 text-start"
                    )}
                  >
                    Log Out
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={clsx(
                  "hidden sm:max-md:flex md:hidden sm:block rounded-lg px-3 py-2 text-base font-semibold leading-7",
                  "text-gray-900 hover:bg-gray-50 hover:text-primary transition duration-100"
                )}
              >
                Log Out
              </button>
              {/* <button
                onClick={handleLogout}
                className={clsx(
                  "hidden xs:flex sm:hidden flex-none rounded-lg text-accent",
                  "hover:text-yellow-500 hover:bg-slate-200 p-1 flex-col text-xs items-center"
                )}
              >
                <div className="size-6"><ArrowLeftEndOnRectangleIcon /></div>
                <p>Log Out</p>
              </button> */}
            </div>
          </div>
          <div className="flex-1 /*p-6 md:p-8*/ max-h-[calc(100vh-8.125rem)] sm:max-h-[calc(100vh-5.125rem)] md:max-h-screen"> 
            {/* <Outlet /> */}
          </div>
          <div className="shadow-[0_5px_3px_-3px_rgba(0,0,0,0.1)] px-8 py-2 flex gap-4 sm:hidden">
            <img className="sm:hidden rounded-full drop-shadow-lg flex-none" src="https://i.pravatar.cc/50?img=16"/>
            <div className="flex flex-col self-center">
              <p className="font-bold">Welcome back 👋</p>
              <p className="text-xs">Let's get active 💪</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background dark:bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50 dark:bg-background">
        <nav className="flex items-center justify-between p-6 md:px-8" aria-label="Global">
          <div className="flex md:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Fitizen</span>
              <img
                className="h-12 w-auto rounded-full"
                src={logo}
                alt=""
              />
            </a>
          </div>
          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-muted-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {inAppRoute ? null : (
            <div className="hidden md:flex md:gap-x-4">
              {navigation.map((item) => (
                <RootNavLink key={item.name} to={item.href}>
                  {item.name}
                </RootNavLink>
              ))}
            </div>
          )} 
          <div className="hidden md:flex md:flex-1 md:justify-end">
            {inAppRoute ? (
              <button
                onClick={handleLogout}
                className="text-gray-900 hover:text-primary h-6 w-6"
              >
                <ArrowLeftEndOnRectangleIcon />
              </button>
            ) : (
              <Link to="login" className="text-md font-semibold leading-6 text-gray-900 hover:text-primary dark:text-foreground dark:hover:text-muted-foreground">
                Log In <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        </nav>
        <Dialog className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-background border-l dark:border-l-border-muted px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Fitizen</span>
                <img
                  className="h-12 w-auto rounded-full"
                  src={logo}
                  alt=""
                />
              </a>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6 dark:text-foreground" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-background-muted dark:hover:text-muted-foreground hover:text-primary transition duration-100"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                {inAppRoute ? (
                  <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-background-muted dark:hover:text-muted-foreground hover:text-primary transition duration-100">
                    Log Out
                  </button>
                ) : (
                  <div className="py-6">
                    <a
                      href="login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-background-muted dark:hover:text-muted-foreground hover:text-primary transition duration-100"
                    >
                      Log In
                    </a>
                  </div>
                )}
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
      {/* Main */}
      <div className="relative isolate px-6 md:pt-7 lg:pt-14 lg:px-8">
        {/* Top Background */}
        {/* <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-background to-accent opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div> */}
        {/* Main Content */}
        <div className="mt-8">
          <Outlet />
        </div>
        {/* Bottom Background */}
        {/* <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-background to-accent opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div> */}
      </div>
    </div>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>Whoops!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-4">
          {isRouteErrorResponse(error) ? (
            <>
              <h1 className="text-2xl pb-2">{error.status} - {error.statusText}</h1>
              <p>You are seeing this page because an error occurred.</p>
              <p className="my-2 font-bold">{error.data.message}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl pb-2">Uh oh!</h1>
              <p>You are seeing this page because an unexpected error occurred.</p>
              {error instanceof Error ? <p className="my-2 font-bold">{error.message}</p> : null}
            </>
          )}
          <Link to="app" className="text-primary">Home Page</Link>
        </div>
      </body>
    </html>
  );
}