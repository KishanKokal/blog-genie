import "./index.css";
import Home from "./components/home/Home.jsx";
import Preview from "./components/preview/Preview.jsx";
import { useState } from "react";
import { Alert, AlertTitle, Collapse } from "@mui/material";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import Login from "./components/login/Login.jsx";
import axios from "axios";

const GENERATE_URL = import.meta.env.VITE_GENERATE_URL;
const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL;
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const ARTICLE_CONTENT_URL = import.meta.env.VITE_ARTICLE_CONTENT_URL;

function App() {
  const [showHome, setShowHome] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [blog, setBlog] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [articleContent, setArticleContent] = useState("");
  const [articleContentLoading, setArticleContentLoading] = useState(false);

  const goHome = () => {
    setShowHome(true);
    setShowPreview(false);
    setBlog("");
    setArticleURL("");
    setLoading(false);
  };

  const downloadDocument = async () => {
    const content = { content: blog }; // Adjust content as needed
    const response = await fetch(DOWNLOAD_URL, {
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

  const showModal = () => {
    getArticleContent();
    const dialog = document.querySelector("dialog");
    dialog.showModal();
  };

  const hideModal = () => {
    const dialog = document.querySelector("dialog");
    dialog.close();
  };

  const getArticleContent = async () => {
    setArticleContentLoading(true);
    try {
      const data = await axios.post(ARTICLE_CONTENT_URL, { url: articleURL });
      setArticleContent(data.data.content);
    } catch {
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
      }, 5000);
      hideModal();
    } finally {
      setArticleContentLoading(false);
    }
  };

  const generateBlog = () => {
    setLoading(true);
    setShowHome(false);
    setShowPreview(true);

    fetch(GENERATE_URL, {
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
        setLoading(false);
        setShowHome(true);
        setShowPreview(false);
        setOpen(true);
        setTimeout(() => {
          setOpen(false);
        }, 5000);
      });
  };

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <div className="main">
        <dialog className="modal">
          <div className="modal-inner-container">
            <h3>Please verify the content of the article</h3>
            <p className="note">
              Note: Please ensure that this accurately reflects the original
              article. If it doesn't, click 'Cancel'. This will serve as the
              context for ChatGPT.
            </p>
            <div className="context-window">
              {articleContentLoading ? (
                <p>Fetching article content...</p>
              ) : (
                <p>{articleContent}</p>
              )}
            </div>
            {!articleContentLoading && (
              <div className="buttons">
                <button
                  className="modal-button"
                  onClick={() => {
                    generateBlog();
                    hideModal();
                  }}
                >
                  <p className="modal-button-text">Generate</p>
                </button>
                <button
                  className="modal-button"
                  onClick={() => {
                    hideModal();
                    setArticleURL("");
                  }}
                >
                  <p className="modal-button-text">Cancel</p>
                </button>
              </div>
            )}
          </div>
        </dialog>
        <header>
          <h1>Blog Genie 📝🧞‍♂️</h1>
          <Collapse in={open} className="collapse">
            <Alert severity="error" className="alert" sx={{ mb: 2 }}>
              <AlertTitle>
                An error occurred while processing the article
              </AlertTitle>
              Please attempt again or select a different article.
            </Alert>
          </Collapse>
        </header>
        <div className="gradient"></div>
        <SignedIn>
          {showHome && (
            <Home
              articleURL={articleURL}
              setArticleURL={setArticleURL}
              generateBlog={showModal}
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
        </SignedIn>
        <SignedOut>
          <Login />
        </SignedOut>
      </div>
    </ClerkProvider>
  );
}

export default App;
