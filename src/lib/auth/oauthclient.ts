import { config } from "../config/envs";
import {
  oauthStateCreate,
  oauthStateExist,
  oauthStateRemove,
} from "../db/table_ouath_state";
import { userFirstOrCreate } from "../db/table_user";
import { generateToken } from "./jwt";

export class OAuthClient {
  static async shellyAuthorizeURL(): Promise<string> {
    const state = await oauthStateCreate();
    return `https://${config.OAUTH_SERVER}/oauth/authorize?client_id=${config.OAUTH_CLIENT_ID}&redirect_uri=${
      encodeURIComponent(
        `${config.NEXT_PUBLIC_APP_URL}${config.OAUTH_REDIRECT_URI}`,
      )
    }&response_type=code&state=${state}`;
  }

  static async shellyOAuth2JWT(code: string, state?: string): Promise<string> {
    if (!code) {
      throw new Error("Missing code");
    }
    if (state && !await oauthStateExist(state)) {
      throw new Error("Invalid state");
    }
    const response = await fetch(
      `https://${config.OAUTH_SERVER}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          client_id: config.OAUTH_CLIENT_ID,
          client_secret: config.OAUTH_CLIENT_SECRET,
          code,
          redirect_uri:
            `${config.NEXT_PUBLIC_APP_URL}${config.OAUTH_REDIRECT_URI}`,
          grant_type: "authorization_code",
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch access token: " + await response.text());
    }
    const tokenData = await response.json();

    await oauthStateRemove(state || "");

    if (!tokenData.access_token) {
      throw new Error("No access token in response");
    }
    console.debug("Access Token:", tokenData.access_token);

    const userResponse = await fetch(
      `https://${config.OAUTH_SERVER}/oauth/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );
    if (!userResponse.ok) {
      throw new Error(
        "Failed to fetch user info: " + await userResponse.text(),
      );
    }
    const { email } = await userResponse.json();
    if (!email) {
      throw new Error("Email not found in user info");
    }
    const user = await userFirstOrCreate(email);
    if (!user) {
      throw new Error("User not found or cannot be created");
    }
    const token = generateToken({
      id: user.email,
      email: user.email,
      company: user.company,
      role: user.role,
    });
    return token;
  }
}
