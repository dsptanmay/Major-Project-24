export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

import { db } from "@/database/db";
import { notificationsTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const userNotifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.to_id, userId));
    return NextResponse.json(userNotifications, { status: 200 });
  } catch (error) {
    console.error("Error in fetching notifications", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const notificationData = await request.json();
    const { from_id, to_id, nft_token_id, comments } = notificationData;

    if (!from_id || !to_id || !nft_token_id || !comments)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const newNotification = await db
      .insert(notificationsTable)
      .values({ from_id, to_id, nft_token_id, comments, status: "pending" })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);

    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromId = searchParams.get("from_id");
    const toId = searchParams.get("to_id");
    const tokenId = searchParams.get("token_id");

    if (!fromId || !toId || !tokenId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const deletedNotification = await db
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.from_id, fromId),
          eq(notificationsTable.to_id, toId),
          eq(notificationsTable.nft_token_id, tokenId)
        )
      )
      .returning();

    if (deletedNotification.length === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);

    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
