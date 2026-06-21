import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-brand">
          <img src="/owl-logo.png" alt="Sophos owl logo" />
          <span className="auth-brand-name">Sophos</span>
        </div>
        <h1 className="auth-slogan">
          Mistakes Become<br />
          <span className="yellow">Your Strength.</span>
        </h1>
        <p className="auth-description">
          Every mistake is an opportunity to improve. Sophos helps you collect
          difficult questions, organize your learning, and revisit what once
          challenged you. Over time, your mistakes become your greatest source
          of growth.
        </p>
        <div className="auth-banner">📚 Built for students, by students</div>
      </div>

      <div className="auth-right">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to your Sophos account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-yellow" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
