const EDITOR_CLIENT_JS = String.raw`
(() => {
  'use strict';

  const tokenKey = 'site-editor-token:' + location.origin;
  const tokenPattern = /^[A-Za-z0-9_-]{32,}$/;
  let fragmentToken = '';
  try { fragmentToken = decodeURIComponent(location.hash.slice(1)); } catch {}
  const hasFragmentToken = location.hash.length > 1;
  const token = hasFragmentToken ? fragmentToken : (sessionStorage.getItem(tokenKey) || '');
  if (hasFragmentToken && tokenPattern.test(fragmentToken)) sessionStorage.setItem(tokenKey, fragmentToken);
  history.replaceState(null, '', location.pathname);
  const byId = (id) => document.getElementById(id);
  const fieldList = byId('field-list');
  const fieldEditor = byId('field-editor');
  const status = byId('status');
  const preview = byId('preview');
  const pageSelect = byId('page-select');
  const saveButton = byId('save');
  const undoButton = byId('undo');
  const redoButton = byId('redo');
  const resetButton = byId('reset');
  const pending = new Map();
  let state = null;
  let selectedPath = '';
  let actionInFlight = false;

  function announce(message, type = '') {
    status.textContent = message;
    status.dataset.type = type;
  }

  async function api(endpoint, payload = {}) {
    const response = await fetch('/__api/' + endpoint, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Site-Editor-Token': token,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({ error: 'Invalid server response.' }));
    if (!response.ok) throw new Error(data.error || ('Request failed (' + response.status + ').'));
    return data;
  }

  function currentValue(field) {
    return pending.has(field.path) ? pending.get(field.path) : field.value;
  }

  function updateButtons() {
    const hasPending = pending.size > 0;
    saveButton.disabled = actionInFlight || !hasPending;
    resetButton.disabled = actionInFlight || !hasPending;
    undoButton.disabled = actionInFlight || hasPending || !state?.canUndo;
    redoButton.disabled = actionInFlight || hasPending || !state?.canRedo;
    pageSelect.disabled = actionInFlight;
    for (const control of fieldList.querySelectorAll('button')) control.disabled = actionInFlight;
    for (const control of fieldEditor.querySelectorAll('input, textarea, button, select')) control.disabled = actionInFlight;
  }

  function fieldByPath(path) {
    return state?.fields.find((field) => field.path === path);
  }

  function selectField(path, focus = true, allowWhileBusy = false) {
    if (actionInFlight && !allowWhileBusy) return;
    const field = fieldByPath(path);
    if (!field) return;
    selectedPath = path;
    for (const button of fieldList.querySelectorAll('button[data-path]')) {
      button.setAttribute('aria-current', button.dataset.path === path ? 'true' : 'false');
    }
    fieldEditor.replaceChildren();
    const label = document.createElement('label');
    label.htmlFor = 'field-value';
    label.textContent = field.label;
    const control = field.kind === 'multiline' ? document.createElement('textarea') : document.createElement('input');
    control.id = 'field-value';
    control.value = currentValue(field);
    if (control instanceof HTMLInputElement) control.type = field.kind === 'image-src' ? 'url' : 'text';
    control.addEventListener('input', () => {
      if (control.value === field.value) pending.delete(field.path);
      else pending.set(field.path, control.value);
      updateButtons();
      announce(pending.size ? pending.size + ' unsaved change' + (pending.size === 1 ? '' : 's') + '.' : 'No unsaved changes.');
    });
    fieldEditor.append(label, control);

    if (field.kind === 'image-src') {
      const pickerLabel = document.createElement('label');
      pickerLabel.htmlFor = 'image-picker';
      pickerLabel.textContent = 'Choose a local raster image';
      const picker = document.createElement('input');
      picker.id = 'image-picker';
      picker.type = 'file';
      picker.accept = 'image/png,image/jpeg,image/webp,image/gif';
      picker.addEventListener('change', async () => {
        if (actionInFlight) return;
        const file = picker.files?.[0];
        if (!file) return;
        actionInFlight = true;
        updateButtons();
        try {
          announce('Preparing image…');
          const png = await rasterToPng(file);
          const response = await fetch('/__api/image', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'image/png',
              'X-Site-Editor-Token': token,
            },
            body: png,
          });
          const data = await response.json().catch(() => ({ error: 'Invalid server response.' }));
          if (!response.ok) throw new Error(data.error || 'Image was rejected.');
          control.value = data.path;
          pending.set(field.path, data.path);
          updateButtons();
          announce('Image prepared. Save to use it.');
          control.focus();
        } catch (error) {
          announce(error.message, 'error');
        } finally {
          picker.value = '';
          actionInFlight = false;
          updateButtons();
        }
      });
      fieldEditor.append(pickerLabel, picker);
    }
    if (focus) control.focus();
  }

  async function rasterToPng(file) {
    const maxFileBytes = 10 * 1024 * 1024;
    if (file.size > maxFileBytes) throw new Error('Choose an image no larger than 10 MiB.');
    const bitmap = await createImageBitmap(file);
    try {
      const maxDimension = 4096;
      const maxPixels = 16_000_000;
      const dimensionScale = maxDimension / Math.max(bitmap.width, bitmap.height);
      const pixelScale = Math.sqrt(maxPixels / (bitmap.width * bitmap.height));
      const scale = Math.min(1, dimensionScale, pixelScale);
      const width = Math.max(1, Math.floor(bitmap.width * scale));
      const height = Math.max(1, Math.floor(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) throw new Error('This browser cannot prepare images.');
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('The image could not be converted to PNG.');
      return blob;
    } finally {
      bitmap.close();
    }
  }

  function renderState(nextState, preserveSelection = true) {
    const previousPath = preserveSelection ? selectedPath : '';
    const previousPreview = pageSelect.value;
    state = nextState;
    fieldList.replaceChildren();
    for (const field of state.fields) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.path = field.path;
      button.textContent = field.label;
      button.addEventListener('click', () => selectField(field.path));
      fieldList.append(button);
    }
    pageSelect.replaceChildren();
    for (const page of state.pages) {
      const option = document.createElement('option');
      option.value = page.previewUrl;
      option.textContent = page.title;
      pageSelect.append(option);
    }
    if ([...pageSelect.options].some((option) => option.value === previousPreview)) pageSelect.value = previousPreview;
    const selected = fieldByPath(previousPath) ? previousPath : state.fields[0]?.path;
    if (selected) selectField(selected, false, true);
    updateButtons();
  }

  function attachPreview() {
    let doc;
    try { doc = preview.contentDocument; } catch { return; }
    if (!doc) return;
    doc.addEventListener('click', (event) => {
      const PreviewElement = doc.defaultView?.Element;
      const element = PreviewElement && event.target instanceof PreviewElement ? event.target.closest('[data-edit-path]') : null;
      const path = element?.getAttribute('data-edit-path');
      if (!path || !fieldByPath(path)) return;
      event.preventDefault();
      event.stopPropagation();
      selectField(path);
      announce('Selected “' + fieldByPath(path).label + '” from preview.');
    }, true);
  }

  async function save() {
    if (actionInFlight || !pending.size) return;
    const submitted = new Map(pending);
    actionInFlight = true;
    updateButtons();
    try {
      announce('Saving…');
      const nextState = await api('save', {
        sourceHash: state.sourceHash,
        changes: Array.from(submitted, ([path, value]) => ({ path, value })),
      });
      for (const [path, value] of submitted) {
        if (pending.get(path) === value) pending.delete(path);
      }
      renderState(nextState);
      preview.src = pageSelect.value;
      announce(pending.size ? 'Saved submitted changes. ' + pending.size + ' newer unsaved change' + (pending.size === 1 ? ' remains.' : 's remain.') : 'Saved. All pages were rendered.');
    } catch (error) {
      announce(error.message + ' Your changes are still pending.', 'error');
    } finally {
      actionInFlight = false;
      updateButtons();
    }
  }

  async function historyAction(action) {
    if (actionInFlight) return;
    if (pending.size) {
      announce('Save or reset pending changes before ' + action + '.', 'error');
      return;
    }
    actionInFlight = true;
    updateButtons();
    try {
      announce(action === 'undo' ? 'Undoing…' : 'Redoing…');
      const nextState = await api(action, { sourceHash: state.sourceHash });
      renderState(nextState);
      preview.src = pageSelect.value;
      announce(action === 'undo' ? 'Undo complete.' : 'Redo complete.');
    } catch (error) {
      announce(error.message, 'error');
    } finally {
      actionInFlight = false;
      updateButtons();
    }
  }

  pageSelect.addEventListener('change', () => {
    if (actionInFlight) return;
    preview.src = pageSelect.value;
  });
  preview.addEventListener('load', attachPreview);
  saveButton.addEventListener('click', save);
  undoButton.addEventListener('click', () => historyAction('undo'));
  redoButton.addEventListener('click', () => historyAction('redo'));
  resetButton.addEventListener('click', () => {
    if (actionInFlight) return;
    pending.clear();
    if (selectedPath) selectField(selectedPath, false);
    updateButtons();
    announce('Pending changes reset.');
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      save();
    }
  });

  if (!tokenPattern.test(token)) {
    announce('Open the exact editor URL printed by the server.', 'error');
    return;
  }
  api('state').then((initialState) => {
    renderState(initialState, false);
    preview.src = initialState.pages[0]?.previewUrl || 'about:blank';
    announce('Ready. Select a field or click highlighted content in the preview.');
  }).catch((error) => announce(error.message, 'error'));
})();
`;

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export function renderEditorUi({ nonce }) {
  const safeNonce = escapeAttribute(nonce);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Site visual editor</title>
  <style nonce="${safeNonce}">
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; color: #172033; background: #eef1f6; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    button, input, textarea, select { font: inherit; }
    button, select, input, textarea { border: 1px solid #aab2c2; border-radius: 8px; background: #fff; color: inherit; }
    button { min-height: 40px; padding: .55rem .8rem; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: .48; }
    button:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid #645cff; outline-offset: 2px; }
    header { display: flex; gap: .65rem; align-items: center; padding: .75rem; background: #172033; color: #fff; }
    header strong { margin-right: auto; }
    header button { border-color: #657089; background: #26324a; color: #fff; }
    header button#save { background: #695cff; border-color: #695cff; }
    main { display: grid; grid-template-columns: minmax(250px, 340px) 1fr; height: calc(100vh - 65px); }
    aside { display: grid; grid-template-rows: auto minmax(8rem, 1fr) auto auto; gap: .8rem; overflow: hidden; padding: .9rem; border-right: 1px solid #cbd1dc; background: #fff; }
    aside h1 { font-size: 1rem; margin: 0; }
    #field-list { display: grid; align-content: start; gap: .35rem; overflow: auto; padding: 3px; }
    #field-list button { text-align: left; }
    #field-list button[aria-current="true"] { border-color: #645cff; background: #eeecff; }
    #field-editor { display: grid; gap: .45rem; padding-top: .8rem; border-top: 1px solid #d9dde6; }
    #field-editor label { font-weight: 650; }
    #field-editor input, #field-editor textarea, #page-select { width: 100%; padding: .65rem; }
    #field-editor textarea { min-height: 8rem; resize: vertical; }
    #status { min-height: 2.5rem; margin: 0; font-size: .9rem; color: #4a5367; }
    #status[data-type="error"] { color: #a31d31; }
    .preview-wrap { padding: .9rem; min-width: 0; }
    iframe { width: 100%; height: 100%; border: 1px solid #aab2c2; border-radius: 10px; background: #fff; }
    @media (max-width: 760px) {
      header { flex-wrap: wrap; }
      main { grid-template-columns: 1fr; height: auto; }
      aside { max-height: 55vh; border-right: 0; border-bottom: 1px solid #cbd1dc; }
      .preview-wrap { height: 65vh; }
    }
  </style>
</head>
<body>
  <header>
    <strong>Site visual editor</strong>
    <button id="undo" type="button">Undo</button>
    <button id="redo" type="button">Redo</button>
    <button id="reset" type="button">Reset pending</button>
    <button id="save" type="button">Save</button>
  </header>
  <main>
    <aside aria-label="Editable fields">
      <div><h1>Fields</h1><label for="page-select">Preview page</label><select id="page-select"></select></div>
      <nav id="field-list" aria-label="Field list"></nav>
      <section id="field-editor" aria-label="Selected field"></section>
      <p id="status" role="status" aria-live="polite">Connecting…</p>
    </aside>
    <section class="preview-wrap" aria-label="Site preview">
      <iframe id="preview" title="Generated site preview" sandbox="allow-same-origin"></iframe>
    </section>
  </main>
  <script nonce="${safeNonce}">${EDITOR_CLIENT_JS}</script>
</body>
</html>`;
}
