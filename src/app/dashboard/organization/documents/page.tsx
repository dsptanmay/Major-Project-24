"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Empty } from "antd";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client, wallets } from "@/app/client";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrgData {
  token_id: string;
  title: string;
  description: string;
}

export default function OrganizationFilesDashboard() {
  const activeAccount = useActiveAccount();
  const [orgFiles, setOrgFiles] = useState<OrgData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const response = await fetch(
          `/api/org-files?orgId=${activeAccount!.address}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data: OrgData[] = await response.json();
        console.log(data);
        setOrgFiles(data);
      } catch (error) {
        console.error("Failed to fetch organization files:", error);
      }
    };
    if (activeAccount) fetchUserFiles();
  }, [activeAccount]);

  const handleViewFile = (tokenId: any) => {
    router.push(`/dashboard/organization/view/${tokenId}`);
  };

  return (
    <div className="w-full container bg-gradient-to-br from-orange-300 via-blue-200 to-purple-300 min-h-screen max-w-screen-2xl p-10 flex flex-col space-y-5">
      <header className="flex p-5 bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-600 w-6 h-6" />
          <h1 className="font-semibold text-xl">Granted Tokens</h1>
        </div>
        <ConnectButton
          client={client}
          wallets={wallets}
          connectButton={{ label: "Connect Wallet" }}
        />
      </header>

      <div className="bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all p-5 flex flex-col space-y-5">
        <div className="font-semibold text-xl drop-shadow-sm">
          NFTs granted to {activeAccount?.address.substring(0, 10)}...
        </div>
        {!activeAccount && (
          <div className="bg-red-300 text-red-700 rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 text-center border-2 w-full border-red-600">
            Connect your Wallet first!
          </div>
        )}

        {activeAccount && orgFiles.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgFiles.map((file) => (
              <Card
                key={file.token_id}
                actions={[
                  <Button
                    type="link"
                    onClick={() => handleViewFile(file.token_id)}
                  >
                    View
                  </Button>,
                ]}
              >
                <Card.Meta title={file.title} description={file.description} />
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="No files uploaded yet" />
        )}
      </div>
    </div>
  );
}
