// app/routes/dashboard.tsx
import { Button, Card } from "@nextui-org/react";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Outlet, Link } from "@remix-run/react";
import Footer from "~/components/footer";
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
  const signOut = async () => {
    await fetch("/signout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center overflow-hidden">
      <Button
        onClick={signOut}
        className="absolute top-0 right-0 bg-red-500 text-white font-bold mt-2 mr-2 text:xs sm:text-base"
        >
        Sign Out
      </Button>
      <h1 className="mb-3 mt-3 font-bold sm:text-xl md:text-3xl">Dashboard</h1>
      <h2 className="font-bold text-gray-500 mb-3 text-sm sm:text-base">
        Hello {user.name} , here are your details...
      </h2>
      <Card className="w-2/3 px-5 py-4 font-bold text-sm sm:text-base">
        <Card className="p-2 mb-2 bg-gray-400 ">
          <div className="flex justify-between ">
            <p>Name: {user.name}</p>
            <p>Age: {user.age}</p>
          </div>
        </Card>
        <Card className="p-2 bg-gray-400">
          <div className="flex justify-between">
            <p>Height: {user.height}</p>
            <p>Weight: {user.weight}</p>
          </div>
        </Card>
      </Card>
      
      <div className=" mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center ">
        <Link to="events">
          <Button className="bg-blue-500 text-white font-bold mt-auto text-sm sm:text-base">
            Click to participate in event
          </Button>
        </Link>
        <Link to="participation">
          <Button className="bg-blue-500 text-white font-bold mt-auto text-sm sm:text-base">
            Click to view your participation
          </Button>
        </Link>
      </div>
      <Outlet />
      <Footer />
    </div>
  );
}
