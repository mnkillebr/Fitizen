import { redirect } from "@remix-run/react";
import { getUserById, getUserByProvider } from "~/models/user.server";
import { getSession } from "~/sessions"
import jwt from "jsonwebtoken";
import { createSupabaseClient } from "./supabase.server";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import { type SupabaseClient } from "@supabase/supabase-js";
import { User } from "@prisma/client";
const { JWT_SECRET } = process.env

if (typeof JWT_SECRET !== "string") {
  throw new Error("Missing env: JWT_SECRET");
}

export async function getCurrentUser(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  const userId = session.get("userId")

  if (typeof userId !== "string") {
    return null
  }
  return getUserById(userId);
}

export async function requireLoggedInUser(request: Request) {
  const user = await getCurrentUser(request);

  if (user === null) {
    throw redirect("/login");
  }

  return user;
}

export async function requireLoggedOutUser(request: Request) {
  const user = await getCurrentUser(request);

  if (user !== null) {
    throw redirect("/app");
  }
}

// generate jwt token
export const generateToken = (user: { id: string; email: string }) => {
  const payload = { id: user.id, email: user.email };
  const secret = JWT_SECRET;
  const options = { expiresIn: '1h' };
  return jwt.sign(payload, secret, options);
};

interface AuthUser {
  id: string;
  email: string;
}

interface SupabaseUser extends AuthUser {
  provider: 'supabase';
  accessToken: string;
  refreshToken: string;
}

interface JWTUser extends AuthUser {
  provider: 'jwt';
  token: string;
}

// JWT verification
const verifyJWT = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as {
      id: string;
      email: string;
    };
    const user = await getUserById(decoded.id)
    return user;
    // return {
    //   provider: 'jwt',
    //   id: decoded.id,
    //   email: decoded.email,
    //   token
    // };
  } catch {
    return null;
  }
};

// Verify Supabase token
const verifySupabaseToken = async (token: string, supabase: SupabaseClient): Promise<User | null> => {
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    if (error || !supabaseUser) return null;
    const user = await getUserByProvider(supabaseUser.email!, supabaseUser.id)
    return user;
    // return {
    //   provider: 'supabase',
    //   id: supabaseUser.id,
    //   email: supabaseUser.email!,
    //   accessToken: token,
    //   refreshToken: '', // You'll need to store this during initial auth
    // };
  } catch {
    return null;
  }
};

// Auth middleware function
export async function requireAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  const fitizenUserId = request.headers.get("fitizen-user-id")

  if (!authHeader) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) {
    throw new Response("Invalid token format", { status: 401 });
  }

  const { supabaseClient } = createSupabaseClient(request)
  // Try Supabase first, then JWT
  const supabaseUser = await verifySupabaseToken(token, supabaseClient);
  if (supabaseUser) return supabaseUser;
  const jwtUser = await verifyJWT(token);
  if (jwtUser) return jwtUser;

  throw new Response("Invalid token", { status: 401 });
}