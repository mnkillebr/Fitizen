import { useState } from "react"
import { Link } from "@remix-run/react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "images/Sample Fitizen.png";

const navigation = [
  { name: 'Settings', href: 'settings' },
  { name: 'About', href: 'about' },
  // { name: 'Marketplace', href: '#' },
  // { name: 'Company', href: '#' },
]

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Remix</h1>
      <ul className="list-disc mt-4 pl-6 space-y-2">
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/quickstart"
            rel="noreferrer"
          >
            5m Quick Start
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/start/tutorial"
            rel="noreferrer"
          >
            30m Tutorial
          </a>
        </li>
        <li>
          <a
            className="text-blue-700 underline visited:text-purple-900"
            target="_blank"
            href="https://remix.run/docs"
            rel="noreferrer"
          >
            Remix Docs
          </a>
        </li>
        <li>
          <Link
            className="text-blue-700 underline visited:text-purple-900"
            // target="_blank"
            to="app"
            rel="noreferrer"
          >
            Go to App
          </Link>
        </li>
        <li>
          <form>
            <input
              type="text"
              name="query"
              placeholder="query"
            />
            <input
              type="text"
              name="save"
              placeholder="save"
            />
            <button>submit</button>
          </form>
        </li>
      </ul>
    </div>
  );
  // return (
  //   <>
  //     {/* Header */}
  //     <header className="absolute inset-x-0 top-0 z-50">
  //       <nav className="flex items-center justify-between p-6 md:px-8" aria-label="Global">
  //         <div className="flex md:flex-1">
  //           <a href="/" className="-m-1.5 p-1.5">
  //             <span className="sr-only">Fitizen</span>
  //             <img
  //               className="h-12 w-auto rounded-full"
  //               src={logo}
  //               alt=""
  //             />
  //           </a>
  //         </div>
  //         <div className="flex md:hidden">
  //           <button
  //             type="button"
  //             className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
  //             onClick={() => setMobileMenuOpen(true)}
  //           >
  //             <span className="sr-only">Open main menu</span>
  //             <Bars3Icon className="h-6 w-6" aria-hidden="true" />
  //           </button>
  //         </div>
  //         <div className="hidden md:flex md:gap-x-4">
  //           {navigation.map((item) => (
  //             <AppNavLink key={item.name} to={item.href}>
  //               {item.name}
  //             </AppNavLink>
  //           ))}
  //         </div>
  //         <div className="hidden md:flex md:flex-1 md:justify-end">
  //           <Link to="signin" className="text-md font-semibold leading-6 text-gray-900 hover:text-accent">
  //             Sign In <span aria-hidden="true">&rarr;</span>
  //           </Link>
  //         </div>
  //       </nav>
  //       <Dialog className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
  //         <div className="fixed inset-0 z-50" />
  //         <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
  //           <div className="flex items-center justify-between">
  //             <a href="/" className="-m-1.5 p-1.5">
  //               <span className="sr-only">Fitizen</span>
  //               <img
  //                 className="h-12 w-auto rounded-full"
  //                 src={logo}
  //                 alt=""
  //               />
  //             </a>
  //             <button
  //               type="button"
  //               className="-m-2.5 rounded-md p-2.5 text-gray-700"
  //               onClick={() => setMobileMenuOpen(false)}
  //             >
  //               <span className="sr-only">Close menu</span>
  //               <XMarkIcon className="h-6 w-6" aria-hidden="true" />
  //             </button>
  //           </div>
  //           <div className="mt-6 flow-root">
  //             <div className="-my-6 divide-y divide-gray-500/10">
  //               <div className="space-y-2 py-6">
  //                 {navigation.map((item) => (
  //                   <Link
  //                     key={item.name}
  //                     to={item.href}
  //                     className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100"
  //                   >
  //                     {item.name}
  //                   </Link>
  //                 ))}
  //               </div>
  //               <div className="py-6">
  //                 <a
  //                   href="signin"
  //                   className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-accent transition duration-100"
  //                 >
  //                   Sign In
  //                 </a>
  //               </div>
  //             </div>
  //           </div>
  //         </DialogPanel>
  //       </Dialog>
  //     </header>
  //   </>
  // )
}
