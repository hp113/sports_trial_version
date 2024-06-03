// app/routes/signup.tsx
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
      return json<ActionData>({ error: "Email rate limit exceeded. Please try again later." }, { status: 429 });
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
      alert("Please verify your email by checking your inbox.");
      window.location.href = "/";
    }
  }, [actionData]);

  return (
    <div>
      <h1>Sign Up</h1>
      <Form method="post">
        <div>
          <label>Email: <input type="email" name="email" /></label>
        </div>
        <div>
          <label>Password: <input type="password" name="password" /></label>
        </div>
        <div>
          <label>Name: <input type="text" name="name" /></label>
        </div>
        <div>
          <label>Age: <input type="number" name="age" /></label>
        </div>
        <div>
          <label>Height: <input type="number" name="height" /></label>
        </div>
        <div>
          <label>Weight: <input type="number" name="weight" /></label>
        </div>
        {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
        <button type="submit">Sign Up</button>
      </Form>
    </div>
  );
}
