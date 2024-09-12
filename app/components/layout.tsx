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
import logo from "images/Sample Fitizen.png?url";
import { useEffect, useState } from "react"
import clsx from "clsx"

export const description =
  "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action."

type DashboardLayoutProps = {
  navLinks: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    label: string;
  }>;
  // children: React.ReactNode;
}
export function DashboardLayout({ navLinks }: DashboardLayoutProps) {
  const [searchParams] = useSearchParams();
  const [headerSearch, setHeaderSearch] = useState(searchParams.get("q") ?? "")
  const location = useLocation();
  const submit = useSubmit();

  const handleLogout = () => {
    return submit("logging out", { action: "/", method: "post" })
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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r border-border dark:border-border-muted bg-muted/40 dark:bg-background-muted md:block">
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
              {/* <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  6
                </Badge>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Package className="h-4 w-4" />
                Products{" "}
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Customers
              </Link>
              <Link
                to="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Analytics
              </Link> */}
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
        <header className="flex h-14 items-center gap-4 border-b border-border dark:border-border-muted bg-muted/40 dark:bg-background-muted px-4 lg:h-[60px] lg:px-6">
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
                {/* <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    6
                  </Badge>
                </Link>
                <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  to="#"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link> */}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {showSearch ? (
              <Form action={location?.pathname}>
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
                      "w-full appearance-none border bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3",
                      "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                      "dark:border-border-muted dark:focus:border-ring"
                    )}
                  />
                </div>
              </Form>
            ) : null}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {/* <CircleUser className="h-5 w-5" /> */}
                <img className="rounded-full drop-shadow-lg" src="https://i.pravatar.cc/50?img=16"/>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:border-border-muted">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
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
            {/* <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no products
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start selling as soon as you add a product.
              </p>
              <Button className="mt-4">Add Product</Button>
            </div> */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
