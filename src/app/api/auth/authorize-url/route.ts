import { OAuthClient } from "@/lib/auth/oauthclient";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const oAuth2AuthorizeURL = await OAuthClient.shellyAuthorizeURL();
    return NextResponse.json({ url: oAuth2AuthorizeURL });
  } catch (error) {
    console.error("Failed to generate OAuth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate OAuth URL" },
      { status: 500 },
    );
  }
}
