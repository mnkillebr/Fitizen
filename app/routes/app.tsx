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
      <Outlet />
    </div>
  )
}