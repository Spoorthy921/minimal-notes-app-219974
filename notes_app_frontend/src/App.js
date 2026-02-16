import React, { useMemo, useState } from "react";
import "./App.css";
import { NoteEditor } from "./components/NoteEditor";
import { NotesList } from "./components/NotesList";
import { Toolbar } from "./components/Toolbar";
import { useLocalStorageNotes } from "./hooks/useLocalStorageNotes";
import { getAllTags, selectNotes } from "./utils/notes";

/**
 * PUBLIC_INTERFACE
 * Notes app entry component.
 * Provides localStorage-backed CRUD notes, search/filter/sort, and responsive layout.
 * Theme is React-managed via state + data attribute on the root app node (no direct DOM manipulation).
 */
function App() {
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const { notes, createNote, updateNote, deleteNote, clearAllNotes } = useLocalStorageNotes();

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [sortBy, setSortBy] = useState("updatedDesc");

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [selectedId, setSelectedId] = useState(null);

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);
  const allTags = useMemo(() => getAllTags(notes), [notes]);

  const visibleNotes = useMemo(
    () =>
      selectNotes(notes, {
        query,
        tag,
        sortBy,
      }),
    [notes, query, tag, sortBy]
  );

  // Keep selection valid when filters change / note deleted.
  const effectiveSelectedId = useMemo(() => {
    if (!selectedId) return null;
    const existsInAll = notes.some((n) => n.id === selectedId);
    return existsInAll ? selectedId : null;
  }, [notes, selectedId]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const startNew = () => {
    setMode("create");
    setSelectedId(null);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setMode("edit");
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete this note? This cannot be undone.");
    if (!ok) return;
    deleteNote(id);
    if (selectedId === id) startNew();
  };

  const handleCreate = (payload) => {
    const id = createNote(payload);
    setSelectedId(id);
    setMode("edit");
  };

  const handleUpdate = (id, patch) => {
    updateNote(id, patch);
  };

  const handleClearAll = () => {
    if (!notes.length) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Clear ALL notes? This cannot be undone.");
    if (!ok) return;
    clearAllNotes();
    startNew();
  };

  return (
    <div className="App" data-theme={theme}>
      <header className="topbar">
        <div className="topbar__brand">
          <div className="logoMark" aria-hidden="true">
            NP
          </div>
          <div>
            <h1 className="brandTitle">Notes — Ocean Professional</h1>
            <p className="brandSubtitle">Local-first, fast, and retro-clean.</p>
          </div>
        </div>

        <div className="topbar__actions">
          <button className="btn btn--ghost" type="button" onClick={handleClearAll} disabled={!notes.length}>
            Clear all
          </button>
          <button className="btn btn--ghost" type="button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </header>

      <main className="shell">
        <Toolbar
          query={query}
          onQueryChange={setQuery}
          tag={tag}
          tags={allTags}
          onTagChange={setTag}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onNew={startNew}
        />

        <div className="grid">
          <NotesList notes={visibleNotes} selectedId={effectiveSelectedId} onSelect={handleSelect} onDelete={handleDelete} />

          <NoteEditor
            mode={mode}
            note={mode === "edit" ? selectedNote : null}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onCancel={mode === "edit" ? startNew : undefined}
          />
        </div>
      </main>

      <footer className="footer">
        <span className="footer__text">
          Stored in <code>localStorage</code>. No backend required.
        </span>
      </footer>
    </div>
  );
}

export default App;
