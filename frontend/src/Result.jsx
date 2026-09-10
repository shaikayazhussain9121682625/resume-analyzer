import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./result.css";

function Result() {

  const [data, setData] = useState(null);

  useEffect(() => {

    const saved =
      sessionStorage.getItem("resumeResult");

    if (saved) {

      setData(JSON.parse(saved));

    }

  }, []);


  if (!data) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Poppins, sans-serif"
        }}
      >

        <h2>
          No analysis result found.
        </h2>

        <Link to="/upload_resume">
          Analyze a Resume
        </Link>

      </div>

    );

  }


  const score = Number(data.score || 0);

  const results = data.results || [];

  const extracted = data.extracted || {};

  const skills = extracted.skills || [];
  const education = extracted.education || [];
  const experience = extracted.experience || [];
  const projects = extracted.projects || [];
  const certifications = extracted.certifications || [];


  return (

    <div className="container">


      <h1>
        Resume Analysis Result
      </h1>


      {/* =====================================================
          EXTRACTED RESUME INFORMATION
          ===================================================== */}

      <section className="extracted-resume-box">

        <h2>
          Extracted Resume Information
        </h2>


        <div>

          <h3>Name</h3>

          <p>
            {extracted.name || "Not detected"}
          </p>


          <h3>Email</h3>

          <p>
            {extracted.email || "Not detected"}
          </p>


          <h3>Phone</h3>

          <p>
            {extracted.phone || "Not detected"}
          </p>


          <h3>Skills</h3>

          {skills.length > 0 ? (

            <ul>

              {skills.map((skill, index) => (

                <li key={index}>
                  {skill}
                </li>

              ))}

            </ul>

          ) : (

            <p>
              Not detected
            </p>

          )}


          <h3>Education</h3>

          {education.length > 0 ? (

            <ul>

              {education.map((item, index) => (

                <li key={index}>
                  {item}
                </li>

              ))}

            </ul>

          ) : (

            <p>
              Not detected
            </p>

          )}


          <h3>Experience</h3>

          {experience.length > 0 ? (

            <ul>

              {experience.map((item, index) => (

                <li key={index}>
                  {item}
                </li>

              ))}

            </ul>

          ) : (

            <p>
              Not detected
            </p>

          )}


          <h3>Projects</h3>

          {projects.length > 0 ? (

            <ul>

              {projects.map((item, index) => (

                <li key={index}>
                  {item}
                </li>

              ))}

            </ul>

          ) : (

            <p>
              Not detected
            </p>

          )}


          <h3>Certifications</h3>

          {certifications.length > 0 ? (

            <ul>

              {certifications.map((item, index) => (

                <li key={index}>
                  {item}
                </li>

              ))}

            </ul>

          ) : (

            <p>
              Not detected
            </p>

          )}

        </div>

      </section>


      {/* =====================================================
          EXISTING SCORE SECTION
          ===================================================== */}

      <div className="scores-box">


        <div className="total-score-circle">

          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
          >

            <circle
              cx="90"
              cy="90"
              r="60"
              fill="none"
              className="bg"
              strokeWidth="12"
            />

            <circle
              className="progress"
              cx="90"
              cy="90"
              r="60"
              fill="none"
              stroke="#5550FA"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="377"
              strokeDashoffset={
                377 - (377 * score) / 100
              }
              transform="rotate(-90 90 90)"
            />

            <text
              x="90"
              y="90"
              textAnchor="middle"
              dominantBaseline="middle"
              className="score-text"
            >
              {score}%
            </text>

          </svg>

        </div>


        <div className="results-list">

          {results.map((item, index) => {

            const percentage =
              item.max_score
                ? (item.score / item.max_score) * 100
                : 0;


            return (

              <section
                className="category-box"
                key={index}
              >

                <h3>
                  {item.category}
                </h3>

                <p>
                  Score: {item.score} / {item.max_score}
                </p>


                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`
                    }}
                  />

                </div>


                {item.flaws?.length > 0 && (

                  <div>

                    <h4>
                      Issues
                    </h4>

                    <ul>

                      {item.flaws.map(
                        (flaw, i) => (

                          <li key={i}>
                            {flaw}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}


                {item.fix_tips?.length > 0 && (

                  <div>

                    <h4>
                      How to Improve
                    </h4>

                    <ul>

                      {item.fix_tips.map(
                        (tip, i) => (

                          <li key={i}>
                            {tip}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}


                {item.suggestions?.length > 0 && (

                  <div>

                    <h4>
                      Suggestions
                    </h4>

                    <ul>

                      {item.suggestions.map(
                        (suggestion, i) => (

                          <li key={i}>
                            {suggestion}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}

              </section>

            );

          })}

        </div>

      </div>


      <section className="category-box youtube-links">

        <h3>
          Recommended YouTube Videos for Improving Your Resume
        </h3>

        <ul>

          <li>

            <a
              href="https://www.youtube.com/watch?v=Qb1iLJWuuGU"
              target="_blank"
              rel="noreferrer"
            >
              How to Write a Resume - Jeff Su
            </a>

          </li>


          <li>

            <a
              href="https://www.youtube.com/watch?v=ZQH5FhLMeiE"
              target="_blank"
              rel="noreferrer"
            >
              Resume That Gets You Hired - Linda Raynier
            </a>

          </li>


          <li>

            <a
              href="https://www.youtube.com/watch?v=8tYcEQ5s0cY"
              target="_blank"
              rel="noreferrer"
            >
              5 Resume Tips - Andrew LaCivita
            </a>

          </li>

        </ul>

      </section>


      <Link
        to="/upload_resume"
        className="button"
      >
        Analyze Another Resume
      </Link>


      <Link
        to="/dashboard"
        className="button"
        style={{ marginLeft: "10px" }}
      >
        Dashboard
      </Link>


    </div>

  );

}

export default Result;


