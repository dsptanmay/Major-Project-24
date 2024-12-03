"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { View } from "lucide-react";
import "./page.css";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import { client, wallets } from "@/app/client";

const PdfDecryptionViewer = ({ params }: any) => {
  const activeAccount = useActiveAccount();
  const tokenId = params.token_id as string;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ipfsURL, setIpfsURL] = useState("");
  const [key, setKey] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function getIpfsHash() {
      const ipfsResponse = await fetch(
        `/api/ipfs?userAddress=${activeAccount!.address}&tokenId=${tokenId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const tokenResponse = await fetch(`/api/tokens?tokenId=${tokenId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data: string = await ipfsResponse.json();
      if (ipfsResponse.ok) {
        setIpfsURL(
          `https://${
            process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
          }.ipfscdn.io/ipfs/${data.substring(7)}`
        );
      } else {
        setError("You are not authorized to view this document!");
        return;
      }

      if (tokenResponse.ok) {
        const data: { encryption_key: string } = await tokenResponse.json();
        setKey(data.encryption_key);
      } else {
        setError("Failed to fetch encryption key!");
      }
    }
    if (activeAccount) {
      getIpfsHash();
    }
  }, [activeAccount, tokenId]);

  const handleDecryptFromUrl = async () => {
    try {
      setIsDecrypting(true);
      const { pdfUrl, originalName } = await decryptPdfFromUrl(ipfsURL, key);
      setPdfUrl(pdfUrl);
      setDocumentName(originalName);
      setIsDecrypting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed");
      console.error(err);
      setIsDecrypting(false);
    }
  };

  const decryptPdfFromUrl = async (
    url: string,
    decryptionKey: string
  ): Promise<{ pdfUrl: string; originalName: string }> => {
    try {
      // Dynamically import forge
      const forge = await import("node-forge");

      // Fetch the encrypted JSON file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const encryptedData = await response.json();

      // Detailed logging of encrypted data
      console.log("Encrypted Data:", JSON.stringify(encryptedData, null, 2));
      console.log("Decryption Key:", decryptionKey);

      // Validate encrypted data structure
      if (
        !encryptedData.iv ||
        !encryptedData.encryptedContent ||
        !encryptedData.tag ||
        !encryptedData.originalName
      ) {
        throw new Error("Invalid encrypted file format");
      }

      // Validate key and data lengths
      if (decryptionKey.length === 0) {
        throw new Error("Decryption key is empty");
      }

      try {
        // Convert hex strings to binary
        const keyBytes = forge.util.hexToBytes(decryptionKey);
        const ivBytes = forge.util.hexToBytes(encryptedData.iv);
        const tagBytes = forge.util.hexToBytes(encryptedData.tag);
        const encryptedBytes = forge.util.hexToBytes(
          encryptedData.encryptedContent
        );

        // Log byte conversions
        console.log("Key Bytes Length:", keyBytes.length);
        console.log("IV Bytes Length:", ivBytes.length);
        console.log("Tag Bytes Length:", tagBytes.length);
        console.log("Encrypted Bytes Length:", encryptedBytes.length);

        // Create decipher
        const decipher = forge.cipher.createDecipher("AES-GCM", keyBytes);

        // Start the decipher
        decipher.start({
          iv: ivBytes,
          tag: forge.util.createBuffer(tagBytes),
          tagLength: 128,
        });

        // Update the decipher with encrypted content
        decipher.update(forge.util.createBuffer(encryptedBytes));

        // Finish decryption
        const pass = decipher.finish();

        if (!pass) {
          throw new Error("Decryption failed - authentication tag mismatch");
        }

        // Get decrypted bytes directly
        const decryptedBytes = decipher.output.getBytes();

        // Log decrypted bytes
        console.log("Decrypted Bytes Length:", decryptedBytes.length);

        // Validate decrypted bytes
        if (decryptedBytes.length === 0) {
          throw new Error("Decrypted content is empty");
        }

        // Convert decrypted bytes to base64
        const base64Pdf = btoa(decryptedBytes);

        // Create a data URL
        const pdfDataUri = `data:application/pdf;base64,${base64Pdf}`;

        return {
          pdfUrl: pdfDataUri,
          originalName: encryptedData.originalName,
        };
      } catch (conversionErr) {
        console.error("Conversion Error:", conversionErr);
        throw new Error(
          `Conversion failed: ${
            conversionErr instanceof Error
              ? conversionErr.message
              : "Unknown conversion error"
          }`
        );
      }
    } catch (err) {
      console.error("Decryption Error:", err);
      throw new Error(
        "Decryption failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  return (
    <div
      className="w-full p-5 min-h-screen items-center flex flex-col space-y-5"
      id="bg"
    >
      <header className="w-full max-w-5xl bg-white rounded-lg drop-shadow-sm flex justify-between p-5 items-center">
        <div className="flex items-center space-x-3">
          <View className="w-7 h-7 text-orange-800" />
          <h1 className="font-semibold text-xl">View Documents</h1>
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
      <div className="max-w-5xl w-full mx-auto p-5 bg-white shadow-md rounded-lg flex flex-col space-y-5">
        <h2 className="text-xl font-bold mb-4 flex ">
          Document for Token ID {tokenId}
        </h2>
        <Button
          onClick={() => {
            handleDecryptFromUrl();
          }}
        >
          {isDecrypting ? "Fetching and decrypting..." : "Fetch and Decrypt"}
        </Button>
        {pdfUrl && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2 flex items-center justify-between">
              <iframe
                ref={pdfViewerRef}
                src={pdfUrl}
                width="100%"
                height="600px"
                title={documentName}
                className="border-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfDecryptionViewer;
