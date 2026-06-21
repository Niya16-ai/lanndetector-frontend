import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import logo1 from "./img/logo1.png";
import logo2 from "./img/logo2.png";
import logo3 from "./img/logo3.png";
import logo4 from "./img/logo4.png";
import logo5 from "./img/logo5.png";
import book1 from "./img/book1.jpg";
import book2 from "./img/book2.jpg";
import book3 from "./img/book3.jpg";
import book4 from "./img/book4.jpg";
import PicFile from "./img/PicFile.png";




// 1. นิยาม Object จับคู่ตัวอักษร
const charMapping = {

"ch_0": "กะ",
"ch_1": "ขะ",
"ch_2": "ฃะ",
"ch_3": "ก๊ะ",
"ch_4": "ฅะ",
"ch_5": "ฆะ",
"ch_6": "งะ",
"ch_7": "จะ",
"ch_8": "ฉะ",
"ch_9": "จ๊ะ",
"ch_10": "ซะ",
"ch_11": "ฌะ",
"ch_12": "ญะ",
"ch_13": "ระดะ",
"ch_14": "ระฏะ",
"ch_15": "ระฐะ",
"ch_16": "ระฒะ",
"ch_17": "ระณะ",
"ch_18": "ตะ",
"ch_19": "ถะ",
"ch_20": "ทะ",
"ch_21": "ธะ",
"ch_22": "นะ",
"ch_23": "บะ",
"ch_24": "ปะ",
"ch_25": "ผะ",
"ch_26": "ฝะ",
"ch_27": "ป๊ะ",
"ch_28": "ฟะ",
"ch_29": "ภะ",
"ch_30": "มะ",
"ch_31": "ยะ",
"ch_32": "ระ",
"ch_33": "ละ",
"ch_34": "วะ",
"ch_35": "ศะ",
"ch_36": "ษะ",
"ch_37": "สะ",
"ch_38": "หะ",
"ch_39": "ฬะ",
"ch_40": "อะ",
"ch_41": "ฮะ",
"ch_42": "อยะ"
    
};

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
        ctx.font = "20px Arial";
        const labelText = charMapping[det.label] || det.label;
        //ctx.fillText(labelText, x1 + 5, y1 - 10);

        ctx.fillStyle = "#1565c0";
        ctx.fillText(
          `${labelText +" "+ (det.confidence * 100).toFixed(1)}%`, x1 + 5, y1 - 3
          //`${(det.confidence * 100).toFixed(1)}%`, x1 + 5, y1 - 35
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

      
 

  return (
    <div className="page">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="logo">
          <h1>เรียน ล้านนา</h1>
          <p>Learn Lanna</p>
        </div>

        
      </nav>

      {/* HERO */}

      <section className="hero">
        {/* LEFT */}
        <div>
            <div className="hero-title">
             <div>
                <img src={logo1} alt="logo1" width={100}/>
                <img src={logo2} alt="logo2" width={250}/>
            </div>
            <div className="thai">
              เรียน ล้านนา
            </div>
            <div className="eng">
              Learn Lanna
            </div>
          </div>

          <p className="hero-desc">
            แอปพลิเคชันสำหรับตรวจจับ อักษรพยัญชนะล้านนา 43 ตัว
          </p>

          
        </div>

        {/* RIGHT */}

        <div className="upload-card">

          <div className="dropzone">

            <div style={{ fontSize: "50px" }}>
            <img src={PicFile} alt="PicFile" width={200}/>
            </div>

            <h2>คลิกเพื่อเลือกไฟล์</h2>
            
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
              เริ่มการตรวจจับ
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
                        {/*
                        <strong>
                          คลาส:
                        </strong>{" "}
                        {det.label} ({(
                          det.confidence *
                          100
                        ).toFixed(2)}%)
                        <br />
                        */}
                        
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
        </h2>

        <div className="cards">

          <div className="card">
            <h3>หนังสือฝึกอ่าน ภาษาล้านนา</h3>
            <p>            
              ขอบคุณแหล่งอ้างอิง คุณสามารถกดที่รูปหนังสือเพื่อไป Link หนังสือนั้น 
            </p>
          </div>
          <div className="cards_2">
            <a 
              href="https://www.culture.cmru.ac.th/web/wp-content/uploads/2024/03/Lanna-Tham-Script-Revised-Edition-2026.pdf"  
              target="_blank"
              rel="noopener noreferrer"
            >
            <img src={book1} alt="book1" className="book-img"/>
            </a>
            <a 
              href="https://www.culture.cmru.ac.th/web/wp-content/uploads/2024/03/Textbook-thamma-lanna-alphabet.pdf"  
              target="_blank"
              rel="noopener noreferrer"
            >
            <img src={book2} alt="book2" className="book-img"/>
            </a>
            <a 
              href="https://www.culture.cmru.ac.th/web/wp-content/uploads/2024/03/tham-lanna-reading-practice-2.pdf"  
              target="_blank"
              rel="noopener noreferrer"
            >
            <img src={book3} alt="book3" className="book-img"/>
            </a>
            <a 
              href="https://www.culture.cmru.ac.th/web/wp-content/uploads/2024/03/textbook-lanna-vowel-1.pdf"  
              target="_blank"
              rel="noopener noreferrer"
            >
            <img src={book4} alt="book4" className="book-img"/>
            </a>
              
          </div>  

          

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <h3>
          โครงการวิจัยจากงบประมาณรายได้ของมหาวิทยาลัยนเรศวร ประจำปี 2568
        </h3>

        <div className="footer-grid">

          <div>
            <p>           
              โครงการนวัตกรรมเพื่อการเรียนรู้อักษรโบราณ: ดิจิทัลแพลตฟอร์มปัญญาประดิษฐ์ 
            </p>
            <p>
              เพื่อการระบุตำแหน่งและการจำแนกอักษรล้านนาในภาคเหนือของประเทศไทย
            </p>          
            <p>
            * หัวหน้าโครงการวิจัย 
            ดร.สุทธิพจน์ พีรณวงษ์
            </p>
            <p>
            ** ผู้ร่วมโครงการิจัย 
            ผศ. ดร.พิศิษฐ์ นาคใจ, ผศ. ดร.พัชรี มณีรัตน์ และ ดร.นิยดา รักวงษ์
            </p>
          </div>

          <div className="footer-grid-2">
                <img src={logo4} alt="logo4" width={100}/>
                <img src={logo5} alt="logo5" width={100}/>
                <img src={logo3} alt="logo3" width={80}/>

          </div>

          

          

        </div>
      </footer>
    </div>
  );
}

export default App;