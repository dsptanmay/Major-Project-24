"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon, Home, LayoutDashboard, UploadIcon } from "lucide-react";
import { upload } from "thirdweb/storage";
import { client, contract, wallets } from "@/app/client";
import Link from "next/link";
import "./page.css";
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const PdfEncryptionUploader = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetching of tokenID from contract
  const { data: tokenID } = useReadContract({
    contract,
    method: "function nextTokenIdToMint() view returns (uint256)",
    params: [],
  });
  // File selection handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    // Validate file type
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const mintNFT = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      token_id: tokenID!.toString(),
      user_address: activeAccount!.address,
      title,
      description,
    };
    try {
      setIsMinting(true);
      const userResponse = await fetch("/api/user-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const tokenResponse = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_id: tokenID!.toString(),
          encryption_key: encryptionKey!.toString(),
        }),
      });

      const transaction = prepareContractCall({
        contract,
        method:
          "function mintNFT(address to, string ipfsHash) returns (uint256)",
        params: [activeAccount!.address, ipfsLink!],
      });

      sendTransaction(transaction);
      if (userResponse.ok && tokenResponse.ok) {
        setIsMinting(false);
        setSuccess("Minted NFT Successfully!");
        setIsMinted(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to mint NFT!");
      setSuccess(null);
      setIsMinting(false);
    }
  };

  // Encryption and IPFS upload handler
  const handleEncryptAndUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setIpfsLink(null);

    // try {
    //   // Dynamically import forge
    //   const forge = await import("node-forge");

    //   // Read file as ArrayBuffer
    //   const fileBuffer = await file.arrayBuffer();

    //   // Convert to Uint8Array
    //   const uint8Array = new Uint8Array(fileBuffer);

    //   // Generate key and IV
    //   const key = forge.random.getBytesSync(32);
    //   const iv = forge.random.getBytesSync(12);

    //   // Create cipher
    //   const cipher = forge.cipher.createCipher("AES-GCM", key);

    //   cipher.start({
    //     iv: iv,
    //     tagLength: 128,
    //   });

    //   // Update cipher with file contents
    //   cipher.update(forge.util.createBuffer(uint8Array));
    //   cipher.finish();

    //   // Get encrypted data and tag
    //   const encrypted = cipher.output;
    //   const tag = cipher.mode.tag;

    //   // Prepare encrypted data object
    //   const encryptedData = {
    //     iv: forge.util.bytesToHex(iv),
    //     encryptedContent: encrypted.toHex(),
    //     tag: tag.toHex(),
    //     originalName: file.name,
    //   };

    //   // Convert to blob for IPFS upload
    //   const encryptedBlob = new Blob([JSON.stringify(encryptedData)], {
    //     type: "application/json",
    //   });

    //   // Create file for upload
    //   const encryptedFile = new File(
    //     [encryptedBlob],
    //     `${file.name}.encrypted.json`,
    //     {
    //       type: "application/json",
    //     }
    //   );

    //   // Upload to IPFS
    //   const uri = await upload({ client, files: [encryptedFile] });

    //   // Generate IPFS link
    //   // const ipfsUrl = `https://${
    //   //   process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
    //   // }.ipfscdn.io/ipfs/${uri.substring(7)}/`;
    //   setIpfsLink(uri);

    //   // Store and display encryption key
    //   const hexKey = forge.util.bytesToHex(key);
    //   setEncryptionKey(hexKey);
    // }
    try {
      // Dynamically import forge
      const forge = await import("node-forge");

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Convert to Uint8Array
      const uint8Array = new Uint8Array(fileBuffer);

      // Generate key and IV
      const key = forge.random.getBytesSync(32); // 256-bit key
      const iv = forge.random.getBytesSync(16); // 128-bit IV for AES-CBC

      // Create cipher
      const cipher = forge.cipher.createCipher("AES-CBC", key);

      cipher.start({
        iv: iv,
      });

      // Update cipher with file contents
      cipher.update(forge.util.createBuffer(uint8Array));
      cipher.finish();

      // Get encrypted data
      const encrypted = cipher.output;

      // Prepare encrypted data object
      const encryptedData = {
        iv: forge.util.bytesToHex(iv),
        encryptedContent: encrypted.toHex(),
        originalName: file.name,
      };

      // Convert to blob for IPFS upload
      const encryptedBlob = new Blob([JSON.stringify(encryptedData)], {
        type: "application/json",
      });

      // Create file for upload
      const encryptedFile = new File(
        [encryptedBlob],
        `${file.name}.encrypted.json`,
        {
          type: "application/json",
        }
      );

      // Upload to IPFS
      const uri = await upload({ client, files: [encryptedFile] });

      // Generate IPFS link
      setIpfsLink(uri);

      // Store and display encryption key
      const hexKey = forge.util.bytesToHex(key);
      setEncryptionKey(hexKey);
    } catch (err) {
      setError(
        "Encryption/Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen flex flex-col py-5 space-y-5 items-center justify-between"
      id="bg"
    >
      <header className="bg-white rounded-lg p-5 drop-shadow-sm max-w-5xl mx-auto flex justify-between w-full">
        <div className="flex items-center space-x-3">
          <UploadIcon className="w-6 h-6 text-orange-800" />
          <h1 className="font-bold text-xl">Upload Documents</h1>
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
      {activeAccount && (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg flex flex-col space-y-5 w-full">
          <h2 className="text-sm font-bold flex items-center text-gray-600">
            Your PDF Files will be encrypted using AES-256 and then will be
            converted to NFTs.
          </h2>

          {!ipfsLink && (
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
          )}

          {!ipfsLink && (
            <Button
              onClick={handleEncryptAndUpload}
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing
                ? "Encrypting & Uploading..."
                : "Encrypt & Upload to IPFS"}
            </Button>
          )}

          {error && (
            <Alert variant="destructive" className="">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {encryptionKey && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold">Encryption Key</p>
              <code className="break-all text-sm">{encryptionKey}</code>
              {/* <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Save this key securely. You'll need it to decrypt the file.
            </p> */}
            </div>
          )}

          {ipfsLink && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex flex-col space-y-2">
              <p className="font-semibold flex items-center">IPFS Link</p>
              <code className="text-blue-600 break-all text-sm">
                {ipfsLink}
              </code>
            </div>
          )}
          {ipfsLink && (
            <form
              className="flex flex-col space-y-5"
              onSubmit={(e) => mintNFT(e)}
            >
              <div className="flex flex-col space-y-1">
                <Label className="font-semibold text-sm text-gray-700">
                  Title
                </Label>
                <Input
                  type="text"
                  placeholder="Enter title of document"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <Label className="font-semibold text-sm text-gray-700">
                  Description
                </Label>
                <Input
                  type="text"
                  placeholder="Enter a description"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {!isMinted && (
                <Button type="submit">
                  {isMinting ? "Minting NFT..." : "Mint NFT"}
                </Button>
              )}
            </form>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="font-semibold">Success</p>
              <code className="break-all text-sm">{success}</code>
              {/* <p className="text-xs text-yellow-600 mt-2">
            ⚠️ Save this key securely. You'll need it to decrypt the file.
          </p> */}
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 w-full max-w-5xl">
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
                Manage your documents
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
};

export default PdfEncryptionUploader;
