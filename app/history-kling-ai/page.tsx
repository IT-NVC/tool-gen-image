"use client";

import React, { useRef, useState } from "react";
import Base64Image from "../components/Base64Image";

export default function Home() {
  const [curl, setCurl] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageResponses, setImageResponses] = useState([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImageResponses([]);

    try {
      const res = await fetch("/api/king-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curl }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.text);
        setImageResponses(data.images);
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
    <>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl font-sans">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🌟 History Kling AI
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            placeholder="Nhập curl của bạn..."
            value={curl}
            onChange={(e) => setCurl(e.target.value)}
            rows={5}
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 rounded-xl font-semibold text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      </div>
      {response && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {imageResponses.map((item, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden border border-gray-300"
            >
              <Base64Image url={item} type="url" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
