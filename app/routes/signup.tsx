// app/routes/signup.tsx
import { Button, Card, Input } from "@nextui-org/react";
import { ActionFunction, json, redirect } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { useEffect } from "react";
import { getSupabase } from "~/supabaseClient";

interface ActionData {
  error?: string;
  success?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const age = parseInt(formData.get("age") as string);
  const height = parseInt(formData.get("height") as string);
  const weight = parseInt(formData.get("weight") as string);

  const supabase = getSupabase();

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("rate limit")) {
      return json<ActionData>(
        { error: "Email rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    return json<ActionData>({ error: error.message }, { status: 400 });
  }

  // Insert user details into the profiles table
  const { error: dbError } = await supabase.from("profiles").insert([
    {
      user_id: data.user?.id,
      name,
      age,
      height,
      weight: weight,
    },
  ]);

  if (dbError) {
    return json<ActionData>({ error: dbError.message }, { status: 400 });
  }

  return json<ActionData>({ success: true });
};

export default function Signup() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success) {
      alert("Please click on the verification link sent to your mail Id.");
      window.location.href = "/";
    }
  }, [actionData]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-3 mt-3 font-bold ">Sign Up Page</h1>
      <Card className="w-3/5">
        <Form
          method="post"
          className="flex flex-col gap-3 items-center px-3 py-2"
        >
          <div className="w-full ">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email"
            />
          </div>
          <div className="w-full">
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
            />
          </div>
          <div className="w-full">
            <Input
              type="text"
              name="name"
              label="Name"
              placeholder="Enter your name"
            />
          </div>
          <div className="w-full">
            <Input
              type="number"
              name="age"
              label="Age"
              placeholder="Enter your age"
            />
          </div>
          <div className="w-full">
            <Input
              type="number"
              name="height"
              label="Height"
              placeholder="Enter your height"
            />
          </div>
          <div className="w-full">
            <Input
              type="number"
              name="weight"
              label="Weight"
              placeholder="Enter your weight"
            />
          </div>
          {actionData?.error && (
            <p style={{ color: "red" }}>{actionData.error}</p>
          )}
          <Button
            type="submit"
            className="bg-blue-500 text-white font-bold mt-auto"
          >
            Sign Up
          </Button>
        </Form>
      </Card>
    </div>
  );
}
