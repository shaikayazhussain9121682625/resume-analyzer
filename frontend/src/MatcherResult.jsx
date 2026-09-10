import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./matcher_result.css";

function MatcherResult() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("matcherResult");

    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        setData(null);
      }
    }
  }, []);

  if (!data) {
    return (
      <div className="container">
        <h2>No matching result found.</h2>

        <Link
          to="/matchresume"
          className="back-link"
        >
          ? Match Resumes
        </Link>
      </div>
    );
  }

  const resumes = data.top_resumes || [];
  const scores = data.similarity_scores || [];

  const topScore =
    scores.length > 0
      ? Math.round(Number(scores[0]) * 100)
      : 0;

  const circumference = 440;

  const offset =
    circumference -
    (circumference * topScore) / 100;

  return (
    <div className="container">

      <h2>Top Resume Matches</h2>

      <div
        className="circle-meter"
        role="img"
        aria-label={`Top score: ${topScore} percent`}
      >

        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          aria-hidden="true"
        >
          <circle
            className="bg"
            cx="90"
            cy="90"
            r="70"
          />

          <circle
            className="progress"
            cx="90"
            cy="90"
            r="70"
            style={{
              strokeDashoffset: offset
            }}
          />
        </svg>

        <div className="score-text">
          {topScore}%
        </div>

      </div>

      <div
        className="match-list"
        role="list"
        aria-label="List of matched resumes"
      >

        {resumes.map((resume, index) => {

          const score = Math.round(
            Number(scores[index] || 0) * 100
          );

          return (
            <div
              className="match-item"
              role="listitem"
              key={`${resume}-${index}`}
            >

              <div className="match-label">
                <span>{resume}</span>
                <span>{score}%</span>
              </div>

              <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={score}
              >
                <div
                  className="progress-fill"
                  style={{
                    width: `${score}%`
                  }}
                />
              </div>

            </div>
          );
        })}

      </div>

      <Link
        to="/matchresume"
        className="back-link"
      >
        ? Match More Resumes
      </Link>

      <Link
        to="/dashboard"
        className="back-link"
        style={{ marginLeft: "20px" }}
      >
        Dashboard
      </Link>

    </div>
  );
}

export default MatcherResult;
