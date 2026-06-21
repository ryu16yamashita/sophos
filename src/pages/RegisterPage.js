import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "../styles/survey.css";

const HEAR_OPTIONS = [
  "From a friend / classmate",
  "Teacher recommended it",
  "Social media",
  "School announcement",
  "Other",
];

const PURPOSE_OPTIONS = [
  "Study for exams",
  "Review homework mistakes",
  "Organize class notes",
  "Help others in my class",
  "Just exploring",
];

const WHO_OPTIONS = [
  { value: "student", label: "🎒 Student" },
  { value: "parent", label: "👨‍👩‍👧 Parent" },
  { value: "teacher", label: "📋 Teacher" },
  { value: "other", label: "👤 Other" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = account details, 2 = survey
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [survey, setSurvey] = useState({ heardFrom: "", purpose: "", who: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateStep1 = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) return setError(err);
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, survey);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Left branding panel */}
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

      {/* Right panel */}
      <div className="auth-right">
        {step === 1 ? (
          <>
            <h2>Create account</h2>
            <p className="auth-subtitle">Free forever — no credit card needed</p>

            <form onSubmit={handleNext} className="auth-form">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-yellow">Next →</button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Quick survey</h2>
            <p className="auth-subtitle">Help us understand who's using Sophos</p>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Q1 */}
              <div className="survey-section">
                <label className="survey-label">Where did you hear about Sophos?</label>
                <div className="survey-options">
                  {HEAR_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`survey-chip ${survey.heardFrom === opt ? "selected" : ""}`}
                      onClick={() => setSurvey({ ...survey, heardFrom: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="survey-section">
                <label className="survey-label">What will you mainly use Sophos for?</label>
                <div className="survey-options">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`survey-chip ${survey.purpose === opt ? "selected" : ""}`}
                      onClick={() => setSurvey({ ...survey, purpose: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 */}
              <div className="survey-section">
                <label className="survey-label">Who are you?</label>
                <div className="survey-options">
                  {WHO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`survey-chip ${survey.who === opt.value ? "selected" : ""}`}
                      onClick={() => setSurvey({ ...survey, who: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-yellow"
                  disabled={loading}
                  style={{ flex: 2 }}
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
