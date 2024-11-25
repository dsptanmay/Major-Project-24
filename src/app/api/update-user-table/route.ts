import { db } from "@/database/db";
import { userNFTsTable } from "@/database/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, user_address } = body;
    if (!description || !user_address)
      return NextResponse.json(
        {
          success: false,
          error: "You must provide description and user address!",
        },
        { status: 400 }
      );

    const [data] = await db
      .insert(userNFTsTable)
      .values({ description, user_address })
      .returning({ tokenId: userNFTsTable.token_id });

    const tokenId = data.tokenId;
    return NextResponse.json(
      {
        success: true,
        tokenId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to insert record",
      },
      {
        status: 500,
      }
    );
  }
}
