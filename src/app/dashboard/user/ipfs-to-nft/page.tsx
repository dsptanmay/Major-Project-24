"use client";
import { client, contract, wallets } from "@/app/client";
import { prepareContractCall } from "thirdweb";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";

function IPFSToNFTPage() {
  const { mutate: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const [ipfsHash, setIPFSHash] = useState("");
  const [tokenId, setTokenID] = useState("");
  const [converting, setConverting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleClick = async () => {
    try {
      setError("");
      setConverting(true);

      if (!tokenId || !ipfsHash) {
        throw new Error("Token ID and IPFS Hash are required");
      }

      if (!activeAccount?.address) {
        throw new Error("No active account found");
      }

      // Convert tokenId to BigInt safely
      let tokenBigInt: bigint;
      try {
        tokenBigInt = BigInt(tokenId);
      } catch (e) {
        throw new Error("Invalid Token ID format - must be a number");
      }

      const transaction = prepareContractCall({
        contract,
        method:
          "function mintNFT(address to, uint256 tokenId, string ipfsHash)",
        params: [activeAccount.address, tokenBigInt, ipfsHash],
      });

      await sendTransaction(transaction);

      setTokenID("");
      setIPFSHash("");
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setConverting(false);
    }
  };
  return (
    <div className="absolute inset-0 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_2px)] [background-size:16px_16px] p-10">
      <div className=" mx-auto">
        <header className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">IPFS to NFT</h1>
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

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Enter Token ID and IPFS Hash
          </h2>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="tokenId"
                className="block text-sm font-medium text-gray-700"
              >
                Token ID (number)
              </label>
              <input
                type="text"
                id="tokenId"
                value={tokenId}
                onChange={(e) => setTokenID(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 border-2 border-dashed focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4"
                placeholder="Enter a number"
              />
            </div>
            <div>
              <label
                htmlFor="ipfsHash"
                className="block text-sm font-medium text-gray-700"
              >
                IPFS Hash
              </label>
              <input
                type="text"
                id="ipfsHash"
                value={ipfsHash}
                onChange={(e) => setIPFSHash(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 border-dashed border-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4"
                placeholder="Enter IPFS hash"
              />
            </div>
            {!activeAccount && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded items-center text-center">
                You need to connect your wallet in order to use this feature!
              </div>
            )}
            {activeAccount && (
              <button
                onClick={() => {
                  handleClick();
                }}
                disabled={converting || !tokenId || !ipfsHash || !activeAccount}
                className={`w-full justify-center inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  converting || !tokenId || !ipfsHash || !activeAccount
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
              >
                {converting ? "Converting..." : "Convert"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IPFSToNFTPage;
