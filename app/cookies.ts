import { createCookie } from "@remix-run/node";
const { AUTH_COOKIE_SECRET } = process.env;

if (typeof AUTH_COOKIE_SECRET !== "string") {
  throw new Error("Missing env: AUTH_COOKIE_SECRET")
}

export const sessionCookie = createCookie("fitizen__session", {
  secrets: [AUTH_COOKIE_SECRET],
  httpOnly: true,
  secure: true,
});

export const testCookie = createCookie("fitizen__testCookie", {
  httpOnly: true,
  secure: true,
});

export const darkModeCookie = createCookie("fitizen__darkModeCookie");