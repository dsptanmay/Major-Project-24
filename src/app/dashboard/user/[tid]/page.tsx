"use client";
import { client, contract, wallets } from "@/app/client";
import React, { useEffect, useState } from "react";
import { readContract } from "thirdweb";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

function ShowUploadDocumentPage({ params }: any) {
  const activeAccount = useActiveAccount();
  const [ipfsHash, setIpfsHash] = useState("");
  const tokenId = params.tid! as string;
  useEffect(() => {
    const fetchIPFS = async (tokenId: bigint, caller: string) => {
      const _uri = await readContract({
        contract,
        method:
          "function getIPFSHash(uint256 tokenId, address caller) view returns (string)",
        params: [tokenId, caller],
      });
      setIpfsHash(_uri);
    };
    if (activeAccount) fetchIPFS(BigInt(tokenId), activeAccount?.address!);
  }, [activeAccount, tokenId]);
  return (
    <div className="flex flex-col items-center py-24">
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
      ShowUploadDocumentPage
      <p className="flex flex-col">ipfs hash: {ipfsHash}</p>
    </div>
  );
}

export default ShowUploadDocumentPage;
