import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <div className="ra-home">

      {/* NAVBAR */}
      <nav className="ra-navbar">
        <div className="ra-navbar-inner">

          <Link to="/" className="ra-logo">
            <img
              src="/images/logo.png"
              alt="Analyzer"
            />
          </Link>

          <div className="ra-nav-links">
            <Link to="/" className="ra-nav-link">
              Home
            </Link>

            <Link to="/login" className="ra-nav-link">
              Service
            </Link>

            <Link to="/login" className="ra-login">
              Login
            </Link>

            <Link to="/signup" className="ra-signup">
              Sign Up
            </Link>
          </div>

        </div>
      </nav>


      {/* HERO */}
      <section className="ra-hero">

        <div className="ra-hero-content">

          <h1>
            Resume
            <br />
            Analyzer
          </h1>

          <p>
            Analyze your resume and get detailed
            insights to improve your chances of
            getting hired.
          </p>

          <Link
            to="/signup"
            className="ra-primary-btn"
          >
            Get Started
          </Link>

        </div>

        <div className="ra-hero-image">
          <img
            src="/images/photo-1.png"
            alt="Resume Analyzer"
          />
        </div>

      </section>


      {/* LOGOS */}
      <section className="ra-logos-section">
        <img
          src="/images/logos.jpg"
          alt="Companies"
        />
      </section>


      {/* ANALYZER */}
      <section className="ra-feature ra-analyzer">

        <div className="ra-feature-text">

          <h2>
            Resume Analyzer
          </h2>

          <div className="ra-line"></div>

          <p>
            Improve your resume with Resume Analyzer!
            Get instant insights, keyword suggestions,
            and formatting tips to boost your job
            prospects. Try it now!
          </p>

          <Link
            to="/login"
            className="ra-feature-btn ra-blue"
          >
            Analyzer
          </Link>

        </div>

        <div className="ra-feature-image">
          <img
            src="/images/photo-3.webp"
            alt="Resume Analyzer"
          />
        </div>

      </section>


      {/* MATCHING */}
      <section className="ra-feature ra-matching">

        <div className="ra-feature-image">
          <img
            src="/images/photo-4.png"
            alt="Resume Matching"
          />
        </div>

        <div className="ra-feature-text ra-right">

          <h2>
            Resume Matching
          </h2>

          <div className="ra-line ra-green-line"></div>

          <p>
            Improve your resume with Resume Analyzer!
            Get instant insights, keyword suggestions,
            and formatting tips to boost your job
            prospects. Try it now!
          </p>

          <Link
            to="/login"
            className="ra-feature-btn ra-green"
          >
            Matching
          </Link>

        </div>

      </section>


      {/* BUILDER */}
      <section className="ra-feature ra-builder">

        <div className="ra-feature-text">

          <h2>
            Resume Build
          </h2>

          <div className="ra-line ra-dark-line"></div>

          <p>
            Improve your resume with Resume Analyzer!
            Get instant insights, keyword suggestions,
            and formatting tips to boost your job
            prospects. Try it now!
          </p>

          <Link
            to="/login"
            className="ra-feature-btn ra-dark"
          >
            Build Resume
          </Link>

        </div>

        <div className="ra-feature-image">
          <img
            src="/images/photo-2.png"
            alt="Resume Builder"
          />
        </div>

      </section>


      {/* FOOTER */}
      <footer className="ra-footer">
        <p>
          © 2024 Analyze. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default Home;
