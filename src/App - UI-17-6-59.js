import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function ImageWithBoxes({ image, detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;

        ctx.strokeStyle = "#c62828";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = "#c62828";
        ctx.font = "18px Arial";

        ctx.fillText(det.label, x1 + 5, y1 - 10);

        ctx.fillStyle = "#1565c0";
        ctx.fillText(
          `${(det.confidence * 100).toFixed(1)}%`,
          x1 + 5,
          y1 - 35
        );
      });
    };
  }, [image, detections]);

  return <canvas ref={canvasRef} />;
}

function App() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setImages(files);
    setLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      const res = await axios.post(
        `${backendUrl}/predict`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResults(res.data.results);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }

    setLoading(false);
  };

  const downloadJson = () => {
    if (!results.length) {
      alert("ยังไม่มีผลลัพธ์");
      return;
    }

    const blob = new Blob(
      [JSON.stringify(results, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "lanna_detection_results.json";
    a.click();
  };

  return (
    <div className="page">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="logo">
          <h1>อักษรล้านนา</h1>
          <p>DETECTOR</p>
        </div>

        <div className="menu">
          <a href="/">หน้าแรก</a>
          <a href="/">เกี่ยวกับเรา</a>
          <a href="/">เอกสาร</a>
        </div>
      </nav>

      {/* HERO */}

      <section className="hero">

        {/* LEFT */}

        <div>

          <div className="badge">
            YOLOv8 Detection
          </div>

          <div className="hero-title">
            <div className="thai">
              อักษรล้านนา
            </div>

            <div className="eng">
              Detector
            </div>
          </div>

          <p className="hero-desc">
            ระบบตรวจจับตำแหน่งอักษรล้านนาด้วย
            เทคโนโลยี AI และ YOLOv8
            สำหรับการวิจัยและอนุรักษ์วัฒนธรรมล้านนา
          </p>

          <div className="feature-row">

            <div className="feature-item">
              <h4>🎯</h4>
              <p>แม่นยำ</p>
            </div>

            <div className="feature-item">
              <h4>⚡</h4>
              <p>รวดเร็ว</p>
            </div>

            <div className="feature-item">
              <h4>🛡️</h4>
              <p>ปลอดภัย</p>
            </div>

          </div>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() =>
                document.getElementById("uploadInput").click()
              }
            >
              เริ่มการตรวจจับ
            </button>

            <button
              className="btn-outline"
              onClick={downloadJson}
            >
              ดาวน์โหลด JSON
            </button>
          </div>
        </div>

        {/* RIGHT */}

        <div className="upload-card">

          <div className="dropzone">

            <div style={{ fontSize: "70px" }}>
              ☁️
            </div>

            <h2>ลากไฟล์มาวางที่นี่</h2>
            

            <p>
              หรือคลิกเพื่อเลือกไฟล์
            </p>

            <input
              id="uploadInput"
              type="file"
              multiple
              hidden
              onChange={handleUpload}
            />

            <button
              className="upload-btn"
              onClick={() =>
                document.getElementById("uploadInput").click()
              }
            >
              เลือกไฟล์
            </button>

            <p>
              รองรับ JPG PNG JPEG
            </p>

          </div>

        </div>

      </section>

      {/* LOADING */}

      {loading && (
        <div
          style={{
            textAlign: "center",
            fontSize: "22px",
            marginBottom: "40px",
          }}
        >
          🔍 กำลังวิเคราะห์ภาพ...
        </div>
      )}

      {/* RESULTS */}

      {results.length > 0 && (
        <section className="why">

          <h2>ผลลัพธ์การตรวจจับ</h2>

          <div className="cards">

            {results.map((imageResult, idx) => (
              <div
                key={idx}
                className="card"
              >
                <h3>
                  รูปที่ {idx + 1}
                </h3>

                <div className="preview">
                  <ImageWithBoxes
                    image={images[idx]}
                    detections={imageResult}
                  />
                </div>

                <div
                  style={{
                    textAlign: "left",
                    marginTop: "15px",
                  }}
                >
                  {imageResult.map(
                    (det, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: "12px",
                        }}
                      >
                        <strong>
                          คลาส:
                        </strong>{" "}
                        {det.label} ({(
                          det.confidence *
                          100
                        ).toFixed(2)}%)
                        <br />
                        
                      </div>
                    )
                  )}
                </div>

              </div>
            ))}

          </div>

        </section>
      )}

      {/* FEATURES */}

      <section className="why">

        <h2>
          ทำไมต้องใช้ระบบของเรา
        </h2>

        <div className="cards">

          <div className="card">
            <h3>YOLOv8</h3>

            <p>
              ใช้โมเดลตรวจจับ
              อักษรล้านนาโดยเฉพาะ
            </p>
          </div>

          <div className="card">
            <h3>Bounding Box</h3>

            <p>
              แสดงตำแหน่งตัวอักษร
              อย่างแม่นยำ
            </p>
          </div>

          <div className="card">
            <h3>Confidence</h3>

            <p>
              แสดงค่าความเชื่อมั่น
              ของโมเดล
            </p>
          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-grid">

          <div>
            <h3>
              อักษรล้านนา Detector
            </h3>

            <p>
              ระบบตรวจจับอักษรล้านนา
              ด้วย YOLOv8
            </p>
          </div>

          <div>
            <h3>เมนู</h3>

            <p>หน้าแรก</p>
            <p>เกี่ยวกับเรา</p>
            <p>เอกสาร</p>
          </div>

          <div>
            <h3>เทคโนโลยี</h3>

            <p>YOLOv8</p>
            <p>React</p>
            <p>FastAPI</p>
          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;