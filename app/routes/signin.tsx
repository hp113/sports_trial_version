// app/routes/signin.tsx
import { ActionFunction, json, redirect } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { useEffect } from "react";
import { getSupabase } from "~/supabaseClient";
import { getSession, commitSession } from "~/session.server";
import { Button, Card, Input } from "@nextui-org/react";

interface ActionData {
  error?: string;
  success?: boolean;
  userName?: string;
  userProfile?: any;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = getSupabase();

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return json<ActionData>({ error: error.message }, { status: 400 });
  }

  const user = data.user;

  // Fetch the user's profile details
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (profileError) {
    return json<ActionData>({ error: profileError.message }, { status: 400 });
  }

  const userName = profiles?.name;

  // Create a session and store user info
  const session = await getSession(request.headers.get("Cookie"));
  session.set("user", profiles);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Signin() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success && actionData.userName) {
      alert(`Welcome, ${actionData.userName}!`);
    }
  }, [actionData]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-3 mt-3 font-bold text-3xl">Sign In Page</h1>
      <Card className="w-3/5 ">
        <Form method="post" className="flex flex-col gap-3 items-center px-3 py-2 ">
          <div className="w-full">
          <Input
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email"
              required
              
            />
          </div>
          <div className="w-full">
          <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              required
            />
          </div>
          {actionData?.error && (
            <p style={{ color: "red" }}>{actionData.error}</p>
          )}
          <Button
            type="submit"
            className="bg-blue-500 text-white font-bold mt-auto text-base"
          >
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
}
