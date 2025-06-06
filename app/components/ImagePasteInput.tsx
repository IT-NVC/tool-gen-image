import React, { useState } from "react";

const ImagePasteInput: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  return (
    <div style={{ width: "100%" }}>
      <textarea
        placeholder="Paste ảnh vào đây..."
        onPaste={handlePaste}
        rows={5}
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      {imagePreview && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Ảnh preview:</h3>
          <img
            src={imagePreview}
            alt="Pasted"
            style={{
              maxWidth: "100%",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImagePasteInput;
