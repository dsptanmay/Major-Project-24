"use client";
import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  FileText,
  ChevronRight,
  Library,
} from "lucide-react";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import { client, contract, wallets } from "@/app/client";
import { getNFTs } from "thirdweb/extensions/erc721";
import { useState, useEffect } from "react";
import Image from "next/image";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
}

interface NFT {
  metadata: NFTMetadata;
  owner: string | null;
  id: bigint;
  tokenURI: string;
  type: "ERC721";
}

export default function UserRecordsPage() {
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAccount = useActiveAccount();

  const fetchOwnedNFTs = async () => {
    if (!activeAccount) return;

    setLoading(true);
    try {
      const result = await getNFTs({
        start: 0,
        count: 100,
        contract,
      });
      setNfts(result);
    } catch (err) {
      console.error("NFT Fetch Error:", err);
      setError("Failed to fetch NFTs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAccount) fetchOwnedNFTs();
  }, [activeAccount]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Medical Records
            </h1>
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

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 hover:shadow-md transition-all">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Medical Record NFTs
          </h2>
          {!activeAccount && (
            <div className="p-5 bg-red-100 text-red-500 rounded-lg border-2 border-red-400">
              You must connect to your wallet to view your records!
            </div>
          )}
          {loading && (
            <div className="text-center text-gray-500 py-4">
              Loading NFTs...
            </div>
          )}
          {error && (
            <div className="p-5 bg-red-100 text-red-500 rounded-lg">
              {error}
            </div>
          )}
          {activeAccount && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {nfts.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 flex items-center justify-center">
                  <Library size={48} className="mr-2" />
                  No Medical Record NFTs found
                </div>
              ) : (
                nfts.map((nft) => (
                  <div
                    key={nft.id.toString()}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                  >
                    {nft.metadata.image ? (
                      <Image
                        src={nft.metadata.image}
                        alt={nft.metadata.name || "Medical Record NFT"}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Library size={48} className="text-gray-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate">
                        {nft.metadata.name || "Unnamed Record"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Record ID: {nft.id.toString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/user"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard
                </h2>
                <p className="text-sm text-gray-600">Return to dashboard</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Home</h2>
                <p className="text-sm text-gray-600">Return to homepage</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
