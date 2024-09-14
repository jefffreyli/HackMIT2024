import { useState } from "react";
import './page.css'

const UploadPDF = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [musicLink, setMusicLink] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMusicLink(data.musicLink);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload PDF"}
      </button>
      {musicLink && (
        <div className="mt-4">
          <a
            href={musicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            Listen to Generated Music
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;
