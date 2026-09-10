import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get("/api/me");

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error(error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const logout = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.error(error);
    }

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="ra-dashboard-loading">
        <div className="ra-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="ra-dashboard">

      <nav className="ra-dashboard-nav">
        <div className="ra-dashboard-nav-inner">

          <Link
            to="/dashboard"
            className="ra-dashboard-logo"
          >
            <img
              src="/images/logo.png"
              alt="Analyzer"
            />
          </Link>

          <div className="ra-dashboard-nav-links">

            <Link
              to="/dashboard"
              className="ra-dashboard-nav-item active"
            >
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="ra-dashboard-nav-item"
            >
              Profile
            </Link>

            <button
              type="button"
              className="ra-dashboard-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>
      </nav>


      <main className="ra-dashboard-main">

        <section className="ra-dashboard-welcome">

          <h1>
            Welcome, <span>{user.username}</span>!
          </h1>

          <p>
            Analyze, match, and build your resume
            with AI-powered tools to advance your career.
          </p>

        </section>


        <section className="ra-dashboard-cards">

          <div className="ra-dashboard-card">

            <div className="ra-card-icon analyzer-icon">
              📄
            </div>

            <h2>Resume Analyzer</h2>

            <p>
              Get a detailed analysis of your resume
              with actionable insights and an overall score.
            </p>

            <Link
              to="/upload"
              className="ra-card-button analyzer-button"
            >
              Analyze Now
            </Link>

          </div>


          <div className="ra-dashboard-card">

            <div className="ra-card-icon matcher-icon">
              🔍
            </div>

            <h2>Resume Matcher</h2>

            <p>
              Compare resumes with a job description
              and find the best matching candidates.
            </p>

            <Link
              to="/matchresume"
              className="ra-card-button matcher-button"
            >
              Match Resume
            </Link>

          </div>


          <div className="ra-dashboard-card">

            <div className="ra-card-icon builder-icon">
              📝
            </div>

            <h2>Resume Builder</h2>

            <p>
              Create a professional resume using
              your personal details, skills, education,
              experience, and projects.
            </p>

            <Link
              to="/resumebuilder"
              className="ra-card-button builder-button"
            >
              Build Resume
            </Link>

          </div>

        </section>


        <section className="ra-dashboard-actions">

          <h2>Quick Actions</h2>

          <div className="ra-action-links">

            <Link to="/upload">
              Upload Resume
            </Link>

            <Link to="/matchresume">
              Resume Matching
            </Link>

            <Link to="/resumebuilder">
              Create Resume
            </Link>

            <Link to="/profile">
              View Profile
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;
