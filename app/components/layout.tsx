import { Form, Link, Outlet, useLocation, useSearchParams, useSubmit } from "@remix-run/react"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { AppNavLink, MobileNavLink } from "./AppNavLink"
import logo from "images/fitizen_logo.svg?url";
import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import clsx from "clsx"
import { Switch } from "./ui/switch"
import { MoonStarIcon } from "images/icons"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type DashboardLayoutProps = {
  avatar?: string;
  initials?: string;
  navLinks: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    label: string;
  }>;
  darkModeEnabled: boolean;
  // children: React.ReactNode;
}

export function DashboardLayout({ avatar, navLinks, darkModeEnabled, initials }: DashboardLayoutProps) {
  const [searchParams] = useSearchParams();
  const [headerSearch, setHeaderSearch] = useState(searchParams.get("q") ?? "")
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation();
  const submit = useSubmit();

  const handleLogout = () => {
    return submit({ "_action": "logout" }, { action: "/", method: "post" })
  }
  const handleToggleDarkMode = (checked: boolean) => {
    if (checked) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
    return submit(
      {
        "_action": "toggleDarkMode",
        darkMode: checked,
      },
      {
        method: "post",
        action: location?.pathname + location?.search,
      }
    )
  }
  const showSearch =
    location.pathname === "/app/workouts" ||
    location.pathname === "/app/exercises" ||
    location.pathname === "/app/programs"

  useEffect(() => {
    if (location.search === '') {
      setHeaderSearch('')
    }
  }, [location.search])

  useEffect(() => {
    if (darkModeEnabled) {
      setDarkMode(true)
      // document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      // document.documentElement.classList.remove('dark')
    }
  }, [])

  const headerTitle = useMemo(() => {
    if (location.pathname === "/app/profile") {
      return "Profile"
    }
    return navLinks.find(navLink => `/${navLink.href}` === location.pathname)?.name
  }, [
    location,
    navLinks,
  ])

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-border dark:border-border-muted bg-muted/80 dark:bg-background-muted md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-border dark:border-border-muted px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold dark:text-foreground">
              <img
                className="size-12 w-auto rounded-full -ml-3"
                src={logo}
                alt=""
              />
              <span className="">Fitizen</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(item => (
                <AppNavLink
                  key={item.name}
                  to={item.href}
                >
                  {({ isActive }) => (
                    <>
                      <div className={clsx("size-4", isActive ? "text-primary" : "")}>{item.icon}</div>
                      {item.name}
                    </>
                  )}
                </AppNavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-border dark:border-border-muted bg-muted/80 dark:bg-background-muted px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild className="dark:text-foreground dark:border-border-muted">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col border-r-border-muted">
              <nav className="grid gap-2 text-lg font-medium">
                {/* <Link
                  to="#"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link> */}
                <Link to="/" className="-ml-4 -mt-4 p-1">
                  <img
                    className="size-12 w-auto rounded-full"
                    src={logo}
                    alt=""
                  />
                  <span className="sr-only">Fitizen</span>
                </Link>
                {navLinks.map(item => (
                  <MobileNavLink
                    key={item.name}
                    to={item.href}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={clsx("size-4", isActive ? "text-primary" : "")}>{item.icon}</div>
                        {item.name}
                      </>
                    )}
                  </MobileNavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold md:text-2xl text-foreground max-w-50">{headerTitle}</h1>
          <div className="w-full flex-1">
            {showSearch ? (
              <Form action={location?.pathname} className="w-full">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-muted-foreground peer-focus:text-foreground" />
                  <Input
                    type="search"
                    // defaultValue={searchParams.get("q") ?? ""}
                    value={headerSearch}
                    placeholder={`Search ${location?.pathname.split(`/`).pop()} ...`}
                    name="q"
                    autoComplete="off"
                    onChange={(e) => {
                      !e.target.value && submit({}, { action: location?.pathname })
                      setHeaderSearch(e.target.value)
                    }}
                    className={clsx(
                      "w-full appearance-none border bg-background pl-8 shadow-none md:w-2/3 lg:w-2/5",
                      "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                      "dark:border-border-muted dark:focus:border-ring"
                    )}
                  />
                </div>
              </Form>
            ) : null}
          </div>
          <div className="flex items-center gap-x-1">
            <Switch id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleToggleDarkMode}
            />
            <label htmlFor="dark-mode"><MoonStarIcon className="h-5 text-muted-foreground" /></label>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {/* <CircleUser className="h-5 w-5" /> */}
                <Avatar
                  className="size-8"
                >
                  <AvatarImage
                    src={avatar} 
                    alt="profile_avatar"
                  />
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:border-border-muted">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/app/profile">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 lg:gap-6">
          {/* <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{pageTitle}</h1>
          </div> */}
          <div
            className="flex-1 items-center justify-center rounded-lg shadow-sm"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
