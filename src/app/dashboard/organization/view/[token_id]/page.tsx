"use client";
import { client, wallets } from "@/app/client";
import { Home, LayoutDashboard, ScanSearch } from "lucide-react";
import Link from "next/link";
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
      <div className="max-w-6xl mx-auto flex flex-col space-y-5">
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
        <div className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all flex flex-col space-y-5 min-h-screen">
          {ipfsHash && (
            <div className="overflow-hidden">
              <iframe
                className="w-full min-h-screen"
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
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/user" className="w-full">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 flex items-center space-x-4 transform transition-all duration-100 hover:shadow-md hover:border-blue-400 group">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <LayoutDashboard className="text-blue-600 w-7 h-7" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">
                  Dashboard
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                  Manage your documents and settings
                </p>
              </div>
            </div>
          </Link>

          <Link href="/" className="w-full">
            <div className="bg-white rounded-xl border-2 border-green-200 p-6 flex items-center space-x-4 transform transition-all duration-100 hover:shadow-md hover:border-green-400 group">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <Home className="text-green-600 w-7 h-7" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                  Home
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                  Return to main landing page
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ViewIPFSDocumentPage;
