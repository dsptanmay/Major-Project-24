"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon, UploadIcon } from "lucide-react";
import { upload } from "thirdweb/storage";
import { client, contract, wallets } from "@/app/client";
import "./page.css";
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";

const PdfEncryptionUploader = () => {
  const { mutate: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
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

    try {
      // Dynamically import forge
      const forge = await import("node-forge");

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Convert to Uint8Array
      const uint8Array = new Uint8Array(fileBuffer);

      // Generate key and IV
      const key = forge.random.getBytesSync(32);
      const iv = forge.random.getBytesSync(12);

      // Create cipher
      const cipher = forge.cipher.createCipher("AES-GCM", key);

      cipher.start({
        iv: iv,
        tagLength: 128,
      });

      // Update cipher with file contents
      cipher.update(forge.util.createBuffer(uint8Array));
      cipher.finish();

      // Get encrypted data and tag
      const encrypted = cipher.output;
      const tag = cipher.mode.tag;

      // Prepare encrypted data object
      const encryptedData = {
        iv: forge.util.bytesToHex(iv),
        encryptedContent: encrypted.toHex(),
        tag: tag.toHex(),
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
      // const ipfsUrl = `https://${
      //   process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
      // }.ipfscdn.io/ipfs/${uri.substring(7)}/`;
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
    <div className="w-full min-h-screen flex flex-col py-10 space-y-10" id="bg">
      <header className="bg-white rounded-lg p-5 drop-shadow-sm max-w-5xl mx-auto flex justify-between w-full">
        <div className="flex items-center space-x-3">
          <UploadIcon className="w-6 h-6 text-orange-600" />
          <h1 className="font-semibold text-xl">Upload Documents</h1>
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
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FileIcon className="mr-2" /> PDF Encryption & IPFS Upload
          </h2>

          <Input type="file" accept=".pdf" onChange={handleFileChange} />

          <Button
            onClick={handleEncryptAndUpload}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing
              ? "Encrypting & Uploading..."
              : "Encrypt & Upload to IPFS"}
          </Button>

          {error && (
            <Alert variant="destructive" className="">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {encryptionKey && (
            <div className=" p-3 bg-green-50 border border-green-200 rounded">
              <p className="font-semibold">Encryption Key:</p>
              <code className="break-all text-sm">{encryptionKey}</code>
              {/* <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Save this key securely. You'll need it to decrypt the file.
            </p> */}
            </div>
          )}

          {ipfsLink && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold flex items-center">
                <UploadIcon className="mr-2" /> IPFS Link:
              </p>
              <a
                href={ipfsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 break-all hover:underline"
              >
                {ipfsLink}
              </a>
            </div>
          )}
          {ipfsLink && (
            <form
              className="flex flex-col space-y-3"
              onSubmit={(e) => mintNFT(e)}
            >
              <Input
                type="text"
                placeholder="Enter title of document"
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Enter a description"
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit">Mint NFT</Button>
            </form>
          )}
          {success && (
            <Alert variant="default" className="">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfEncryptionUploader;
