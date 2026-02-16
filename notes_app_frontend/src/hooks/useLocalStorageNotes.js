import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "notes_app.notes.v1";

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string[]} tags
 * @property {string} createdAt ISO string
 * @property {string} updatedAt ISO string
 */

/**
 * Best-effort parse with guardrails for corrupted localStorage.
 * @param {string|null} raw
 * @returns {unknown}
 */
function safeJsonParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Normalize/migrate notes coming from storage to the current schema.
 * @param {unknown} data
 * @returns {Note[]}
 */
function coerceNotesArray(data) {
  if (!Array.isArray(data)) return [];
  const nowIso = new Date().toISOString();

  return data
    .map((n) => {
      if (!n || typeof n !== "object") return null;
      const obj = /** @type {any} */ (n);

      const id = typeof obj.id === "string" ? obj.id : null;
      if (!id) return null;

      const title = typeof obj.title === "string" ? obj.title : "";
      const content = typeof obj.content === "string" ? obj.content : "";

      const tags = Array.isArray(obj.tags)
        ? obj.tags.filter((t) => typeof t === "string").map((t) => t.trim()).filter(Boolean)
        : [];

      const createdAt = typeof obj.createdAt === "string" ? obj.createdAt : nowIso;
      const updatedAt = typeof obj.updatedAt === "string" ? obj.updatedAt : createdAt;

      return { id, title, content, tags, createdAt, updatedAt };
    })
    .filter(Boolean);
}

/**
 * Create a reasonably unique id without adding dependencies.
 * @returns {string}
 */
function createId() {
  return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * PUBLIC_INTERFACE
 * React hook that manages notes persisted in localStorage.
 * Returns notes + CRUD operations. All updates are mirrored to localStorage.
 * @returns {{
 *   notes: Note[],
 *   createNote: (partial: {title: string, content: string, tags: string[]}) => string,
 *   updateNote: (id: string, patch: {title?: string, content?: string, tags?: string[]}) => void,
 *   deleteNote: (id: string) => void,
 *   clearAllNotes: () => void
 * }}
 */
export function useLocalStorageNotes() {
  const [notes, setNotes] = useState(() => {
    const parsed = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
    return coerceNotesArray(parsed);
  });

  // Persist on change
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const api = useMemo(() => {
    const createNote = (partial) => {
      const nowIso = new Date().toISOString();
      const id = createId();
      const next = {
        id,
        title: partial.title ?? "",
        content: partial.content ?? "",
        tags: Array.isArray(partial.tags) ? partial.tags : [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setNotes((prev) => [next, ...prev]);
      return id;
    };

    const updateNote = (id, patch) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = {
            ...n,
            ...patch,
            // ensure tags stays array
            tags: patch.tags ? patch.tags : n.tags,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        })
      );
    };

    const deleteNote = (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    };

    const clearAllNotes = () => {
      setNotes([]);
    };

    return { createNote, updateNote, deleteNote, clearAllNotes };
  }, []);

  return { notes, ...api };
}
