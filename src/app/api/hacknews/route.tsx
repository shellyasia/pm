import { dbHnItemUpsert } from "@/lib/db/table_hn";
import { NextResponse } from "next/server";

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
  const item:Item =  await res.json();
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

export async function GET() {
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
