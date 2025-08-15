import Link from "next/link";

/**
 * Landing page; directs the user to the planner.
 */
export default function HomePage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Life Planner</h1>
      <p className="mb-4">
        Welcome!  This app lets you set goals, manage your time, and plan your week according to the Passion/Person/Play/Misc framework.
      </p>
      <Link href="/planner" className="px-4 py-2 bg-accent text-white rounded-lg">
        Open Planner
      </Link>
    </div>
  );
}
