"use client";
import { client, wallets } from "@/app/client";
import { Home, LaptopMinimalCheck, LayoutDashboard, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import "./page.css";
import Link from "next/link";

interface RecordData {
  organization_name: string;
  organization_address: string;
  title: string;
  nft_token_id: string;
}

function AccessControlPage() {
  const [records, setRecords] = useState<RecordData[]>([]);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `/api/access?userAddress=${activeAccount!.address}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
    };
    if (activeAccount) fetchData();
  }, [activeAccount]);

  const handleRevoke = async (record: RecordData) => {};
  return (
    <div className="h-screen max:h-screen-auto flex flex-col space-y-8 bg-gradient-to-br from-yellow-400/35 to-purple-400/60 p-10">
      <header className="p-5 flex justify-between items-center rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 bg-white">
        <div className="flex justify-center space-x-3">
          <LaptopMinimalCheck className="text-indigo-600 w-7 h-7" />
          <h1 className="font-bold text-2xl text-gray-800">Access Control</h1>
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
      <div className="bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 p-5">
        {!activeAccount && (
          <div className="p-5 bg-red-200 text-red-600 text-center font-semibold rounded-lg border-2 border-red-600">
            Connect your wallet first!
          </div>
        )}

        {activeAccount && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFT Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records &&
                  records.map((record, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.organization_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.nft_token_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.title.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {/* <button
                          onClick={() => handleApprove(notification)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Grant
                        </button> */}
                        <button
                          onClick={() => handleRevoke(record)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
  );
}

export default AccessControlPage;
