import { Link } from "@remix-run/react";

export default function Team() {
  return (
    <div>
      <p>Everything to know about our team</p>
      <Link to="/about" className="hover:text-primary">Back</Link>
    </div>
  )
}
