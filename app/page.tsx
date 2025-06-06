"use client";

import React, { useRef, useState } from "react";
import Base64Image from "./components/Base64Image";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [cookie, setCookie] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageResponses, setImageResponses] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste ảnh từ clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setImagePreview(result);
          };
          reader.readAsDataURL(file);
        }
        e.preventDefault();
        break;
      }
    }
  };

  // Chọn ảnh mới từ file picker (nút sửa ảnh)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh preview
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setImageResponses([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, image: imagePreview, cookie }),
      });

      const data = await res.json();
      if (res.ok) {
        setImageResponses(data.images);
        setResponse(data.text);
        console.log("imageResponses", data.images);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse("Error: Unable to fetch response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🌟 Generate image với Pixlr và Genmini
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4 items-start">
          <textarea
            placeholder="Nhập tin nhắn của bạn..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onPaste={handlePaste}
            rows={5}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {imagePreview && (
            <div className="relative w-50 h-50 rounded-lg border border-gray-300 overflow-hidden flex-shrink-0">
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
              {/* Nút xóa */}
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
                aria-label="Xóa ảnh"
              >
                &times;
              </button>
              {/* Nút sửa (chọn lại ảnh) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-700 transition"
                aria-label="Sửa ảnh"
              >
                ✎
              </button>
              <a
                href={imagePreview}
                download="image.png"
                className="absolute bottom-1 left-1 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-700 transition"
                aria-label="Tải ảnh"
              >
                ⬇️
              </a>
            </div>
          )}
          {!imagePreview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition self-start"
            >
              Chọn ảnh
            </button>
          )}
          {/* Input file ẩn */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <textarea
            placeholder="Nhập cookie của bạn..."
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            rows={5}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi"}
        </button>
      </form>
      {response && (
        <>
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="font-bold mb-2 text-gray-700">🤖 Phản hồi:</h2>
            <p className="whitespace-pre-wrap text-gray-800">{response}</p>
            {imageResponses.map((item) => (
              <Base64Image base64={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
