// app/routes/signin.tsx
import { ActionFunction, json } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import { useEffect } from "react";
import { getSupabase } from "~/supabaseClient";

interface ActionData {
  error?: string;
  success?: boolean;
  userName?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = getSupabase();

  // Sign in the user
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return json<ActionData>({ error: error.message }, { status: 400 });
  }

  const user = data.user;

  // Fetch the user's profile details
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", user?.id)
    .single();

  if (profileError) {
    return json<ActionData>({ error: profileError.message }, { status: 400 });
  }

  const userName = profiles?.name;

  return json<ActionData>({ success: true, userName });
};

export default function Signin() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success && actionData.userName) {
      alert(`Welcome, ${actionData.userName}!`);
      window.location.href = "/"; // Redirect to a dashboard or home page after sign-in
    }
  }, [actionData]);

  return (
    <div>
      <h1>Sign In</h1>
      <Form method="post">
        <div>
          <label>Email: <input type="email" name="email" required /></label>
        </div>
        <div>
          <label>Password: <input type="password" name="password" required /></label>
        </div>
        {actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>}
        <button type="submit">Sign In</button>
      </Form>
    </div>
  );
}
