import { NextRequest, NextResponse } from "next/server";
import { dbHnItemAll } from "@/lib/db/table_hn";
import { dbHnItemUpsert } from "@/lib/db/table_hn";

interface Item {
    id: number;
    title: string;
    url: string;
    text: string; //no usage for store
    time: number;
    type: string;
    score: number;
}

async function fetchItem(id: number) {
    const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { next: { revalidate: 900 } },
    );
    const item: Item = await res.json();
    const result = await dbHnItemUpsert({
        id: item.id,
        title: item.title || "",
        url: item.url || "",
        type: item.type || "",
        score: item.score || 0,
        created_at: new Date(item.time * 1000),
    });
    return result;
}

export const dynamic = "force-dynamic";

async function doSyncItems() {
    const res = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json",
        {
            next: { revalidate: 15 },
        },
    );
    const ids: number[] = await res.json();
    //sort ids by desc

    for (const id of ids) {
        fetchItem(id).then((item) => {
            console.log("Fetched and stored item:", item?.id);
        }).catch((error) => {
            console.error("Error fetching item:", id, error);
        });
    }
    return NextResponse.json(ids);
}
export async function GET(request: NextRequest) {

    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const action = searchParams.get("action") || "";

        if (action === "sync") {
            return await doSyncItems();
        }


        const result = await dbHnItemAll(search, page, limit);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching HN items:", error);
        return NextResponse.json(
            { error: "Failed to fetch items", rows: [], total: 0 },
            { status: 500 }
        );
    }
}
