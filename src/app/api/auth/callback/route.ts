//OAuth2.0 callback route
import { OAuthClient } from "@/lib/auth/oauthclient";
import {config} from "@/lib/config/envs";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  //get path parameter by next.js way
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code") || "";
  const state = searchParams.get("state") || "";
  const jwt = await OAuthClient.shellyOAuth2JWT(code, state);
  //set jwt to cookie
  const adminURL = config.NEXT_PUBLIC_APP_URL + "/admin";
  const response = NextResponse.redirect(new URL(adminURL, request.url));
  response.cookies.set({
    name: "token",
    value: jwt,
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
