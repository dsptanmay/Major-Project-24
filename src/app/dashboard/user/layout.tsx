import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const currentRole = user?.publicMetadata.role;
  if (currentRole !== "user" || !user) redirect("/");
  return <div>{children}</div>;
}

export default UserDashboardLayout;
