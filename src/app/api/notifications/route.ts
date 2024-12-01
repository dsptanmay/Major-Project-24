export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

import { db } from "@/database/db";
import { notificationsTable, organizationWalletTable } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const orgId = searchParams.get("orgId");
    if (!userId && !orgId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    let notifications;
    if (userId) {
      notifications = await db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.user_address, userId));
      return NextResponse.json(notifications, { status: 200 });
    }
    if (orgId) {
      notifications = await db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.org_address, orgId));
      return NextResponse.json(notifications, { status: 200 });
    }
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
    const { org_address, org_name, nft_token_id, comments } = notificationData;

    if (!org_address || !org_name || !nft_token_id || !comments)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const existingOrg = await db
      .select()
      .from(organizationWalletTable)
      .where(eq(organizationWalletTable.wallet_address, org_address));

    if (existingOrg.length === 0)
      await db
        .insert(organizationWalletTable)
        .values({ organization_name: org_name, wallet_address: org_address });

    const userRecord = await db.query.userNFTsTable.findFirst({
      where: (records, { eq }) => eq(records.token_id, nft_token_id),
      columns: {
        token_id: false,
        description: false,
        title: false,
        user_address: true,
      },
    });
    const user_address = userRecord!.user_address;
    const newNotification = await db
      .insert(notificationsTable)
      .values({
        org_address,
        org_name,
        user_address,
        nft_token_id,
        comments,
        status: "pending",
      })
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
          eq(notificationsTable.org_address, fromId),
          eq(notificationsTable.user_address, toId),
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

interface UpdateNotificationRequest {
  org_address: string;
  user_address: string;
  nft_token_id: string;
  status: "approved" | "denied";
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateNotificationRequest = await request.json();
    if (
      !body.org_address ||
      !body.user_address ||
      !body.nft_token_id ||
      !body.status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (body.status !== "approved" && body.status !== "denied") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedNotification = await db
      .update(notificationsTable)
      .set({ status: body.status })
      .where(
        and(
          eq(notificationsTable.org_address, body.org_address),
          eq(notificationsTable.user_address, body.user_address),
          eq(notificationsTable.nft_token_id, body.nft_token_id)
        )
      )
      .returning();

    if (updatedNotification.length === 0)
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );

    return NextResponse.json(updatedNotification[0], { status: 200 });
  } catch (error) {
    console.error("Error updating notification status", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
