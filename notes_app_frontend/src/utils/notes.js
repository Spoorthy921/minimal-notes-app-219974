/**
 * @typedef {import("../hooks/useLocalStorageNotes").Note} Note
 */

/**
 * @param {string} q
 * @returns {string}
 */
function normalizeQuery(q) {
  return (q || "").trim().toLowerCase();
}

/**
 * @param {Note} note
 * @returns {string}
 */
function noteSearchHaystack(note) {
  return `${note.title}\n${note.content}\n${(note.tags || []).join(" ")}`.toLowerCase();
}

/**
 * PUBLIC_INTERFACE
 * Return all unique tags across all notes, sorted alphabetically.
 * @param {Note[]} notes
 * @returns {string[]}
 */
export function getAllTags(notes) {
  const set = new Set();
  (notes || []).forEach((n) => (n.tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * PUBLIC_INTERFACE
 * Filter and sort notes.
 * @param {Note[]} notes
 * @param {{
 *  query: string,
 *  tag: string,
 *  sortBy: "updatedDesc" | "updatedAsc" | "createdDesc" | "createdAsc" | "titleAsc" | "titleDesc"
 * }} options
 * @returns {Note[]}
 */
export function selectNotes(notes, options) {
  const q = normalizeQuery(options.query);
  const tag = (options.tag || "").trim();

  const filtered = (notes || []).filter((n) => {
    if (tag && !(n.tags || []).includes(tag)) return false;
    if (!q) return true;
    return noteSearchHaystack(n).includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case "updatedAsc":
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case "createdDesc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "createdAsc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "titleDesc":
        return (b.title || "").localeCompare(a.title || "");
      case "titleAsc":
        return (a.title || "").localeCompare(b.title || "");
      case "updatedDesc":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  return sorted;
}

/**
 * PUBLIC_INTERFACE
 * Convert a comma-separated tag string to a normalized array.
 * @param {string} raw
 * @returns {string[]}
 */
export function parseTags(raw) {
  return (raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}
