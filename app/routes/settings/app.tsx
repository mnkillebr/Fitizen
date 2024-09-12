import { Link } from "@remix-run/react";

export default function App() {
	return (
		<div>
			<h1>
				App Settings
			</h1>
			<p>
				This is the App Settings Sub Component
			</p>
			<Link to="/settings" className="hover:text-primary">Back</Link>
		</div>
	)
}
