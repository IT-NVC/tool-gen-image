import React from "react";

interface Base64ImageProps {
  base64?: string; // Base64 data
  url?: string; // URL hình ảnh
  fileName?: string; // Tên file khi tải về
  type?: "base64" | "url"; // Loại ảnh, mặc định 'base64'
}

const Base64Image: React.FC<Base64ImageProps> = ({
  base64,
  url,
  fileName = "download1",
  type = "base64",
}) => {
  // Xác định nguồn ảnh
  const imageSrc =
    type === "url" && url
      ? url
      : base64
      ? `data:image/png;base64,${base64}`
      : "";

  // Hàm xử lý tải ảnh về
  const handleDownload = async () => {
    try {
      let blob: Blob;

      if (type === "base64" && base64) {
        // Tạo blob từ base64
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: "image/png" });
      } else if (type === "url" && url) {
        // Fetch ảnh về dưới dạng blob
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) throw new Error("Không thể tải ảnh");
        blob = await response.blob();
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Tạo link để tải về
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      alert("Không thể tải ảnh. Vui lòng thử lại hoặc kiểm tra URL.");
    }
  };

  if (!imageSrc) return null; // Không có dữ liệu thì không render gì cả

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xs aspect-[9/16] overflow-hidden rounded-lg border border-gray-300 shadow-md">
        <img
          src={imageSrc}
          alt="Image"
          className="object-cover w-full h-full"
        />
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Tải xuống PNG
      </button>
    </div>
  );
};

export default Base64Image;
