import { useEffect } from "react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData, useNavigation, useResolvedPath, } from "@remix-run/react";

export function loader({ request }: LoaderFunctionArgs) {
	return json(
		{ message: "Wassup my G!"},
		{
			status: 200,
			headers: {
				custom: "Obey",
			},
		}
	);
};

export default function Settings() {
	const data = useLoaderData<typeof loader>();
	const navigation = useNavigation()

	const isLoadingDiscover =
		navigation.state === "loading" &&
		navigation.location.pathname === "/settings/discover";
	const isLoadingApp =
		navigation.state === "loading" &&
		navigation.location.pathname === "/settings/app";

	return (
		<div>
			<h1>
				Settings
			</h1>
			<p>
				This is the Settings Page
			</p>
			<p>The Message from the loader is: {data.message}</p>
			<div className="flex gap-4 transition duration-150">
				<Link to="app" className="hover:text-accent">{isLoadingApp ? "Loading ..." : "App"}</Link>
				<Link to="discover" className="hover:text-accent">{isLoadingDiscover ? "Loading ..." : "Discover"}</Link>
			</div>
      <Outlet />
		</div>
	)
}
