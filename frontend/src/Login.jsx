import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./loginsignup.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/login", {
        username: username.trim(),
        password: password,
      });

      if (response.data?.success) {
        navigate("/dashboard");
      } else {
        setError(
          response.data?.message ||
          "Invalid username or password."
        );
      }

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to connect to Flask server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="menu"
      style={{
        backgroundImage: "url('/images/bg-2.jpg')",
      }}
    >

      {/* NAVBAR */}
      <nav>
        <div className="nav__header">

          <div className="nav__logo">
            <Link to="/">
              <img
                src="/images/logo.png"
                alt="Analyzer"
              />
            </Link>
          </div>

          <ul className="nav__links">

            <li>
              <Link to="/">
                Home
              </Link>
            </li>

            <li>
              <Link to="/login">
                Service
              </Link>
            </li>

            <li>
              <Link
                to="/signup"
                className="btnLogin"
              >
                Sign Up
              </Link>
            </li>

          </ul>

        </div>
      </nav>


      {/* LOGIN */}
      <div className="container">

        <h2>
          Welcome Back
        </h2>

        {error && (
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto 20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background: "#fff0f0",
              color: "#d93025",
              border: "1px solid #f3b5b5",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label htmlFor="username">
            Username*
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Your Username"
            autoComplete="username"
          />


          <label htmlFor="password">
            Password*
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            autoComplete="current-password"
          />


          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>


        <p>
          Don't have an account?{" "}
          <Link to="/signup">
            Sign up here!
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;
