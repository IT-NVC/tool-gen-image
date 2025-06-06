import React from "react";

interface Base64ImageProps {
  base64: string;
  fileName?: string;
}

const Base64Image: React.FC<Base64ImageProps> = ({
  base64,
  fileName = "download1",
}) => {
  const imageSrc = `data:image/png;base64,${base64}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `${fileName}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-xs aspect-[9/16] overflow-hidden rounded-lg border border-gray-300 shadow-md">
        <img
          src={imageSrc}
          alt="Base64 Image"
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
