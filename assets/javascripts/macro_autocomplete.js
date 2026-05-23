(function () {
  'use strict';

  var MACROS = [];

  // ── DOM elements ─────────────────────────────────────────────────────────────

  var dropdown  = null;
  var macList   = null;
  var macDetail = null;
  var activeTextarea = null;
  var selectedIndex  = -1;

  function createDropdown() {
    var el = document.createElement('div');
    el.id = 'macro-autocomplete';
    el.setAttribute('role', 'listbox');
    el.style.display = 'none';

    macList   = document.createElement('div');
    macList.className = 'mac-list';

    macDetail = document.createElement('div');
    macDetail.className = 'mac-detail';
    macDetail.style.display = 'none';

    el.appendChild(macList);
    el.appendChild(macDetail);
    document.body.appendChild(el);

    el.addEventListener('mousedown', function (e) {
      e.preventDefault(); // keep textarea focused
    });

    return el;
  }

  // ── Attach to a textarea ────────────────────────────────────────────────────

  function attach(textarea) {
    textarea.addEventListener('input', onInput);
    textarea.addEventListener('keydown', onKeydown);
    textarea.addEventListener('blur', function () {
      setTimeout(hide, 150);
    });
    textarea.addEventListener('click', onInput);
  }

  function onInput() {
    activeTextarea = this;
    var query = getQuery(this);
    if (query === null) { hide(); return; }
    render(query);
  }

  // ── Query extraction ────────────────────────────────────────────────────────

  function getQuery(textarea) {
    var before = textarea.value.substring(0, textarea.selectionStart);
    // Allow non-}} chars after the name so the dropdown stays open while typing args
    var m = before.match(/\{\{(\w*)([^}]*)$/);
    return m ? m[1].toLowerCase() : null;
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  function render(query) {
    var filtered = MACROS.filter(function (m) {
      return m.name.indexOf(query) === 0;
    });

    if (filtered.length === 0) { hide(); return; }

    macList.innerHTML = filtered.map(function (m) {
      return '<div class="mac-item" role="option"' +
               ' data-macro="' + esc(m.name) + '"' +
               ' data-detail="' + esc(m.detail || m.desc || '') + '">' +
               '<span class="mac-name">{{' + esc(m.name) + '}}</span>' +
               (m.desc ? '<span class="mac-desc">' + esc(truncate(m.desc, 72)) + '</span>' : '') +
             '</div>';
    }).join('');

    macList.querySelectorAll('.mac-item').forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        var items = macList.querySelectorAll('.mac-item');
        items.forEach(function (i, idx) {
          if (i === item) selectedIndex = idx;
        });
        updateHighlight(items);
      });

      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        insertMacro(activeTextarea, this.dataset.macro);
        hide();
        activeTextarea.focus();
      });
    });

    macDetail.style.display = 'none';
    macDetail.textContent   = '';
    selectedIndex = -1;

    // Auto-select and show detail when the query is an exact macro name
    if (filtered.length === 1 && filtered[0].name === query) {
      selectedIndex = 0;
    }

    position(activeTextarea);
    dropdown.style.display = 'block';

    if (selectedIndex >= 0) {
      updateHighlight(macList.querySelectorAll('.mac-item'));
    }
  }

  // ── Keyboard handling ───────────────────────────────────────────────────────

  function onKeydown(e) {
    if (dropdown.style.display === 'none') return;

    var items = macList.querySelectorAll('.mac-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateHighlight(items);

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateHighlight(items);

    } else if (e.key === 'Tab' || e.key === 'Enter') {
      var target = selectedIndex >= 0 ? items[selectedIndex]
                 : items.length === 1  ? items[0]
                 : null;
      if (target) {
        e.preventDefault();
        insertMacro(this, target.dataset.macro);
        hide();
      }

    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    }
  }

  function updateHighlight(items) {
    items.forEach(function (item, i) {
      var selected = i === selectedIndex;
      item.classList.toggle('mac-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });

    var activeItem = items[selectedIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
      showDetail(activeItem.dataset.detail || '');
    } else {
      hideDetail();
    }
  }

  // ── Detail panel ────────────────────────────────────────────────────────────

  function showDetail(text) {
    if (!text) { hideDetail(); return; }
    macDetail.textContent   = text;
    macDetail.style.display = 'block';
  }

  function hideDetail() {
    macDetail.style.display = 'none';
    macDetail.textContent   = '';
  }

  // ── Macro insertion ─────────────────────────────────────────────────────────

  function insertMacro(textarea, name) {
    var val    = textarea.value;
    var pos    = textarea.selectionStart;
    var before = val.substring(0, pos);
    var after  = val.substring(pos);

    var m = before.match(/\{\{(\w*)$/);
    if (!m) return;

    var start   = pos - m[0].length;
    var snippet = '{{' + name + '}}';
    textarea.value = before.substring(0, start) + snippet + after;

    var newPos = start + snippet.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Positioning (mirror-div technique) ──────────────────────────────────────

  function position(textarea) {
    var cursorPos = measureCursorOffset(textarea);
    var taRect    = textarea.getBoundingClientRect();
    var scrollX   = window.pageXOffset;
    var scrollY   = window.pageYOffset;

    var left = taRect.left + scrollX + cursorPos.left;
    var top  = taRect.top  + scrollY + cursorPos.top + cursorPos.lineHeight + 2;

    var maxLeft = scrollX + window.innerWidth - 360;
    left = Math.min(left, maxLeft);

    dropdown.style.left = left + 'px';
    dropdown.style.top  = top  + 'px';
  }

  function measureCursorOffset(textarea) {
    var style = window.getComputedStyle(textarea);

    var mirror = document.createElement('div');
    var props  = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
                  'letterSpacing', 'lineHeight', 'textTransform',
                  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                  'boxSizing', 'wordWrap', 'overflowWrap', 'whiteSpace'];
    props.forEach(function (p) { mirror.style[p] = style[p]; });

    mirror.style.position   = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.top        = '-9999px';
    mirror.style.left       = '-9999px';
    mirror.style.width      = textarea.clientWidth + 'px';
    mirror.style.height     = 'auto';
    mirror.style.overflow   = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';

    mirror.textContent = textarea.value.substring(0, textarea.selectionStart);

    var cursor = document.createElement('span');
    cursor.textContent = '​'; // zero-width space
    mirror.appendChild(cursor);
    document.body.appendChild(mirror);

    var lineHeight = parseInt(style.lineHeight) || parseInt(style.fontSize) + 4;
    var result = {
      left:       cursor.offsetLeft - textarea.scrollLeft,
      top:        cursor.offsetTop  - textarea.scrollTop,
      lineHeight: lineHeight
    };

    document.body.removeChild(mirror);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function hide() {
    dropdown.style.display = 'none';
    hideDetail();
    selectedIndex = -1;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '…' : str;
  }

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    MACROS = (window.REDMINE_MACROS || []);
    if (MACROS.length === 0) return;

    dropdown = createDropdown();

    document.querySelectorAll('textarea.wiki-edit').forEach(attach);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches('textarea.wiki-edit')) attach(node);
          if (node.querySelectorAll) node.querySelectorAll('textarea.wiki-edit').forEach(attach);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
