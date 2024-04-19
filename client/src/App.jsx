import "./index.css";
import Home from "./components/home/Home.jsx";
import Preview from "./components/preview/Preview.jsx";
import { useState } from "react";

function App() {
  const [showHome, setShowHome] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [blog, setBlog] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    setShowHome(true);
    setShowPreview(false);
    setBlog("");
    setArticleURL("");
    setLoading(false);
  };

  const downloadDocument = async () => {
    const content = { content: blog }; // Adjust content as needed
    const response = await fetch("https://api.hemenparekh.ai/genie/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blog.docx";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateBlog = () => {
    setLoading(true);
    setShowHome(false);
    setShowPreview(true);

    fetch("https://api.hemenparekh.ai/genie/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: articleURL }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const reader = response.body.getReader();

        async function readStream() {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();

            // If done is true, it means the stream has ended
            if (done) {
              setLoading(false);
              break;
            }

            const chunkString = new TextDecoder().decode(value);
            let chunks = chunkString.split("}{");
            if (chunks.length === 1) {
              const chunkValue = JSON.parse(chunks[0]);
              chunkValue.message !== undefined &&
                setBlog((prevVal) => prevVal + chunkValue.message);
            } else {
              chunks[0] = JSON.parse(chunks[0] + "}");
              chunks[chunks.length - 1] = JSON.parse(
                "{" + chunks[chunks.length - 1]
              );
              for (let i = 1; i < chunks.length - 1; i++) {
                chunks[i] = JSON.parse("{" + chunks[i] + "}");
              }
              for (const chunk of chunks) {
                chunk.message !== undefined &&
                  setBlog((prevVal) => prevVal + chunk.message);
              }
            }
          }
        }
        readStream();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="main">
      <header>
        <h1>Blog Genie 📝🧞‍♂️</h1>
      </header>
      <div className="gradient"></div>
      {showHome && (
        <Home
          articleURL={articleURL}
          setArticleURL={setArticleURL}
          generateBlog={generateBlog}
        />
      )}
      {showPreview && (
        <Preview
          blog={blog}
          loading={loading}
          downloadDocument={downloadDocument}
          goHome={goHome}
        />
      )}
    </div>
  );
}

export default App;
