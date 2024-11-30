"use client";
import { client, contract, wallets } from "@/app/client";
import { Home, LayoutDashboard, View } from "lucide-react";
import React, { useEffect, useState } from "react";
import { readContract } from "thirdweb";
import Link from "next/link";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

function ShowUploadDocumentPage({ params }: any) {
  const activeAccount = useActiveAccount();
  const [ipfsHash, setIpfsHash] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const tokenId = params.token_id! as string;
  useEffect(() => {
    const fetchIPFS = async (tokenId: bigint, caller: string) => {
      const _uri = await readContract({
        contract,
        method:
          "function getIPFSHash(uint256 tokenId, address caller) view returns (string)",
        params: [tokenId, caller],
      });
      setIpfsHash(_uri);
      // console.log(_uri);
      setIpfsUrl(
        `https://${
          process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
        }.ipfscdn.io/ipfs/${_uri.substring(7)}`
      );
    };
    if (activeAccount) fetchIPFS(BigInt(tokenId), activeAccount?.address!);
  }, [activeAccount, tokenId]);
  return (
    <div className="flex flex-col py-10 bg-gradient-to-br from-orange-300 via-blue-300 to-purple-300 w-full px-12 justify-start min-h-screen space-y-5">
      <header className="bg-white p-5 drop-shadow-sm hover:drop-shadow-md transition-all flex justify-between items-center w-full rounded-lg ">
        <div className="flex items-center space-x-2">
          <View className="text-indigo-700 w-7 h-7" />
          <h1 className="font-semibold text-xl">View Document</h1>
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
      <div className="bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all p-5 flex flex-col space-y-5 justify-start">
        <p>Document with token ID : {tokenId}</p>
        <iframe
          src={`${ipfsUrl}#toolbar=0`}
          className="w-full min-h-80"
          style={{ border: "none" }}
          title="PDF Viewer"
        />
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
  );
}

export default ShowUploadDocumentPage;
