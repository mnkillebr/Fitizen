import { NavLink, useNavigation, useResolvedPath } from "@remix-run/react";

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
            ? "text-accent underline underline-offset-8"
            : "text-gray-900 hover:text-accent /*border border-transparent hover:border-accent*/"
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
      className={({ isActive }) =>
        `rounded-lg block px-3 py-2 text-base font-semibold leading-7 transition duration-100 ${
          isActive
            ? "text-accent bg-white shadow-inner"
            : "text-gray-900 hover:bg-gray-50 hover:text-accent"
        } ${isLoading ? "animate-pulse bg-gray-50" : ""}`
      }
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
      className={({ isActive }) =>
        `min-w-14 p-1 rounded-lg transition duration-100 flex flex-col text-xs items-center ${
          isActive
            ? "bg-accent text-white shadow-inner"
            : "text-accent hover:text-yellow-500 hover:bg-slate-200"
        } ${isLoading ? "animate-pulse bg-gray-50" : ""}`
      }
    >
      {children}
    </NavLink>
  )
}
