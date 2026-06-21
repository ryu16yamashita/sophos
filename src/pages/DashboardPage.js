import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

const ALL_EMOJIS = [
  "📐","📏","🧮","➕","➖","✖️","➗","∑","π","∞",
  "🧪","⚗️","🔬","🔭","🧬","⚡","🌊","🔥","🌍","🧲",
  "📚","📖","📝","✏️","🖊️","📒","📓","📔","📕","📗",
  "💡","🧠","🎯","🏆","⭐","🌟","💫","✨","🎖️","🔑",
  "📊","📈","📉","💹","🗂️","📁","📂","🗃️","🗄️","📋",
  "🎨","🎭","🎬","🎵","🎶","🎸","🎹","🎺","🎻","🥁",
  "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸",
  "🌸","🌺","🌻","🌹","🍀","🌿","🌱","🌲","🌴","🍃",
  "🦁","🐯","🦊","🐺","🦅","🦉","🐬","🐲","🦋","🌙",
];

// ── Live clock ────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="dash-clock">
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      <div style={{ fontSize: "0.72rem", marginTop: "1px" }}>
        {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

// ── Custom confirm modal ──────────────────────────────
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

// ── Edit icon modal ───────────────────────────────────
function IconModal({ current, onSelect, onClose }) {
  return (
    <div className="icon-modal-overlay" onClick={onClose}>
      <div className="icon-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Choose a new icon</h3>
        <div className="icon-modal-grid">
          {ALL_EMOJIS.map((em) => (
            <button
              key={em}
              className={`emoji-btn ${current === em ? "selected" : ""}`}
              onClick={() => onSelect(em)}
            >
              {em}
            </button>
          ))}
        </div>
        <div className="icon-modal-actions">
          <button className="btn-ghost" style={{ flex: 1, padding: "9px" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Individual folder card ────────────────────────────
function FolderCard({ folder, onDelete, onRename, onShare, onChangeIcon }) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [renaming, setRenaming]     = useState(false);
  const [newName, setNewName]       = useState(folder.name);
  const [shareEmail, setShareEmail] = useState("");
  const [sharingUI, setSharingUI]   = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRename = async (e) => {
    if (e) e.preventDefault();
    if (newName.trim() && newName !== folder.name) await onRename(folder._id, newName.trim());
    setRenaming(false);
    setMenuOpen(false);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (shareEmail.trim()) {
      await onShare(folder._id, shareEmail.trim());
      setShareEmail("");
      setSharingUI(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="folder-card-wrap" ref={menuRef}>
      <Link
        to={`/folder/${folder._id}`}
        className="folder-card"
        onClick={(e) => { if (menuOpen || renaming || sharingUI) e.preventDefault(); }}
      >
        <span className="folder-emoji">{folder.emoji}</span>
        {renaming ? (
          <form onSubmit={handleRename} onClick={(e) => e.preventDefault()}>
            <input
              className="folder-rename-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRename}
            />
          </form>
        ) : (
          <span className="folder-name">{folder.name}</span>
        )}
        {folder.isShared && <span className="folder-shared-badge">shared</span>}
      </Link>

      {/* 3-dot button */}
      <button
        className="folder-menu-btn"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
        title="Folder options"
      >
        ···
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="folder-dropdown">
          <button onClick={() => { setRenaming(true); setMenuOpen(false); }}>
            ✏️ Rename
          </button>
          <button onClick={() => { onChangeIcon(folder._id, folder.emoji); setMenuOpen(false); }}>
            🎨 Edit Icon
          </button>
          <button onClick={() => { setSharingUI(true); setMenuOpen(false); }}>
            🔗 Share Folder
          </button>
          <hr />
          <button className="danger" onClick={() => { onDelete(folder._id, folder.name); setMenuOpen(false); }}>
            🗑️ Delete Folder
          </button>
        </div>
      )}

      {/* Inline share UI */}
      {sharingUI && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
          background: "var(--surface-2)", border: "1.5px solid var(--border-light)",
          borderRadius: "10px", padding: "10px", marginTop: "4px",
        }}>
          <form onSubmit={handleShare} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              placeholder="Email to share with"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              type="email"
              style={{ padding: "6px 8px", borderRadius: "6px", fontSize: "0.8rem" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "4px" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: "6px", fontSize: "0.8rem" }}>Share</button>
              <button type="button" className="btn-ghost"   style={{ flex: 1, padding: "6px", fontSize: "0.8rem" }} onClick={() => setSharingUI(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("my"); // "my" | "shared"
  const [folders, setFolders]     = useState({ owned: [], shared: [] });
  const [newName, setNewName]         = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("📂");
  const [showPicker, setShowPicker]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [serverError, setServerError] = useState("");

  // Custom delete confirm
  const [confirmModal, setConfirmModal] = useState(null); // { id, name }

  // Edit icon modal
  const [iconModal, setIconModal] = useState(null); // { id, current }

  useEffect(() => {
    axios.get("/api/folders")
      .then((r) => setFolders(r.data))
      .catch((err) => setServerError(err.response?.data?.message || "Could not load folders."));
  }, []);

  const createFolder = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await axios.post("/api/folders", { name: newName, emoji: selectedEmoji });
      setFolders((f) => ({ ...f, owned: [data, ...f.owned] }));
      setNewName("");
      setShowPicker(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create folder.");
    } finally {
      setCreating(false);
    }
  };

  // Opens custom confirm modal instead of window.confirm
  const requestDelete = (id, name) => {
    setConfirmModal({ id, name });
  };

  const confirmDelete = async () => {
    if (!confirmModal) return;
    try {
      await axios.delete(`/api/folders/${confirmModal.id}`);
      setFolders((f) => ({ ...f, owned: f.owned.filter((x) => x._id !== confirmModal.id) }));
    } catch (err) {
      alert("Failed to delete folder.");
    } finally {
      setConfirmModal(null);
    }
  };

  const renameFolder = useCallback(async (id, name) => {
    try {
      const { data } = await axios.patch(`/api/folders/${id}`, { name });
      setFolders((f) => ({ ...f, owned: f.owned.map((x) => (x._id === id ? data : x)) }));
    } catch { alert("Failed to rename folder."); }
  }, []);

  const shareFolder = useCallback(async (id, email) => {
    try {
      const { data } = await axios.post(`/api/folders/${id}/share`, { email });
      alert(data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to share folder.");
    }
  }, []);

  // Open the icon picker modal
  const openIconModal = (id, current) => {
    setIconModal({ id, current });
  };

  const saveIcon = async (emoji) => {
    if (!iconModal) return;
    try {
      const { data } = await axios.patch(`/api/folders/${iconModal.id}`, { emoji });
      setFolders((f) => ({ ...f, owned: f.owned.map((x) => (x._id === iconModal.id ? data : x)) }));
    } catch { alert("Failed to update icon."); }
    setIconModal(null);
  };

  return (
    <div className="dashboard">
      {/* Custom delete confirm modal */}
      {confirmModal && (
        <ConfirmModal
          message={`Do you really want to delete "${confirmModal.name}" and all its cards?`}
          onYes={confirmDelete}
          onNo={() => setConfirmModal(null)}
        />
      )}

      {/* Edit icon modal */}
      {iconModal && (
        <IconModal
          current={iconModal.current}
          onSelect={saveIcon}
          onClose={() => setIconModal(null)}
        />
      )}

      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <img src="/owl-logo.svg" alt="Sophos owl" />
          <span className="brand-name">Sophos</span>
        </div>
        <Clock />
        <div className="dash-user">
          <span>{user.name}</span>
          <button onClick={logout} className="btn-ghost">Sign out</button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="dash-tabs">
        <button
          className={`dash-tab ${activeTab === "my" ? "active" : ""}`}
          onClick={() => setActiveTab("my")}
        >
          📁 My Folders
        </button>
        <button
          className={`dash-tab ${activeTab === "shared" ? "active" : ""}`}
          onClick={() => setActiveTab("shared")}
        >
          🔗 Shared Folders
          {folders.shared.length > 0 && (
            <span style={{
              marginLeft: 6, fontSize: "0.7rem",
              background: "var(--yellow)", color: "#1a1a1a",
              borderRadius: "10px", padding: "1px 7px", fontWeight: 700,
            }}>
              {folders.shared.length}
            </span>
          )}
        </button>
      </div>

      <main className="dash-main">
        {serverError && (
          <div style={{ background: "rgba(239,71,111,0.12)", border: "1px solid rgba(239,71,111,0.4)", borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem", color: "#EF476F", fontSize: "0.9rem" }}>
            ⚠️ {serverError}
          </div>
        )}

        {/* ── My Folders tab ── */}
        {activeTab === "my" && (
          <section className="dash-section">
            <form onSubmit={createFolder} className="new-folder-form">
              <button type="button" onClick={() => setShowPicker((v) => !v)}
                style={{ fontSize: "1.4rem", background: "var(--surface-2)", border: "1.5px solid var(--border-light)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
                {selectedEmoji}
              </button>
              <input
                placeholder="New folder name (e.g. Calculus)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={creating}>+ Create</button>
            </form>

            {showPicker && (
              <div className="emoji-picker">
                {ALL_EMOJIS.map((em) => (
                  <button key={em} type="button"
                    className={`emoji-btn ${selectedEmoji === em ? "selected" : ""}`}
                    onClick={() => { setSelectedEmoji(em); setShowPicker(false); }}>
                    {em}
                  </button>
                ))}
              </div>
            )}

            {folders.owned.length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
                No folders yet — create one above!
              </p>
            )}

            <div className="folder-grid">
              {folders.owned.map((f) => (
                <FolderCard
                  key={f._id}
                  folder={f}
                  onDelete={requestDelete}
                  onRename={renameFolder}
                  onShare={shareFolder}
                  onChangeIcon={openIconModal}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Shared Folders tab ── */}
        {activeTab === "shared" && (
          <section className="dash-section">
            {folders.shared.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔗</div>
                <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>No shared folders yet</p>
                <p style={{ fontSize: "0.85rem" }}>When a classmate shares a folder with you, it will appear here.</p>
              </div>
            ) : (
              <div className="folder-grid">
                {folders.shared.map((f) => (
                  <Link key={f._id} to={`/folder/${f._id}`} className="folder-card"
                    style={{ borderColor: "var(--success)" }}>
                    <span className="folder-emoji">{f.emoji}</span>
                    <span className="folder-name">{f.name}</span>
                    <span className="folder-shared-badge">shared</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
