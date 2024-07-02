import { NavLink, Outlet, useMatches } from "@remix-run/react";

const appNav = [
  { to: 'programs', label: 'Programs' }
]

export default function App() {
  const matches = useMatches()
  const currentPage = matches.pop()?.pathname.split("/").pop()
  const pageTitle = currentPage ? currentPage[0].toUpperCase() + currentPage.slice(1) : ""
  return (
    <div className="flex flex-col h-full">
      {/* <h1 className="text-bold mb-4 text-2xl px-2">{pageTitle}</h1> */}
      {true ? null : <nav className="border-b-2 pb-2 mt-2">
        {appNav.map((navItem, idx) => (
          <NavLink
            key={idx}
            to={navItem.to}
            className={({ isActive }) =>
              `text-md font-semibold transition duration-200 rounded px-4 py-2 ${
                isActive
                  ? 'text-accent border-b-2 border-b-accent'
                  : 'text-gray-900 hover:text-accent /*border border-transparent hover:border-accent*/'
              }`
            }
          >
            {navItem.label}
          </NavLink>
        ))}
      </nav>}
      <Outlet />
    </div>
  )
}