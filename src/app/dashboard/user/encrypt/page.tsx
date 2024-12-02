"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon } from "lucide-react";

// Dynamically import forge to ensure it's only loaded client-side
import dynamic from "next/dynamic";

const PdfEncryptionUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  // File selection handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
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

  // Encryption handler
  const handleEncrypt = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    setIsEncrypting(true);
    setError(null);

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

      // Prepare downloadable encrypted file
      const encryptedData = {
        iv: forge.util.bytesToHex(iv),
        encryptedContent: encrypted.toHex(),
        tag: tag.toHex(),
        originalName: file.name,
      };

      // Convert to blob for download
      const blob = new Blob([JSON.stringify(encryptedData)], {
        type: "application/json",
      });
      const downloadLink = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = downloadLink;
      link.download = `${file.name}.encrypted.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Store and display encryption key
      const hexKey = forge.util.bytesToHex(key);
      setEncryptionKey(hexKey);
    } catch (err) {
      setError(
        "Encryption failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FileIcon className="mr-2" /> PDF Encryption
      </h2>

      <Input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      <Button
        onClick={handleEncrypt}
        disabled={!file || isEncrypting}
        className="w-full"
      >
        {isEncrypting ? "Encrypting..." : "Encrypt PDF"}
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
    </div>
  );
};

export default PdfEncryptionUploader;
