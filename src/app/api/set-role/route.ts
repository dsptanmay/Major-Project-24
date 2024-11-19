export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { role, userId } = await request.json();
    const client = await clerkClient();

    if (!userId || (role !== "user" && role !== "medical_organization")) {
      return NextResponse.json(
        { success: false, error: "Invalid role or userId." },
        { status: 400 }
      );
    }
    const currentRole = (await client.users.getUser(userId)).publicMetadata
      .role;
    if (!currentRole) {
      client.users.updateUserMetadata(userId, {
        publicMetadata: { role },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "User already has role." },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
