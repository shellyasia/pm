import { cookies } from "next/headers";

export async function GET() {
  cookies().set("token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
  });
  return new Response(null, { status: 302, headers: { Location: "/login" } });
}
