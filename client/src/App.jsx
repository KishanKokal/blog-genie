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

  const generateBlog = () => {
    setLoading(true);
    setShowHome(false);
    setShowPreview(true);

    fetch("http://localhost:3000/genie/generate", {
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
        <h1 onClick={goHome}>Blog Genie 📝🧞‍♂️</h1>
      </header>
      <div className="gradient"></div>
      {showHome && (
        <Home
          articleURL={articleURL}
          setArticleURL={setArticleURL}
          generateBlog={generateBlog}
        />
      )}
      {showPreview && <Preview blog={blog} loading={loading} />}
    </div>
  );
}

export default App;
