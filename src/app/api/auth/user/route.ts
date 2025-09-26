import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const jwt = cookies().get("token")?.value || "";
  if (!jwt) {
    return new Response(null, { status: 302, headers: { Location: "/login" } });
  }

  try {
    const user = verifyToken(jwt);
    return NextResponse.json(user);
  } catch {
    // Clear the invalid token cookie and return 401 Unauthorized
    cookies().delete("token");
    const response = NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
    return response;
  }
}
