# Redmine Sublink Plugin

![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)
![Redmine](https://img.shields.io/badge/Redmine-5.0%20%7C%206.0-red.svg?logo=redmine)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A Redmine plugin that brings smart autocomplete and linking to every wiki text area — macros, mentions, and a powerful multi-level Finder-style link builder.

> Built for teams who write a lot of Redmine text and want fast, discoverable links without remembering syntax.

## Features

- **`>>` — Finder-Style Smart Linker**: A premium macOS Finder column-style popover to build any link without knowing the syntax:
  - 🔗 **General links**: E-Mail (`mailto:`), Web URL (absolute prefixing), and current page attachments
  - 📁 **Hierarchical Project Navigation**: Indented subproject tree sorting with parent context retention
  - 📂 **Multi-Level Cascading Columns**: Projects list $\rightarrow$ Subpages list (Issues, Wiki, Members, Files, etc.) $\rightarrow$ Sub-items list
  - 🗂️ **Dynamic Project Files Support**: Fetches and formats project-wide files via JSON API
  - ⚙️ **Tab-Triggered Link Editing**: Place caret cursor on any link (Markdown, Textile, Double Brackets, raw attachments/issues) and press `Tab` to instantly reopen the Smart Linker cascaded at that exact item!
  - 🎨 **Beautiful Custom Wireframe SVGs**: Delicate, outline wireframe monochrome icons (14px centered) matching Redmine's `/admin` UI style, dynamically turning white on row focus.
- **`{{` — Macro Autocomplete**: Type `{{` to get a dropdown of all available Redmine macros with descriptions and a full detail preview panel.
- **`@` — Instant Mention Dropdown**: Shows up immediately after `@` (no minimum character required) for extremely fast user tagging.
- **100% Dynamic Core Redmine Localization**: Translates all subpage titles, search terms, and backtracking autotexts completely on the fly based on Redmine's Ruby core locale dictionary. Fully supports English, German (disambiguating duplicate files/attachments to *"Dateien"* / *"Anhänge"*), French, Spanish, Japanese, and more.

All features work in **every wiki text area**: wiki pages, issue descriptions, issue notes, journal edits, news comments, forum messages, and project/document descriptions.

## Requirements

- Redmine 5.0 or higher

## Installation

> [!IMPORTANT]
> The plugin directory **MUST** be named `redmine_sublink` for the hook to load correctly.

1. **Clone** into your plugins directory:

   ```bash
   cd /path/to/redmine/plugins
   git clone https://github.com/subversive-tools/redmine_sublink.git redmine_sublink
   ```

2. **Restart Redmine** (no migrations required).

## Usage

### `{{` — Macro Autocomplete

Type `{{` anywhere in a wiki text area. A dropdown appears listing all available macros with a short description. Use arrow keys to navigate, `Tab` or `Enter` to insert.

The detail panel below the list shows the full macro description for the currently selected entry.

### `@` — Instant Mention

Type `@` at the start of a word. The member dropdown opens immediately (unlike Redmine's default which requires at least one character). Type to filter; only the first 10 members are shown.

### `>>` — Smart Linker

Type `>>` after a space or at the start of a line. An ultra-compact Finder-style column opens, showing one active navigation column at a time (width 280px) and following your cursor.

#### Intermediate Level Navigation
- **ArrowUp / ArrowDown**: Navigate through list items in the active column.
- **Tab / Enter / ArrowRight (`→`)**: Expand the highlighted intermediate item (project or subpage branch), appending a `>` delimiter (e.g. `>>myproject>Tickets>`) and cascading to the next adjacent column.
- **Escape (`Esc`) / ArrowLeft (`←`) / Shift+Tab**: Backtrack one column level to the left, safely reverting the path and restoring the highlighted parent selection without closing the panel.

#### Leaf Level Finalization
- **ArrowRight (`→`) / Tab**: On leaf items (Column 3 items or subpages in Column 2 that have no submenu like Overview, Calendar, Gantt, etc.), `Tab` and `ArrowRight` do nothing, keeping your typed query pristine.
- **Enter / Return** (or mouse click): Instantly converts the query to the clean, finalized Textile/Markdown link and inserts it directly at the cursor, closing the panel.

#### Round-trip Link Editing
If the caret is inside any Markdown link, Textile link, double-bracket wiki link (`[[Page]]`), attachment shorthand (`attachment:file.ext`), or issue shorthand (`#123` or `project#123`), pressing `Tab` while the panel is closed will automatically:
1. Scan and detect the link under the cursor.
2. Replace it with the corresponding `>>` path query.
3. Automatically look up project context (using the page URL, active menu items, or header breadcrumbs like `#header h1 a`).
4. Re-open the Smart Linker right at that item's column with the search term pre-loaded!

## How It Works

The plugin injects a single `<style>` and `<script>` block into every Redmine page via a `ViewListener` hook. No external dependencies or bloated JavaScript frameworks. All assets are read from disk on each request, making browser reload sufficient after updating plugin files.

The project list is prefetched 2 seconds after page load so the Smart Linker panel opens instantly.

## Contributing

Contributions are welcome — please fork the repository and open a Pull Request.

1. Fork it
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

[MIT License](LICENSE) — Copyright (c) 2026 Stefan Mischke
