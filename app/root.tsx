import {
  Links,
  Link,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import { useEffect, useState, } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
// import globalStyles from "~/tailwind.css?url";
import { Dialog, DialogPanel } from "@headlessui/react";
import { ArrowLeftEndOnRectangleIcon, Bars3Icon, BookOpenIcon, CalendarIcon, TableCellsIcon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "images/Sample Fitizen.png?url";
import { AppNavLink, MobileNavLink, RootNavLink } from "./components/AppNavLink";

const navigation = [
  { name: 'Settings', href: 'settings' },
  { name: 'About', href: 'about' },
  // { name: 'Marketplace', href: '#' },
  // { name: 'Company', href: '#' },
]

const dashNavigation = [
  {
    name: 'Programs',
    href: 'app/programs',
    icon: <TableCellsIcon />,
    label: 'Programs',
  },
  {
    name: 'Schedule',
    href: 'app/schedule',
    icon: <CalendarIcon />,
    label: 'Schedule',
  },
  {
    name: 'Exercise Library',
    href: 'app/library',
    icon: <BookOpenIcon />,
    label: 'Library',
  },
]

interface Exercise {
  name: string;
  image: string;
}

interface WorkoutItem {
  title: string;
  isPro: boolean;
  image: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Fitizen" },
    { name: "description", content: "Are you a fitizen?" },
  ];
};

// export const links: LinksFunction = () => {
//   return [
//     { rel: "stylesheet", href: globalStyles, }
//   ];
// };

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css"/>
      </body>
    </html>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const matches = useMatches()
  const inAppRoute = matches.map(m => m.id).includes('routes/app')

  const bodyParts: Exercise[] = [
    { name: 'Leg', image: '/images/leg.jpg' },
    { name: 'Shoulders', image: '/images/shoulders.jpg' },
    { name: 'Biceps', image: '/images/biceps.jpg' },
    { name: 'Abs', image: '/images/abs.jpg' },
  ];

  const equipmentExercises: Exercise[] = [
    { name: 'Dumbbells', image: '/images/dumbbells.jpg' },
    { name: 'Jump Rope', image: '/images/jump-rope.jpg' },
    { name: 'Kettlebell', image: '/images/kettlebell.jpg' },
  ];

  const workouts: WorkoutItem[] = [
    { title: 'Core Workout', isPro: true, image: '/images/core-workout.jpg' },
    { title: 'Full Body Workout', isPro: false, image: '/images/full-body-workout.jpg' },
  ];

  // useEffect(() => {
  //   console.log(matches)
  // })
  // return (
  //   <>
  //     {/* <div className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white supports-backdrop-blur:bg-white/95 dark:bg-slate-900/75">
  //     </div> */}
  //     <nav className="px-2 bg-background text-secondary">
  //       <ul className="flex flex-row gap-2">
  //         <li>
  //           <Link to="/">Home</Link>
  //         </li>
  //         <li>
  //           <Link to="settings">Settings</Link>
  //         </li>
  //         <li>
  //           <Link to="about">About</Link>
  //         </li>
  //       </ul>
  //     </nav>
  //     <Outlet />
  //   </>
  // );

  // return (
  //   <div className="bg-gray-100 min-h-screen">
  //     <div className="max-w-md mx-auto px-4 py-8 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
  //       <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
  //         <div className="max-w-md mx-auto px-4 py-4 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
  //           <div className="flex items-center justify-between">
  //             <div className="flex items-center">
  //               <div className="w-10 h-10 rounded-full mr-3 bg-slate-500" />
  //               <div>
  //                 <h1 className="text-xl font-semibold">Hey, Jacob 👋</h1>
  //                 <p className="text-sm text-gray-600">Stay Healthy always.</p>
  //               </div>
  //             </div>
  //             <button className="text-gray-600">
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  //               </svg>
  //             </button>
  //           </div>
  //         </div>
  //       </header>

  //       <div className="max-h-[calc(100vh-9rem)] overflow-y-auto mt-16">
  //         <div className="mb-6">
  //           <input
  //             type="text"
  //             placeholder="Search"
  //             className="w-full px-4 py-2 rounded-lg bg-white shadow-sm"
  //           />
  //         </div>

  //         <section className="mb-8">
  //           <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
  //             Body parts Exercise
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
  //               <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  //             </svg>
  //           </h2>
  //           <div className="flex overflow-x-auto pb-4 space-x-4">
  //             {bodyParts.map((exercise, index) => (
  //               <div key={index} className="flex-none text-center w-20">
  //                 <div className="w-full h-24 object-cover rounded-full mb-2 bg-slate-500" />
  //                 <p className="text-sm">{exercise.name}</p>
  //               </div>
  //             ))}
  //           </div>
  //         </section>

  //         <section className="mb-8">
  //           <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
  //             Equipment-Based Exercise
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
  //               <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  //             </svg>
  //           </h2>
  //           <div className="flex overflow-x-auto pb-4 space-x-4">
  //             {equipmentExercises.map((exercise, index) => (
  //               <div key={index} className="flex-none text-center w-32">
  //                 <div className="w-full h-32 object-cover rounded-lg mb-2 bg-slate-500" />
  //                 <p className="text-sm">{exercise.name}</p>
  //               </div>
  //             ))}
  //           </div>
  //         </section>

  //         <section>
  //           <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
  //             Workouts
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
  //               <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  //             </svg>
  //           </h2>
  //           <div className="flex overflow-x-auto pb-4 space-x-4">
  //             {workouts.map((workout, index) => (
  //               <div key={index} className="flex-none w-64 relative rounded-lg overflow-hidden">
  //                 <div className="w-full h-48 object-cover bg-slate-500" />
  //                 <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
  //                   {workout.isPro ? 'Pro' : 'Free'}
  //                 </div>
  //                 <div className="absolute bottom-2 right-2 bg-white rounded-full p-2">
  //                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  //                   </svg>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </section>
  //       </div>

  //       <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
  //         <div className="flex justify-around items-center py-2">
  //           <button className="text-orange-500 flex flex-col items-center">
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  //             </svg>
  //             <span className="text-xs">Home</span>
  //           </button>
  //           <button className="text-gray-600 flex flex-col items-center">
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  //             </svg>
  //             <span className="text-xs">Diet Plan</span>
  //           </button>
  //           <button className="text-gray-600 flex flex-col items-center">
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  //             </svg>
  //             <span className="text-xs">Store</span>
  //           </button>
  //           <button className="text-gray-600 flex flex-col items-center">
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  //             </svg>
  //             <span className="text-xs">Report</span>
  //           </button>
  //           <button className="text-gray-600 flex flex-col items-center">
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  //             </svg>
  //             <span className="text-xs">Profile</span>
  //           </button>
  //         </div>
  //       </nav>
  //     </div>
  //   </div>
  // )

  if (inAppRoute) {
    return (
      <div className="bg-white h-screen">
        <div className="flex flex-col-reverse xs:flex-col md:flex-row h-full">
          <div className="flex bg-slate-300 text-white px-8 py-2 sm:py-4 md:bg-slate-100 md:w-80 md:flex-col md:flex-none md:shadow-lg md:px-4 md:py-8">
            <div className="flex md:flex-col md:gap-y-4 items-center justify-center xs:justify-between w-full">
              <div className="hidden md:flex justify-center">
                <img className="rounded-full drop-shadow-lg" src="https://i.pravatar.cc/200?img=16"/>
              </div>
              <img className="hidden xs:max-lg:flex md:hidden rounded-full drop-shadow-lg flex-none" src="https://i.pravatar.cc/50?img=16"/>
              <div className="hidden md:flex md:flex-col self-start pl-4 text-slate-900">
                <h1 className="text-xl font-bold">Welcome back, homie 👋</h1>
                <p>Let's get active 💪</p>
              </div>
              <div className="md:divide-y divide-gray-500/10 md:w-full">
                <div className="hidden sm:flex sm:flex-row md:flex-col flex-none md:my-2">
                  {dashNavigation.map((item) => (
                    <AppNavLink
                      key={item.name}
                      to={item.href}
                    >
                      {item.name}
                    </AppNavLink>
                  ))}
                </div>
                <div className="flex flex-row gap-x-4 sm:hidden">
                  {dashNavigation.map((item) => (
                    <MobileNavLink
                      key={item.name}
                      to={item.href}
                    >
                      <div className="size-6">{item.icon}</div>
                      <p>{item.label}</p>
                    </MobileNavLink>
                  ))}
                  <Link to="/" className="min-w-14 p-1 xs:hidden flex-none text-gray-900 hover:text-accent flex flex-col text-xs items-center">
                    <div className="size-6"><ArrowLeftEndOnRectangleIcon /></div>
                    <p>Log Out</p>
                  </Link>
                </div>
                <div className="hidden md:flex md:py-2 md:mx-1">
                  <Link to="/" className="hidden sm:block md:w-full rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100">
                    Log Out
                  </Link>
                </div>
              </div>
              <Link to="/" className="hidden sm:max-md:flex md:hidden sm:block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100">
                Log Out
              </Link>
              <Link to="/" className="hidden xs:flex sm:hidden flex-none text-gray-900 hover:text-accent flex-col text-xs items-center">
                <div className="size-6"><ArrowLeftEndOnRectangleIcon /></div>
                <p>Log Out</p>
              </Link>
            </div>
          </div>
          <div className="flex-1 px-6 pt-6 pb-2 md:p-8 max-h-[calc(100vh-8.1875rem)] md:max-h-screen"> 
            <Outlet />
          </div>
          <div className="border-b px-8 py-2 flex gap-4 xs:hidden">
            <img className="xs:hidden rounded-full drop-shadow-lg flex-none" src="https://i.pravatar.cc/50?img=16"/>
            <div className="flex flex-col self-center">
              <p className="font-bold">Welcome back, homie 👋</p>
              <p className="text-xs">Let's get active 💪</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 md:px-8" aria-label="Global">
          <div className="flex md:flex-1">
            <a href="/?query=home&save=people" className="-m-1.5 p-1.5">
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
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
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
              <Link to="/" className="text-gray-900 hover:text-accent h-6 w-6">
                <ArrowLeftEndOnRectangleIcon />
              </Link>
            ) : (
              <Link to="signin" className="text-md font-semibold leading-6 text-gray-900 hover:text-accent">
                Sign In <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        </nav>
        <Dialog className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                {inAppRoute ? (
                  <Link to="/" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100">
                    Log Out
                  </Link>
                ) : (
                  <div className="py-6">
                    <a
                      href="signin"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100"
                    >
                      Sign In
                    </a>
                  </div>
                )}
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
      {/* Main */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Top Background */}
        <div
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
        </div>
        {/* Main Content */}
        <div className="mt-8">
          <Outlet />
        </div>
        {/* Bottom Background */}
        <div
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
        </div>
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
          <h1 className="text-2xl pb-2">Uh oh!</h1>
          <p>You are seeing this page because an unexpected error occurred.</p>
          {error instanceof Error ? <p>{error.message}</p> : null}
          <Link to="app" className="text-primary">Home Page</Link>
        </div>
      </body>
    </html>
  );
}