(function () {
  'use strict';

  var MACROS = [];
  var dropdown, macList, macDetail;
  var selectedIndex = -1;
  var activeTextarea = null;

  // ── Create DOM ──────────────────────────────────────────────────────────────

  function createDropdown() {
    var d = document.createElement('div');
    // Reuse Redmine's existing .tribute-container styles (tribute-5.1.3.css + application.css)
    d.className = 'tribute-container subcomplete-container';
    d.style.display = 'none';
    d.setAttribute('role', 'listbox');

    macList = document.createElement('ul');
    d.appendChild(macList);

    macDetail = document.createElement('div');
    macDetail.className = 'subcomplete-detail';
    macDetail.style.display = 'none';
    d.appendChild(macDetail);

    document.body.appendChild(d);
    return d;
  }

  // ── Attach to textarea ───────────────────────────────────────────────────────

  function attach(textarea) {
    if (textarea._subcompleteBound) return;
    textarea._subcompleteBound = true;

    textarea.addEventListener('input', function () { onInput(this); });
    textarea.addEventListener('keydown', onKeydown.bind(textarea));
    textarea.addEventListener('blur', function () {
      setTimeout(hide, 150);
    });
  }

  function onInput(textarea) {
    activeTextarea = textarea;
    var val    = textarea.value;
    var pos    = textarea.selectionStart;
    var before = val.substring(0, pos);
    var m      = before.match(/\{\{(\w*)$/);
    if (!m) { hide(); return; }
    render(m[1], textarea);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  function render(query, textarea) {
    var filtered = MACROS.filter(function (m) {
      return m.name.indexOf(query) === 0;
    });

    if (filtered.length === 0) { hide(); return; }

    macList.innerHTML = filtered.map(function (m, i) {
      return '<li data-index="' + i + '"' +
               ' data-macro="' + esc(m.name) + '"' +
               ' data-detail="' + esc(m.detail || m.desc || '') + '"' +
               ' role="option">' +
               '<span>{{' + esc(m.name) + '}}</span>' +
               (m.desc ? ' <em>' + esc(truncate(m.desc, 72)) + '</em>' : '') +
             '</li>';
    }).join('');

    macList.querySelectorAll('li').forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        selectedIndex = parseInt(this.dataset.index);
        updateHighlight(macList.querySelectorAll('li'));
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

    // Auto-select when query matches exactly one macro
    if (filtered.length === 1 && filtered[0].name === query) {
      selectedIndex = 0;
    }

    position(textarea);
    dropdown.style.display = 'block';

    if (selectedIndex >= 0) {
      updateHighlight(macList.querySelectorAll('li'));
    }
  }

  // ── Keyboard handling ────────────────────────────────────────────────────────

  function onKeydown(e) {
    if (dropdown.style.display === 'none') return;

    var items = macList.querySelectorAll('li');

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
      item.classList.toggle('highlight', selected);
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

  // ── Detail panel ─────────────────────────────────────────────────────────────

  function showDetail(text) {
    if (!text) { hideDetail(); return; }
    macDetail.textContent   = text;
    macDetail.style.display = 'block';
  }

  function hideDetail() {
    macDetail.style.display = 'none';
    macDetail.textContent   = '';
  }

  // ── Macro insertion ──────────────────────────────────────────────────────────

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

  // ── Positioning (mirror-div technique) ───────────────────────────────────────

  function position(textarea) {
    var cursorPos = measureCursorOffset(textarea);
    var taRect    = textarea.getBoundingClientRect();
    var scrollX   = window.pageXOffset;
    var scrollY   = window.pageYOffset;

    var left = taRect.left + scrollX + cursorPos.left;
    var top  = taRect.top  + scrollY + cursorPos.top + cursorPos.lineHeight + 2;

    var maxLeft = scrollX + window.innerWidth - 380;
    left = Math.min(left, maxLeft);

    dropdown.style.left = left + 'px';
    dropdown.style.top  = top  + 'px';
  }

  function measureCursorOffset(textarea) {
    var style = window.getComputedStyle(textarea);
    var props = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
                 'letterSpacing', 'lineHeight', 'textTransform',
                 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                 'boxSizing', 'wordWrap', 'overflowWrap', 'whiteSpace'];

    var mirror = document.createElement('div');
    props.forEach(function (p) { mirror.style[p] = style[p]; });
    mirror.style.position   = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.top        = '-9999px';
    mirror.style.left       = '-9999px';
    mirror.style.width      = textarea.clientWidth + 'px';
    mirror.style.height     = 'auto';
    mirror.style.overflow   = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.textContent      = textarea.value.substring(0, textarea.selectionStart);

    var cursor = document.createElement('span');
    cursor.textContent = '\u200b'; // zero-width space
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

  // ── Helpers ──────────────────────────────────────────────────────────────────

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

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    MACROS = (window.REDMINE_MACROS || []);
    if (MACROS.length === 0) return;

    dropdown = createDropdown();

    document.querySelectorAll('textarea.wiki-edit').forEach(attach);

    // Watch for dynamically added textareas (e.g. preview toggle)
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
