import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./loginsignup.css";

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });

  }


  async function handleSubmit(event) {

    event.preventDefault();

    setMessage("");

    if (form.password !== form.confirm_password) {

      setMessage("Passwords do not match.");
      return;

    }

    try {

      setLoading(true);

      const response = await api.post(
        "/api/signup",
        form
      );

      if (response.data.success) {

        navigate("/login");

      } else {

        setMessage(
          response.data.message ||
          "Signup failed."
        );

      }

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Unable to connect to Flask server."
      );

    } finally {

      setLoading(false);

    }
  }


  return (

    <div
      className="menu"
      style={{
        minHeight: "100vh",
        background:
          "url('/images/bg.jpg') no-repeat center center fixed",
        backgroundSize: "cover"
      }}
    >

      <nav>

        <div className="nav__header" id="home">

          <div className="nav__logo">

            <Link to="/">
              <img
                src="/images/logo.png"
                alt="Logo"
              />
            </Link>

          </div>

          <ul className="nav__links">

            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/login" className="btnLogin">
                Login
              </Link>
            </li>

          </ul>

        </div>

      </nav>


      <div className="container">

        <h2>Signup</h2>


        {message && (
          <div
            className="flashes"
            style={{
              marginBottom: "15px",
              color: "#d32f2f",
              fontWeight: "600"
            }}
          >
            {message}
          </div>
        )}


        <form onSubmit={handleSubmit}>

          <label htmlFor="username">
            Full Name*
          </label>

          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter Your Full Name"
            value={form.username}
            onChange={handleChange}
            required
          />


          <label htmlFor="email">
            Email*
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />


          <label htmlFor="phone">
            Phone*
          </label>

          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter Your Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />


          <label htmlFor="password">
            Password*
          </label>

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
          />


          <label htmlFor="confirm_password">
            Confirm Password*
          </label>

          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            placeholder="Enter Confirm Password"
            value={form.confirm_password}
            onChange={handleChange}
            required
          />


          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>

        </form>


        <p style={{ marginTop: "15px" }}>

          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;
