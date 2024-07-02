import { Link } from "@remix-run/react";

export default function Discover() {
  return (
    <div>
      <h1>
        Discover Settings
      </h1>
      <p>
        This is the Discover Settings Sub Component
      </p>
      <Link to="/settings" className="hover:text-accent">Back</Link>
    </div>
  )
}
