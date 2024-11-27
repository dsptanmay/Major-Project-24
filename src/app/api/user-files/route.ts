export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

import { db } from "@/database/db";
import { userNFTsTable } from "@/database/schema";
import { NextRequest, NextResponse } from "next/server";

interface UserDataRequest {
  token_id: string;
  user_address: string;
  title: string;
  description: string;
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
