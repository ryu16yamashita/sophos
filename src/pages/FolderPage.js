import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "../styles/folder.css";

// ── Reusable confirm modal ────────────────────────────
function ConfirmModal({ message, onYes, onNo }) {
  return (
    <div className="modal-overlay" onClick={onNo}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Are you sure?</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="modal-btn-no"  onClick={onNo}>No, keep it</button>
          <button className="modal-btn-yes" onClick={onYes}>Yes, delete</button>
        </div>
      </div>
    </div>
  );
}

export default function FolderPage() {
  const { folderId } = useParams();
  const [cards, setCards]   = useState([]);
  const [filter, setFilter] = useState("all");
  const [flipped, setFlipped] = useState({});
  const [editingExplanation, setEditingExplanation] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMsg, setShareMsg]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // cardId to delete
  const fileRef = useRef();

  const fetchCards = () => {
    const params = { folder: folderId };
    if (filter === "starred")    params.starred    = true;
    if (filter === "understood") params.understood = true;
    axios.get("/api/cards", { params }).then((r) => setCards(r.data));
  };
  useEffect(fetchCards, [folderId, filter]);

  const toBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleNewCard = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const questionImage = await toBase64(file);
    const { data } = await axios.post("/api/cards", { folder: folderId, questionImage });
    setCards((c) => [data, ...c]);
    fileRef.current.value = "";
  };

  const handleAnswerUpload = async (cardId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const answerImage = await toBase64(file);
    const { data } = await axios.patch(`/api/cards/${cardId}`, { answerImage });
    setCards((c) => c.map((x) => (x._id === cardId ? data : x)));
  };

  const toggleStar = async (card) => {
    const { data } = await axios.patch(`/api/cards/${card._id}`, { starred: !card.starred });
    setCards((c) => c.map((x) => (x._id === card._id ? data : x)));
  };

  const toggleUnderstood = async (card) => {
    const { data } = await axios.patch(`/api/cards/${card._id}`, { understood: !card.understood });
    setCards((c) => c.map((x) => (x._id === card._id ? data : x)));
  };

  const openExplanation = (card) => {
    setEditingExplanation(card._id);
    setDraftText(card.myExplanation || "");
  };

  const saveExplanation = async (cardId) => {
    const { data } = await axios.patch(`/api/cards/${cardId}`, { myExplanation: draftText });
    setCards((c) => c.map((x) => (x._id === cardId ? data : x)));
    setEditingExplanation(null);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/folders/${folderId}/share`, { email: shareEmail });
      setShareMsg(data.message);
      setShareEmail("");
    } catch (err) {
      setShareMsg(err.response?.data?.message || "Share failed.");
    }
  };

  const doDeleteCard = async () => {
    if (!confirmDelete) return;
    await axios.delete(`/api/cards/${confirmDelete}`);
    setCards((c) => c.filter((x) => x._id !== confirmDelete));
    setConfirmDelete(null);
  };

  const toggleFlip = (cardId) => setFlipped((f) => ({ ...f, [cardId]: !f[cardId] }));

  return (
    <div className="folder-page">
      {/* Custom delete confirm */}
      {confirmDelete && (
        <ConfirmModal
          message="Do you really want to delete this card?"
          onYes={doDeleteCard}
          onNo={() => setConfirmDelete(null)}
        />
      )}

      <div className="folder-topbar">
        <Link to="/" className="back-link">← My Folders</Link>
        <div className="filter-tabs">
          {["all", "starred", "understood"].map((f) => (
            <button key={f} className={filter === f ? "tab active" : "tab"} onClick={() => setFilter(f)}>
              {f === "starred" ? "⭐ Starred" : f === "understood" ? "✅ Understood" : "All cards"}
            </button>
          ))}
        </div>
        <form onSubmit={handleShare} className="share-form">
          <input placeholder="Share with email…" value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)} type="email" />
          <button type="submit" className="btn-ghost">Share</button>
        </form>
      </div>

      {shareMsg && (
        <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem", color: "var(--success)" }}>{shareMsg}</div>
      )}

      <div className="add-card-bar">
        <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleNewCard} />
        <button className="btn-primary" onClick={() => fileRef.current.click()}>+ Add Card</button>
        <Link to={`/study/${folderId}/${filter}`} className="btn-ghost">
          Study {filter === "starred" ? "Starred" : filter === "understood" ? "Understood" : "All"} Cards →
        </Link>
      </div>

      {cards.length === 0 && (
        <p style={{ padding: "2rem 1.5rem", color: "var(--text-muted)", textAlign: "center" }}>
          No cards here yet. Upload a screenshot to get started!
        </p>
      )}

      <div className="card-grid">
        {cards.map((card) => (
          <div key={card._id} className="card-wrapper">
            <div className={["flashcard", flipped[card._id] ? "flipped" : "", card.starred ? "starred" : "", card.understood ? "understood" : ""].join(" ")}>
              <div className="card-inner"
                onClick={() => { if (editingExplanation === card._id) return; toggleFlip(card._id); }}>

                {/* Front */}
                <div className="card-front">
                  {card.questionImage
                    ? <img src={card.questionImage} alt="Question" />
                    : <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No question image</p>}
                  {card.questionText && <p style={{ fontSize: "0.88rem", marginTop: "6px" }}>{card.questionText}</p>}
                  <span className="flip-hint">Tap to flip ↩</span>
                </div>

                {/* Back */}
                <div className="card-back" onClick={(e) => e.stopPropagation()}>
                  {card.answerImage && <img src={card.answerImage} alt="Answer" />}
                  {!card.answerImage && !card.myExplanation && (
                    <p className="no-answer" style={{ marginBottom: "10px" }}>No answer yet</p>
                  )}

                  {editingExplanation === card._id ? (
                    <div className="explanation-editor" onClick={(e) => e.stopPropagation()}>
                      <span className="explanation-label">✏️ My explanation</span>
                      <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Why did I get this wrong?" rows={4} autoFocus />
                      <div className="explanation-actions">
                        <button className="btn-primary" style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                          onClick={(e) => { e.stopPropagation(); saveExplanation(card._id); }}>Save</button>
                        <button className="btn-ghost" style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                          onClick={(e) => { e.stopPropagation(); setEditingExplanation(null); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`explanation-display ${card.myExplanation ? "has-text" : ""}`}
                      onClick={(e) => { e.stopPropagation(); openExplanation(card); }}>
                      <span className="explanation-label">✏️ My explanation</span>
                      {card.myExplanation
                        ? <p className="explanation-text">{card.myExplanation}</p>
                        : <p className="explanation-placeholder">Tap to add your notes…</p>}
                    </div>
                  )}

                  <span className="flip-hint" style={{ marginTop: "8px" }}
                    onClick={(e) => { e.stopPropagation(); toggleFlip(card._id); }}>
                    Tap to flip back ↩
                  </span>
                </div>
              </div>
            </div>

            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => toggleStar(card)} className={card.starred ? "star-active" : ""} title="Star">
                {card.starred ? "⭐" : "☆"}
              </button>
              <button onClick={() => toggleUnderstood(card)} className={card.understood ? "understood-active" : ""} title="Mark understood">
                ✔
              </button>
              <label title="Upload answer image">
                <img src="/upload-icon.png" alt="Upload answer" className="upload-img" />
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleAnswerUpload(card._id, e)} />
              </label>
              <button onClick={(e) => { e.stopPropagation(); openExplanation(card); if (!flipped[card._id]) toggleFlip(card._id); }}
                title="Write explanation" style={{ color: "var(--yellow)" }}>✏️</button>
              <button onClick={() => setConfirmDelete(card._id)} title="Delete card" className="delete-btn">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
