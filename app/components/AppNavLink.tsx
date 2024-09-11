import { NavLink, useNavigation, useResolvedPath } from "@remix-run/react";
import clsx from "clsx";

type RootNavLinkProps = {
  to: string;
  children: React.ReactNode;
}

export function RootNavLink({ to, children }: RootNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === undefined;


  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-md font-semibold transition duration-200 rounded px-4 py-2 ${
          isActive
            ? "text-primary underline underline-offset-8"
            : "text-gray-900 hover:text-primary /*border border-transparent hover:border-primary*/"
        } ${isLoading ? "animate-pulse bg-yellow-300 text-white hover:text-gray-900" : ""}`
      }
    >
      {children}
    </NavLink>
  )
}

export function AppNavLink({ to, children }: RootNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === undefined;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "rounded-lg flex gap-3 items-center px-3 py-2 text-sm transition duration-100",
        isActive ? "text-primary bg-white shadow-inner" : "text-muted-foreground hover:bg-gray-50 hover:text-primary",
        isLoading ? "animate-pulse bg-gray-50" : ""
      )}
    >
      {children}
    </NavLink>
  )
}

export function MobileNavLink({ to, children }: RootNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === undefined;

  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
        isActive ? "text-foreground bg-muted shadow-inner" : "text-muted-foreground hover:bg-gray-50",
        isLoading ? "animate-pulse bg-gray-50" : ""
      )}
    >
      {children}
    </NavLink>
  )
}
