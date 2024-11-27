"use client";
import { client, wallets } from "@/app/client";
import { ScanSearch } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

function ViewIPFSDocumentPage({ params }: any) {
  const activeAccount = useActiveAccount();
  const [ipfsHash, setIpfsHash] = useState("");
  const [ipfsURL, setIpfsURL] = useState("");
  const [error, setError] = useState("");
  const tokenId = params.token_id! as string;

  useEffect(() => {
    async function getIpfsHash() {
      const response = await fetch(
        `/api/ipfs?userAddress=${activeAccount!.address}&tokenId=${tokenId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const data: string = await response.json();
      if (response.ok) {
        setIpfsHash(data.substring(7));
        setIpfsURL(
          `https://${
            process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
          }.ipfscdn.io/ipfs/${data.substring(7)}`
        );
        toast.success("Fetched IPFS Hash successfully!");
      } else {
        setError("You are not authorized to view this document!");
        return;
      }
    }
    if (activeAccount) getIpfsHash();
    const handleContextmenu = (e: any) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, [activeAccount, tokenId]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-blue-300 to-purple-400 p-6">
      <div className="max-w-5xl mx-auto flex flex-col space-y-5">
        <header className="bg-white rounded-lg flex justify-between p-5 items-center">
          <div className="flex items-center space-x-2">
            <ScanSearch className="h-6 w-6 text-indigo-700 items-end" />
            <h1 className="font-bold text-3xl text-gray-900">View Documents</h1>
          </div>
          <ConnectButton
            client={client}
            wallets={wallets}
            theme={darkTheme({
              colors: {
                primaryButtonBg: "hsl(142, 70%, 45%)",
                primaryButtonText: "hsl(0, 0%, 100%)",
              },
            })}
            connectButton={{ label: "Connect Wallet" }}
            connectModal={{
              size: "compact",
              title: "Connect Wallet",
              showThirdwebBranding: false,
            }}
          />
        </header>
        <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all flex flex-col space-y-5 h-3/5">
          {ipfsHash && (
            <div className="overflow-hidden">
              <iframe
                className="w-full h-full"
                src={ipfsURL}
                style={{ border: "none" }}
                title={`Document ${tokenId}`}
              />
            </div>
          )}
          {error && (
            <div className="bg-red-200 text-red-600 border-2 border-red-600 text-center font-semibold text-lg rounded-lg drop-shadow-sm hover:drop-shadow-md">
              {error}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ViewIPFSDocumentPage;
