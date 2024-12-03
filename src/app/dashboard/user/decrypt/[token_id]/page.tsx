"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon, EyeIcon } from "lucide-react";

const PdfDecryptionViewer = ({ params }: any) => {
  const tokenId = params.token_id as string;
  console.log(tokenId);
  const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
  const [decryptionKey, setDecryptionKey] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const pdfViewerRef = useRef<HTMLIFrameElement>(null);

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
      setPdfUrl(null);
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

      // Set PDF URL for viewer
      setPdfUrl(pdfDataUri);
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
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FileIcon className="mr-2" /> PDF Decryption Viewer
      </h2>

      <div className="space-y-4">
        <Input type="file" accept=".json" onChange={handleFileChange} />

        <Input
          type="text"
          placeholder="Enter Decryption Key"
          value={decryptionKey}
          onChange={(e) => setDecryptionKey(e.target.value)}
        />

        <Button
          onClick={handleDecrypt}
          disabled={!encryptedFile || !decryptionKey || isDecrypting}
          className="w-full"
        >
          {isDecrypting ? "Decrypting..." : "Decrypt and View PDF"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {pdfUrl && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-2 flex items-center justify-between">
              <h3 className="flex items-center">
                <EyeIcon className="mr-2" /> PDF Preview
              </h3>
            </div>
            <iframe
              ref={pdfViewerRef}
              src={pdfUrl}
              width="100%"
              height="600px"
              title="Decrypted PDF"
              className="border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfDecryptionViewer;
