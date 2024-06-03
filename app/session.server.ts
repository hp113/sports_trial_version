// app/session.server.ts
import { createCookieSessionStorage } from "@remix-run/node";
import dotenv from "dotenv";

dotenv.config();

const sessionSecret = process.env.SESSION_SECRET || ""; // Assign an empty string if SESSION_SECRET is undefined

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: [sessionSecret], // Use the sessionSecret variable
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});

export { getSession, commitSession, destroySession };
