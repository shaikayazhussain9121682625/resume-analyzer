import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./upload.css";

function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Please select a PDF or DOCX file.");
      setFile(null);
      return;
    }

    if (
      selectedFile.type &&
      !allowedTypes.includes(selectedFile.type) &&
      !["pdf", "docx"].includes(extension)
    ) {
      setError("Please select a PDF or DOCX file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select your resume first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post(
        "/api/upload_resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.success) {
        sessionStorage.setItem(
          "resumeResult",
          JSON.stringify(response.data)
        );

        navigate("/result");
      } else {
        setError(
          response.data?.message ||
          "Unable to analyze the resume."
        );
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      <header className="upload-nav">

        <Link to="/dashboard" className="upload-logo">
          <img
            src="/images/logo.png"
            alt="Analyzer"
          />
        </Link>

        <nav className="upload-nav-links">
          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/profile">
            Profile
          </Link>
        </nav>

      </header>


      <main className="upload-main">

        <div className="upload-heading">
          <span className="upload-small-icon">
            ↑
          </span>

          <h1>Analyze Your Resume</h1>

          <p>
            Upload your resume and get a detailed score and analysis.
          </p>
        </div>


        <section className="upload-card">

          <form onSubmit={handleSubmit}>

            <label
              htmlFor="resume-file"
              className="upload-label"
            >
              Resume File
            </label>

            <label
              htmlFor="resume-file"
              className="upload-dropzone"
            >

              <div className="upload-plus">
                +
              </div>

              <strong>
                {file
                  ? file.name
                  : "Choose your resume"}
              </strong>

              <span>
                PDF or DOCX
              </span>

              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
              />

            </label>


            {file && (
              <div className="selected-file">
                <span>✓</span>

                <div>
                  <strong>
                    File selected
                  </strong>

                  <small>
                    {file.name}
                  </small>
                </div>
              </div>
            )}


            {error && (
              <div className="upload-error">
                {error}
              </div>
            )}


            <button
              type="submit"
              className="analyze-button"
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Resume"}
            </button>

          </form>


          <div className="upload-info">

            <div>
              <span>✓</span>
              PDF & DOCX supported
            </div>

            <div>
              <span>✓</span>
              Automatic resume scoring
            </div>

            <div>
              <span>✓</span>
              Detailed results
            </div>

          </div>

        </section>


        <Link
          to="/dashboard"
          className="upload-back"
        >
          ← Back to Dashboard
        </Link>

      </main>

    </div>
  );
}

export default Upload;
