export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

import { db } from "@/database/db";
import { userNFTsTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface UserDataRequest {
  token_id: string;
  user_address: string;
  title: string;
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_address = searchParams.get("userAddress");

    if (!user_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(userNFTsTable)
      .where(eq(userNFTsTable.user_address, user_address));

    if (data.length === 0) {
      return NextResponse.json(
        { error: "User does not own any NFTs" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData: UserDataRequest = await request.json();
    const { token_id, user_address, title, description } = userData;

    if (!token_id || !user_address || !title || !description)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const newRecord = await db
      .insert(userNFTsTable)
      .values({ token_id, user_address, title, description })
      .returning();

    if (newRecord.length === 0)
      return NextResponse.json(
        { error: "Failed to insert data" },
        { status: 400 }
      );

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error("Error in updating user data", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
