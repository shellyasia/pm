import { NextResponse } from "next/server";
import { optionsFactory, optionsPriority } from "@/lib/db/table_order";
import { config } from "@/lib/config/envs";
import { optionsStatus, optionsTag } from "@/lib/config/const";

export async function GET() {

  return NextResponse.json({

    optionsPriority,
    optionsFactory,
    optionsTag,
    optionsStatus,
    oauthServer: config.OAUTH_SERVER,
    confluenceBaseURL: config.CONFLUENCE_BASE_URL,
  });
}
