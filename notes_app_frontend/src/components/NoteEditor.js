import React, { useEffect, useMemo, useState } from "react";
import { parseTags } from "../utils/notes";

/**
 * @typedef {import("../hooks/useLocalStorageNotes").Note} Note
 */

/**
 * PUBLIC_INTERFACE
 * Editor for creating or updating a note.
 * @param {{
 *  mode: "create" | "edit",
 *  note?: Note | null,
 *  onCreate?: (payload: {title: string, content: string, tags: string[]}) => void,
 *  onUpdate?: (id: string, patch: {title: string, content: string, tags: string[]}) => void,
 *  onCancel?: () => void,
 * }} props
 */
export function NoteEditor({ mode, note, onCreate, onUpdate, onCancel }) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isEdit && note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTagsRaw((note.tags || []).join(", "));
      setTouched(false);
    }
    if (!isEdit) {
      setTitle("");
      setContent("");
      setTagsRaw("");
      setTouched(false);
    }
  }, [isEdit, note]);

  const tags = useMemo(() => parseTags(tagsRaw), [tagsRaw]);

  const titleError = touched && !title.trim() ? "Title is required." : "";
  const canSubmit = !!title.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const payload = {
      title: title.trim(),
      content,
      tags,
    };

    if (isEdit && note?.id && onUpdate) {
      onUpdate(note.id, payload);
      return;
    }
    if (!isEdit && onCreate) {
      onCreate(payload);
    }
  };

  return (
    <section className="panel panel--editor" aria-label={isEdit ? "Edit note" : "Create note"}>
      <header className="panel__header">
        <div>
          <h2 className="panel__title">{isEdit ? "Edit note" : "New note"}</h2>
          <p className="panel__subtitle">
            {isEdit ? "Update your note and save changes." : "Write something and save it locally."}
          </p>
        </div>

        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Title</span>
          <input
            className={`input ${titleError ? "input--error" : ""}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g., Meeting notes"
            maxLength={80}
            required
          />
          {titleError ? <span className="field__error">{titleError}</span> : null}
        </label>

        <label className="field">
          <span className="field__label">Tags (comma-separated)</span>
          <input
            className="input"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="e.g., work, ideas, todo"
            maxLength={120}
          />
          <span className="field__hint">{tags.length ? `Tags: ${tags.join(", ")}` : "Up to 12 tags."}</span>
        </label>

        <label className="field">
          <span className="field__label">Content</span>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={10}
          />
        </label>

        <div className="actions">
          <button type="submit" className={`btn btn--primary ${!canSubmit ? "btn--disabled" : ""}`} disabled={!canSubmit}>
            {isEdit ? "Save changes" : "Create note"}
          </button>
        </div>
      </form>
    </section>
  );
}
