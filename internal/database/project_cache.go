package database

// ProjectCache manages the materialized project state from events.
// Location: ~/.local/share/openreview/cache/<project-id>/state.sqlite
// This cache is disposable and rebuildable from the project directory.
