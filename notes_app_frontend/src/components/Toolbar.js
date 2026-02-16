import React from "react";

/**
 * PUBLIC_INTERFACE
 * Toolbar for query, filter, sort controls.
 * @param {{
 *  query: string,
 *  onQueryChange: (q: string) => void,
 *  tag: string,
 *  tags: string[],
 *  onTagChange: (t: string) => void,
 *  sortBy: string,
 *  onSortChange: (s: string) => void,
 *  onNew: () => void,
 * }} props
 */
export function Toolbar({
  query,
  onQueryChange,
  tag,
  tags,
  onTagChange,
  sortBy,
  onSortChange,
  onNew,
}) {
  return (
    <section className="toolbar" aria-label="Search and filters">
      <div className="toolbar__row">
        <label className="toolbar__field">
          <span className="sr-only">Search notes</span>
          <input
            className="input input--search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search title, content, tags..."
          />
        </label>

        <label className="toolbar__field">
          <span className="sr-only">Filter by tag</span>
          <select className="select" value={tag} onChange={(e) => onTagChange(e.target.value)}>
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </label>

        <label className="toolbar__field">
          <span className="sr-only">Sort notes</span>
          <select className="select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="updatedDesc">Recently updated</option>
            <option value="updatedAsc">Least recently updated</option>
            <option value="createdDesc">Newest created</option>
            <option value="createdAsc">Oldest created</option>
            <option value="titleAsc">Title A → Z</option>
            <option value="titleDesc">Title Z → A</option>
          </select>
        </label>

        <button type="button" className="btn btn--primary" onClick={onNew}>
          + New
        </button>
      </div>
    </section>
  );
}
