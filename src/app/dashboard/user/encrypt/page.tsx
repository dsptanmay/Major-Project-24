"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon, UploadIcon } from "lucide-react";
import { upload } from "thirdweb/storage";
import { client } from "@/app/client";
import "./page.css";

const PdfEncryptionUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [ipfsLink, setIpfsLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Web3 Storage client setup (replace with your actual token)

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
      const ipfsUrl = `https://${
        process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
      }.ipfscdn.io/ipfs/${uri.substring(7)}/`;
      setIpfsLink(ipfsUrl);

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
      className="w-full min-h-screen flex flex-col py-10 justify-center"
      id="bg"
    >
      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FileIcon className="mr-2" /> PDF Encryption & IPFS Upload
        </h2>

        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-4"
        />

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
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {encryptionKey && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="font-semibold">Encryption Key:</p>
            <code className="break-all text-sm">{encryptionKey}</code>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ Save this key securely. You'll need it to decrypt the file.
            </p>
          </div>
        )}

        {ipfsLink && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
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
      </div>
    </div>
  );
};

export default PdfEncryptionUploader;
