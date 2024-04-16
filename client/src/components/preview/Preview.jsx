import "./Preview.css";
import Markdown from "react-markdown";
import Loader from "../loader/Loader.jsx";

function Preview({ blog, loading }) {
  return (
    <div className="preview">
      {loading && <Loader />}
      <div className="text-area">
        <p>
          <Markdown>{blog}</Markdown>
        </p>
      </div>
    </div>
  );
}

export default Preview;
