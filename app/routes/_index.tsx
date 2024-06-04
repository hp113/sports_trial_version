import { Button, Card } from "@nextui-org/react";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import Footer from "~/components/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100  bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/background.jpg')" }}>
      
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
      <h1 className="text-4xl font-bold text-white text-center mb-6 z-10">
        Welcome to Students Sports Competition
      </h1>
      <nav>
        <ul className="flex flex-col space-y-6 mt-4 md:space-x-4 md:space-y-0 md:flex-row items-center">
          <Card className="flex flex-col items-center p-6 w-3/4 sm:w-64 md:w-80 lg:w-96">
            <p className="text-center font-bold mb-4">
              If you are a new user then please click on signup before continuing ahead
              ...
            </p>
            <li className="mt-auto">
              <Link to="/signup">
                <Button className="bg-blue-500 text-white font-bold">Sign Up</Button>
              </Link>
            </li>
          </Card>
          <Card className="flex flex-col items-center p-6 w-3/4 sm:w-64 md:w-80 lg:w-96">
            <p className="text-center font-bold mb-4">
              If you are an existing user then please click on sign in and
              proceed...
            </p>
            <li className="mt-auto">
              <Link to="/signin">
                <Button className="bg-blue-500 text-white font-bold">Sign In</Button>
              </Link>
            </li>
          </Card>
        </ul>
      </nav>
      <Footer/>
    </div>
  );
}
