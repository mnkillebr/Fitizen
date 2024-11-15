import { useLocation, useSearchParams, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { Search } from "lucide-react"
import { useEffect, useState } from "react";
import { Label } from "~/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  useSidebar,
} from "~/components/ui/sidebar"

export function SidebarSearchForm({ ...props }: React.ComponentProps<"form">) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();
  const [headerSearch, setHeaderSearch] = useState(searchParams.get("q") ?? "")
  const { open } = useSidebar();
  const location = useLocation();
  const showSearch =
    location.pathname === "/app/workouts" ||
    location.pathname === "/app/exercises" ||
    location.pathname === "/app/programs"

    useEffect(() => {
      if (location.search === '') {
        setHeaderSearch('')
      }
    }, [location.search])
  if (open) {
    return (
      <form {...props}>
        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <SidebarInput
              id="search"
              type="search"
              placeholder={`Search ${showSearch ? location?.pathname.split(`/`).pop() : ""} ...`}
              name="q"
              autoComplete="off"
              value={headerSearch}
              onChange={(e) => {
                !e.target.value && submit({}, { action: location?.pathname })
                setHeaderSearch(e.target.value)
              }}
              className={clsx(
                "w-full appearance-none border bg-background pl-8 shadow-none",
                "dark:bg-background dark:text-muted-foreground dark:focus:text-foreground",
                "dark:border-border-muted dark:focus:border-ring focus-visible:ring-0"
              )}
              disabled={!showSearch}
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
      </form>
    )
  }
}
