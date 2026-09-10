import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
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

    loadProfile();
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
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">

      <header className="profile-nav">

        <Link to="/dashboard" className="profile-logo">
          <img src="/images/logo.png" alt="Analyzer" />
        </Link>

        <nav className="profile-nav-links">
          <Link to="/dashboard">Dashboard</Link>

          <Link to="/profile" className="profile-active">
            Profile
          </Link>

          <button onClick={logout}>
            Logout
          </button>
        </nav>

      </header>


      <main className="profile-main">

        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>View your account information</p>
        </div>


        <section className="profile-card">

          <div className="profile-avatar">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>

          <h2>{user.username}</h2>

          <p className="profile-subtitle">
            Resume Analyzer Account
          </p>


          <div className="profile-details">

            <div className="profile-detail">
              <span className="detail-icon">👤</span>

              <div>
                <small>Username</small>
                <strong>{user.username}</strong>
              </div>
            </div>


            <div className="profile-detail">
              <span className="detail-icon">✉</span>

              <div>
                <small>Email</small>
                <strong>{user.email}</strong>
              </div>
            </div>


            <div className="profile-detail">
              <span className="detail-icon">☎</span>

              <div>
                <small>Phone</small>
                <strong>{user.phone}</strong>
              </div>
            </div>

          </div>


          <div className="profile-actions">

            <Link to="/dashboard" className="profile-dashboard-btn">
              ← Dashboard
            </Link>

            <button
              type="button"
              className="profile-logout-btn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;
