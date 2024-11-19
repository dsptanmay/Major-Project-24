import { redirect } from "next/navigation";
import React from "react";
import { useActiveWallet } from "thirdweb/react";

function IPFSToNFTLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default IPFSToNFTLayout;
