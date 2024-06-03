// app/routes/dashboard.tsx
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/session.server";

interface User {
    name: string;
    age: number;
    height: number;
    weight: number;
  }

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  if (!user) {
    return redirect("/signin");
  }

  return json({ user });
};

export default function Dashboard() {
  const { user } = useLoaderData<{ user: User }>();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Height: {user.height}</p>
      <p>Weight: {user.weight}</p>
    </div>
  );
}
