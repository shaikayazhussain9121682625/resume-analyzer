import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./matchresume.css";

function MatchResume() {
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (files.length < 5) {
      setError("Please select at least 5 resumes.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("job_description", jobDescription);

      files.forEach((file) => {
        formData.append("resumes", file);
      });

      const response = await api.post(
        "/api/matcher",
        formData
      );

      if (response.data?.success) {
        sessionStorage.setItem(
          "matcherResult",
          JSON.stringify(response.data)
        );

        navigate("/matcher-result");
      } else {
        setError(
          response.data?.message ||
          "Unable to match resumes."
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
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="matcher-page">

      <header className="matcher-header">

        <Link to="/dashboard" className="matcher-logo">
          <img
            src="/images/logo.png"
            alt="Analyzer"
          />
        </Link>

        <div className="matcher-navigation">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/profile">
            Profile
          </Link>

        </div>

      </header>


      <main className="matcher-main">

        <div className="matcher-title">

          <div className="matcher-icon">
            🔍
          </div>

          <h1>Resume Matcher</h1>

          <p>
            Find the resumes that best match your
            job requirements.
          </p>

        </div>


        <form
          className="matcher-card"
          onSubmit={handleSubmit}
        >

          <div className="matcher-group">

            <label>
              Job Description
            </label>

            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              placeholder="Paste the job description here..."
              rows="8"
            />

          </div>


          <div className="matcher-group">

            <label>
              Upload Resumes
            </label>

            <p className="matcher-note">
              Select at least 5 resumes.
            </p>

            <label
              htmlFor="resume-files"
              className="file-upload"
            >

              <span className="upload-symbol">
                +
              </span>

              <span>
                Choose resume files
              </span>

              <small>
                PDF, DOCX or TXT
              </small>

            </label>

            <input
              id="resume-files"
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={(e) =>
                setFiles(
                  Array.from(e.target.files || [])
                )
              }
            />

          </div>


          {files.length > 0 && (

            <div className="selected-resumes">

              <div className="selected-header">
                <strong>
                  Selected resumes
                </strong>

                <span>
                  {files.length}
                </span>
              </div>

              {files.map((file, index) => (

                <div
                  className="resume-file"
                  key={`${file.name}-${index}`}
                >
                  <span>📄</span>
                  <span>
                    {file.name}
                  </span>
                </div>

              ))}

            </div>

          )}


          {error && (

            <div className="matcher-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            disabled={loading}
            className="matcher-submit"
          >

            {loading
              ? "Matching..."
              : "Find Best Matches"}

          </button>

        </form>


        <Link
          to="/dashboard"
          className="matcher-back"
        >
          ← Back to Dashboard
        </Link>

      </main>

    </div>
  );
}

export default MatchResume;
