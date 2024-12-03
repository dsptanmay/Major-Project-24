import { db } from "@/database/db";
import { tokenEncryptions } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const body: { token_id: string; encryption_key: string } =
      await request.json();
    const { token_id, encryption_key } = body;

    if (!token_id || !encryption_key)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const record = await db
      .insert(tokenEncryptions)
      .values({ token_id, encryption_key })
      .returning();

    if (record.length === 0)
      return NextResponse.json(
        { error: "Failed to insert record" },
        { status: 401 }
      );

    return NextResponse.json(record[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenId = searchParams.get("tokenId");
    if (!tokenId)
      return NextResponse.json({ error: "Missing token ID" }, { status: 400 });

    const data = await db.query.tokenEncryptions.findFirst({
      where: (record, { eq }) => eq(record.token_id, tokenId),
      columns: {
        token_id: false,
        encryption_key: true,
      },
    });

    if (!data)
      return NextResponse.json(
        { error: "Token ID not found" },
        { status: 404 }
      );
    else return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
