"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon } from "lucide-react";

const PdfDecryptionUploader = () => {
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
  const [decryptionKey, setDecryptionKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // File selection handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    // Validate file type
    if (selectedFile) {
      if (selectedFile.type !== "application/json") {
        setError("Please upload the encrypted JSON file");
        setEncryptedFile(null);
        return;
      }
      setEncryptedFile(selectedFile);
      setError(null);
    }
  };

  // Decryption handler
  const handleDecrypt = async () => {
    if (!encryptedFile) {
      setError("Please select an encrypted JSON file");
      return;
    }

    if (!decryptionKey.trim()) {
      setError("Please enter the decryption key");
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      // Dynamically import forge
      const forge = await import("node-forge");

      // Read encrypted file
      const fileContent = await encryptedFile.text();
      const encryptedData = JSON.parse(fileContent);

      // Validate encrypted data structure
      if (
        !encryptedData.iv ||
        !encryptedData.encryptedContent ||
        !encryptedData.tag
      ) {
        throw new Error("Invalid encrypted file format");
      }

      // Convert hex strings to binary
      const keyBytes = forge.util.hexToBytes(decryptionKey);
      const ivBytes = forge.util.hexToBytes(encryptedData.iv);
      const tagBytes = forge.util.hexToBytes(encryptedData.tag);
      const encryptedBytes = forge.util.hexToBytes(
        encryptedData.encryptedContent
      );

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

      // Convert decrypted bytes to base64
      const base64Pdf = btoa(decryptedBytes);

      // Create a data URL
      const pdfDataUri = `data:application/pdf;base64,${base64Pdf}`;

      // Create download link
      const link = document.createElement("a");
      link.href = pdfDataUri;
      link.download = encryptedData.originalName || "decrypted.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optional: Open in new tab/window for preview
      window.open(pdfDataUri, "_blank");
    } catch (err) {
      setError(
        "Decryption failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FileIcon className="mr-2" /> PDF Decryption
      </h2>

      <Input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mb-4"
      />

      <Input
        type="text"
        placeholder="Enter Decryption Key"
        value={decryptionKey}
        onChange={(e) => setDecryptionKey(e.target.value)}
        className="mb-4"
      />

      <Button
        onClick={handleDecrypt}
        disabled={!encryptedFile || !decryptionKey || isDecrypting}
        className="w-full"
      >
        {isDecrypting ? "Decrypting..." : "Decrypt PDF"}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfDecryptionUploader;
