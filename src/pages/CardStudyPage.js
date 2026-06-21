import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/study.css";

export default function CardStudyPage() {
  const { folderId, filter = "all" } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  // Track answers this session: cardId -> "correct" | "wrong"
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = { folder: folderId };
    if (filter === "starred")    params.starred    = true;
    if (filter === "understood") params.understood = true;
    axios.get("/api/cards", { params }).then((r) => {
      setCards([...r.data].sort(() => Math.random() - 0.5));
    });
  }, [folderId, filter]);

  const current = cards[index];
  const progress = cards.length > 0 ? ((index + 1) / cards.length) * 100 : 0;

  const toggleFlag = useCallback(async (flag) => {
    if (!current) return;
    setSaving(true);
    try {
      const { data } = await axios.patch(`/api/cards/${current._id}`, { [flag]: !current[flag] });
      setCards((c) => c.map((x) => (x._id === current._id ? data : x)));
    } finally { setSaving(false); }
  }, [current]);

  const markAnswer = (result) => {
    setAnswers((a) => ({ ...a, [current._id]: result }));
    goNext();
  };

  const goNext = () => {
    setFlipped(false);
    if (index >= cards.length - 1) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const resetSession = () => {
    setAnswers({});
    setDone(false);
    setIndex(0);
    setFlipped(false);
    setCards((c) => [...c].sort(() => Math.random() - 0.5));
  };

  // ── Results screen ──────────────────────────────────────
  if (done) {
    const total   = cards.length;
    const correct = Object.values(answers).filter((v) => v === "correct").length;
    const wrong   = Object.values(answers).filter((v) => v === "wrong").length;
    const skipped = total - correct - wrong;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

    let grade = "", gradeColor = "";
    if (pct >= 90) { grade = "Excellent! 🎉"; gradeColor = "var(--success)"; }
    else if (pct >= 70) { grade = "Good work! 👍"; gradeColor = "var(--yellow)"; }
    else if (pct >= 50) { grade = "Keep practising 💪"; gradeColor = "#f59e0b"; }
    else { grade = "Don't give up! 🔥"; gradeColor = "var(--danger)"; }

    return (
      <div className="study-page">
        <div className="results-card">
          <div className="results-header">
            <img src="/owl-logo.svg" alt="Sophos" style={{ width: 48, marginBottom: 8 }} />
            <h2 className="brand-name" style={{ fontSize: "1.6rem" }}>Session Complete</h2>
            <p style={{ color: gradeColor, fontWeight: 700, fontSize: "1.1rem", marginTop: 4 }}>{grade}</p>
          </div>

          <div className="results-stats">
            <div className="stat-box correct-box">
              <span className="stat-num">{correct}</span>
              <span className="stat-label">Correct ✔</span>
            </div>
            <div className="stat-box wrong-box">
              <span className="stat-num">{wrong}</span>
              <span className="stat-label">Wrong ✕</span>
            </div>
            <div className="stat-box skipped-box">
              <span className="stat-num">{skipped}</span>
              <span className="stat-label">Skipped</span>
            </div>
          </div>

          {/* Score ring */}
          <div className="score-ring-wrap">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={gradeColor} strokeWidth="10"
                strokeDasharray={`${pct * 3.14} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 0.8s ease" }}
              />
            </svg>
            <div className="score-ring-label">
              <span className="score-pct">{pct}%</span>
              <span className="score-sub">{correct}/{total}</span>
            </div>
          </div>

          <div className="results-actions">
            <button className="btn-yellow" onClick={resetSession}>🔄 Reset & Try Again</button>
            <button
              className="btn-primary"
              onClick={() => navigate(`/study/${folderId}/starred`)}
            >
              ⭐ Practice Starred Cards
            </button>
            <Link to={`/folder/${folderId}`} className="btn-ghost">← Back to Folder</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return <p className="loading">Loading cards…</p>;

  const alreadyAnswered = answers[current._id];

  return (
    <div className="study-page">
      <div className="study-header">
        <Link to={`/folder/${folderId}`} className="back-link">← Back</Link>
        <div style={{ textAlign: "center" }}>
          <div className="study-filter-badge">
            {filter === "starred" ? "⭐ Starred" : filter === "understood" ? "✅ Understood" : "All Cards"}
          </div>
        </div>
        <span className="study-progress">{index + 1} / {cards.length}</span>
      </div>

      <div className="study-progress-bar-wrap">
        <div className="study-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div
        className={`study-card ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="study-card-inner">
          <div className="study-front">
            {current.questionImage
              ? <img src={current.questionImage} alt="Question" />
              : <p style={{ color: "var(--text-muted)" }}>No question image</p>
            }
            {current.questionText && <p style={{ marginTop: 10, fontSize: "0.95rem" }}>{current.questionText}</p>}
            <span className="flip-hint">Tap to reveal ↩</span>
          </div>
          <div className="study-back">
            {current.answerImage && <img src={current.answerImage} alt="Answer" />}
            <div className="study-explanation">
              <span className="study-explanation-label">✏️ My explanation</span>
              {current.myExplanation
                ? <p className="study-explanation-text">{current.myExplanation}</p>
                : <p className="study-explanation-empty">No explanation written yet.</p>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Self-marking — shown after flip */}
      {flipped && !alreadyAnswered && (
        <div className="self-mark-bar">
          <span className="self-mark-label">How did you do?</span>
          <button className="mark-btn mark-correct" onClick={() => markAnswer("correct")}>✔ Got it</button>
          <button className="mark-btn mark-wrong"   onClick={() => markAnswer("wrong")}>✕ Didn't get it</button>
          <button className="mark-btn mark-skip"    onClick={() => markAnswer("skip")}>→ Skip</button>
        </div>
      )}
      {alreadyAnswered && (
        <div className="self-mark-result">
          {alreadyAnswered === "correct" && <span style={{ color: "var(--success)" }}>✔ Marked correct</span>}
          {alreadyAnswered === "wrong"   && <span style={{ color: "var(--danger)" }}>✕ Marked wrong</span>}
          {alreadyAnswered === "skip"    && <span style={{ color: "var(--text-muted)" }}>Skipped</span>}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="study-actions">
        <button className="study-action-btn nav-btn" onClick={(e) => { e.stopPropagation(); goPrev(); }} disabled={index === 0}>←</button>

        <button
          className={`study-action-btn ${current.starred ? "action-star-on" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleFlag("starred"); }}
          disabled={saving}
          title="Star"
        >
          {current.starred ? "⭐" : "☆"}
          <span className="action-label">Star</span>
        </button>

        <button
          className="study-action-btn action-flip"
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
        >
          ↩
          <span className="action-label">Flip</span>
        </button>

        <button
          className={`study-action-btn ${current.understood ? "action-understood-on" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleFlag("understood"); }}
          disabled={saving}
          title="Got it"
        >
          ✔
          <span className="action-label">Got it</span>
        </button>

        <button className="study-action-btn nav-btn" onClick={(e) => { e.stopPropagation(); goNext(); }}>→</button>
      </div>
    </div>
  );
}
