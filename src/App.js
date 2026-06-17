import "./App.css";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function ImageWithBoxes({ image, detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "red";
        ctx.fillText(det.label, x1 + 4, y1 - 6);
        ctx.fillStyle = "blue";
        ctx.fillText(det.confidence, x1 + 4, y1 - 30);
      });
    };
  }, [image, detections]);

  return <canvas ref={canvasRef} style={{ maxWidth: "100%" }} />;
}

function App() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      // อ่านค่า backend URL จาก .env (ต้องตั้งค่าใน Vercel ด้วย)
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log("Backend URL:", backendUrl); // Debug ดูว่า URL ถูกต้องไหม

      // ส่งไฟล์ไปยัง FastAPI backend
      const res = await axios.post(`${backendUrl}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ เก็บผลลัพธ์ JSON ที่ backend ส่งกลับมา
      setResults(res.data.results);
    } catch (err) {
      console.error("API error:", err);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundColor: "#fff8e1",
      }}
    >
      <h1 style={{ color: "#b71c1c" }}>อักษรล้านนา Detector</h1>
      <input type="file" multiple onChange={handleUpload} />
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: "1rem" }}>
        {results.map((imageResult, idx) => (
          <div
            key={idx}
            style={{
              margin: "1rem",
              border: "1px solid #ccc",
              padding: "1rem",
            }}
          >
            <ImageWithBoxes image={images[idx]} detections={imageResult} />
            <div>
              {imageResult.map((det, i) => (
                <div key={i}>
                  <strong>คลาส:</strong> {det.label}
                  <br />
                  <strong>ความมั่นใจ:</strong>{" "}
                  {(det.confidence * 100).toFixed(2)}%
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (!results || results.length === 0) {
            alert("ยังไม่มีผลลัพธ์ให้ดาวน์โหลด");
            return;
          }
          const blob = new Blob([JSON.stringify(results, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "lanna_detection_results.json";
          a.click();
        }}
      >
        ดาวน์โหลดผลลัพธ์ JSON
      </button>
    </div>
  );
}

export default App;
