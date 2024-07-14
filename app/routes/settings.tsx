import { useEffect } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData, useNavigation, useResolvedPath, } from "@remix-run/react";
import { testCookie } from "~/cookies";

export async function loader({ request }: LoaderFunctionArgs) {
	const cookieHeader = request.headers.get("cookie");
	const testCookieValue = await testCookie.parse(cookieHeader);
	return json(
		{ message: "Wassup my G!", cookie: testCookieValue },
		{
			status: 200,
			headers: {
				custom: "Obey",
			},
		}
	);
};

export async function action({ request }: ActionFunctionArgs) {
	return new Response(null, {
		headers: {
			"Set-Cookie": await testCookie.serialize("Eat Moar_ coke", { maxAge: 15, })
		}
	})
}

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
			<p>Your cookie from the loader is: {data.cookie}</p>
			<div className="flex gap-4 transition duration-150">
				<Link to="app" className="hover:text-accent">{isLoadingApp ? "Loading ..." : "App"}</Link>
				<Link to="discover" className="hover:text-accent">{isLoadingDiscover ? "Loading ..." : "Discover"}</Link>
				<Form method="post">
					<button
						type="submit"
						className="p-2 text-white bg-accent hover:bg-yellow-400 rounded-md active:scale-95"
					>
						Submit Cookie
					</button>
				</Form>
			</div>
      <Outlet />
		</div>
	)
}
