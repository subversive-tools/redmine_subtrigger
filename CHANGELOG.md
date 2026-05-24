# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2026-05-24

### Added
- **Smart Linker (`>>`)**: multi-level link builder triggered by `>>` after a space or at line start
  - General links: E-Mail (`mailto:`), Weblink (auto-prefixes `https://`), Attachments (auto-detected from current issue/wiki page)
  - Project-specific links: Issues, Members, Wiki pages — with correct cross-project Textile syntax
  - Project list is prefetched 2 s after page load for instant panel opening
  - Keyboard navigation throughout (Arrow keys, Enter, Escape to go back)
- **`@`-mention improvement**: dropdown now opens immediately after `@` (no minimum character required); results capped at 10 for performance
- Smart Linker panel (`sl-*`) styles as a separate CSS file

### Changed
- Plugin renamed from `redmine_subcomplete` to `redmine_sublink`
  - Plugin identifier: `:redmine_subcomplete` → `:redmine_sublink`
  - Hook class: `MacroAutocompleteHook` → `SublinkerHook`
  - CSS classes: `.subcomplete-*` → `.sublink-*`
  - Internal JS properties: `_subcomplete*` → `_sublink*`
  - CSS file: `subcomplete.css` → `sublink.css`
- Hook now injects multiple CSS/JS files cleanly via `read_asset` helper
- Version bumped to `0.2.0`

### Fixed
- Macro dropdown is now `position: fixed` with `z-index: 99999` — no longer clipped by `overflow: hidden` ancestors
- Macro list height limited to ~4 visible items; detail panel shows full text without scroll limit
- Autocomplete now works in all wiki text areas (issues, notes, journals, news, forums) via extended selector and MutationObserver

## [0.1.0] - 2026-05-21

### Added
- Initial release: `{{` macro autocomplete for all Redmine wiki text areas
- Dropdown reuses Redmine's `.tribute-container` styles for visual consistency
- Detail panel shows full macro description for the selected entry
- Implicit macros `toc` and `child_pages` always included
- MutationObserver watches for dynamically added text areas
