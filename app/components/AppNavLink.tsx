import { NavLink, useNavigation, useResolvedPath } from "@remix-run/react";
import clsx from "clsx";

type NavLinkRenderProps = {
  isActive: boolean;
  isPending: boolean;
};

type ClassNameProp = 
  | string 
  | ((props: NavLinkRenderProps) => string)
  | undefined;

type ChildrenProp = 
  | React.ReactNode
  | ((props: NavLinkRenderProps) => React.ReactNode);

type TypeSafeNavLinkProps = {
  to: string;
  children: ChildrenProp;
  className?: ClassNameProp;
};

const TypeSafeNavLink = ({ 
  to, 
  children,
  className,
}: TypeSafeNavLinkProps) => {
  return (
    <NavLink 
      to={to} 
      className={className}
    >
      {typeof children === "function"
        ? (props: NavLinkRenderProps) => children(props)
        : children
      }
    </NavLink>
  );
};

type RootNavLinkProps = {
  to: string;
  children: ChildrenProp;
  className?: ClassNameProp;
}

export function RootNavLink({ to, children }: TypeSafeNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === undefined;


  return (
    <TypeSafeNavLink
      to={to}
      className={({ isActive }) =>
        `text-md font-semibold transition duration-200 rounded px-4 py-2 ${
          isActive
            ? "text-primary underline underline-offset-8"
            : "text-gray-900 dark:text-foreground hover:text-primary dark:hover:text-muted-foreground"
        } ${isLoading ? "animate-pulse bg-yellow-300 text-white hover:text-gray-900" : ""}`
      }
    >
      {children}
    </TypeSafeNavLink>
  )
}

export function AppNavLink({ to, children }: TypeSafeNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    navigation.formData === undefined;

  return (
    <TypeSafeNavLink
      to={to}
      className={({ isActive }) => clsx(
        "rounded-lg flex gap-3 items-center px-3 py-2 text-sm transition duration-100",
        isActive ? "text-primary dark:text-foreground bg-white dark:bg-background shadow-inner" : "text-muted-foreground dark:text-muted-foreground hover:text-primary-foreground dark:hover:text-foreground dark:hover:bg-background",
        isLoading ? "animate-pulse duration-500" : ""
      )}
    >
      {children}
    </TypeSafeNavLink>
  )
}

export function MobileNavLink({ to, children }: TypeSafeNavLinkProps) {
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
        isActive ? "text-foreground bg-muted shadow-inner" : "text-muted-foreground",
        isLoading ? "animate-pulse duration-500" : ""
      )}
    >
      {children}
    </NavLink>
  )
}
