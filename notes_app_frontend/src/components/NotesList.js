import React from "react";

/**
 * @typedef {import("../hooks/useLocalStorageNotes").Note} Note
 */

/**
 * @param {string} iso
 * @returns {string}
 */
function formatCompactDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * PUBLIC_INTERFACE
 * Displays a list of notes with selection and delete.
 * @param {{
 *  notes: Note[],
 *  selectedId: string | null,
 *  onSelect: (id: string) => void,
 *  onDelete: (id: string) => void,
 * }} props
 */
export function NotesList({ notes, selectedId, onSelect, onDelete }) {
  if (!notes.length) {
    return (
      <section className="panel panel--list" aria-label="Notes list">
        <header className="panel__header">
          <div>
            <h2 className="panel__title">Notes</h2>
            <p className="panel__subtitle">No matching notes. Try clearing filters or create a new note.</p>
          </div>
        </header>

        <div className="empty">
          <div className="empty__box" role="status" aria-live="polite">
            <p className="empty__title">Nothing here yet</p>
            <p className="empty__text">Create a note and it will show up in this list.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel panel--list" aria-label="Notes list">
      <header className="panel__header">
        <div>
          <h2 className="panel__title">Notes</h2>
          <p className="panel__subtitle">{notes.length} item{notes.length === 1 ? "" : "s"}</p>
        </div>
      </header>

      <ul className="list" role="list">
        {notes.map((n) => {
          const isSelected = n.id === selectedId;
          const contentPreview = (n.content || "").replace(/\s+/g, " ").trim().slice(0, 120);
          return (
            <li key={n.id} className={`card ${isSelected ? "card--selected" : ""}`}>
              <button type="button" className="card__main" onClick={() => onSelect(n.id)} aria-pressed={isSelected}>
                <div className="card__top">
                  <span className="card__title">{n.title || "Untitled"}</span>
                  <span className="pill pill--time" title={`Updated: ${n.updatedAt}`}>
                    {formatCompactDate(n.updatedAt)}
                  </span>
                </div>

                {n.tags?.length ? (
                  <div className="card__tags" aria-label="Tags">
                    {n.tags.slice(0, 3).map((t) => (
                      <span key={t} className="pill pill--tag">
                        #{t}
                      </span>
                    ))}
                    {n.tags.length > 3 ? <span className="pill pill--tag">+{n.tags.length - 3}</span> : null}
                  </div>
                ) : null}

                {contentPreview ? <p className="card__preview">{contentPreview}</p> : <p className="card__preview card__preview--muted">No content</p>}
              </button>

              <div className="card__actions">
                <button
                  type="button"
                  className="btn btn--danger btn--small"
                  onClick={() => onDelete(n.id)}
                  aria-label={`Delete note ${n.title || ""}`}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
