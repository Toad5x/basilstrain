// ============================================================
// WINDOW MANAGEMENT
// ============================================================
const minimized = {};
const taskbarButtons = {};
let zCounter = 100;

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000);

function openWindow(id) {
  const win = document.getElementById(id);
  win.classList.remove('hidden');
  win.style.display = 'flex';
  minimized[id] = false;
  bringToFront(id);
  if (!taskbarButtons[id]) createTaskbarBtn(id);
  updateTaskbarBtn(id);
  closeMenus();
  if (id === 'my-docs') ncRender('');
}

function closeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
  win.classList.add('hidden');
  minimized[id] = false;
  if (taskbarButtons[id]) {
    taskbarButtons[id].remove();
    delete taskbarButtons[id];
  }
}

function minimizeWindow(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
  minimized[id] = true;
  updateTaskbarBtn(id);
}

function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (win.dataset.maximized === '1') {
    win.style.left   = win.dataset.ox;
    win.style.top    = win.dataset.oy;
    win.style.width  = win.dataset.ow;
    win.style.height = win.dataset.oh;
    win.dataset.maximized = '0';
  } else {
    win.dataset.ox = win.style.left;
    win.dataset.oy = win.style.top;
    win.dataset.ow = win.style.width;
    win.dataset.oh = win.style.height;
    win.style.left   = '0';
    win.style.top    = '0';
    win.style.width  = '100vw';
    win.style.height = 'calc(100vh - 30px)';
    win.dataset.maximized = '1';
  }
}

function bringToFront(id) {
  zCounter++;
  document.getElementById(id).style.zIndex = zCounter;
  document.querySelectorAll('.title-bar').forEach(tb => {
    const isActive = tb.closest('.window').id === id;
    tb.classList.toggle('active-bar',   isActive);
    tb.classList.toggle('inactive-bar', !isActive);
  });
  Object.keys(taskbarButtons).forEach(wid => {
    taskbarButtons[wid].classList.toggle('active', wid === id);
  });
}

function createTaskbarBtn(id) {
  const titles = {
    'my-computer': '🖥 My Computer',
    'my-docs':     '📁 My Documents',
    'ie':          '🌐 Internet Explorer',
    'notepad':     '📝 Notepad',
    'pic-viewer':  '🖼️ Picture Viewer',
    'help':        '❓ Windows Help',
    'search':      '🔍 Search Results',
    'control-panel': '⚙️ Control Panel',
  };
  const btn = document.createElement('div');
  btn.className = 'taskbar-btn';
  btn.textContent = titles[id] || id;
  btn.onclick = () => {
    const win = document.getElementById(id);
    if (minimized[id]) {
      win.style.display = 'flex';
      minimized[id] = false;
      bringToFront(id);
    } else {
      const current = parseInt(win.style.zIndex || 0);
      if (current === zCounter) minimizeWindow(id);
      else bringToFront(id);
    }
  };
  document.getElementById('taskbar-buttons').appendChild(btn);
  taskbarButtons[id] = btn;
}

function updateTaskbarBtn(id) {
  if (taskbarButtons[id]) taskbarButtons[id].classList.toggle('active', !minimized[id]);
}

// ── DRAG & RESIZE ──
let dragWin = null, dragOX = 0, dragOY = 0;
let resizeWin = null, resizeOX = 0, resizeOY = 0, resizeOW = 0, resizeOH = 0;

function startDrag(e, id) {
  dragWin = id;
  bringToFront(id);
  const win = document.getElementById(id);
  dragOX = e.clientX - win.offsetLeft;
  dragOY = e.clientY - win.offsetTop;
  e.preventDefault();
}

document.addEventListener('mousemove', e => {
  if (dragWin) {
    const win = document.getElementById(dragWin);
    win.style.left = Math.max(0, e.clientX - dragOX) + 'px';
    win.style.top  = Math.max(0, Math.min(e.clientY - dragOY, window.innerHeight - 50)) + 'px';
  }
  if (resizeWin) {
    const win = document.getElementById(resizeWin);
    win.style.width  = Math.max(200, resizeOW + (e.clientX - resizeOX)) + 'px';
    win.style.height = Math.max(100, resizeOH + (e.clientY - resizeOY)) + 'px';
  }
});

document.addEventListener('mouseup', () => { dragWin = null; resizeWin = null; });

// ── RESIZE ──
function startResize(e, id) {
  resizeWin = id;
  const win = document.getElementById(id);
  resizeOX = e.clientX; resizeOY = e.clientY;
  resizeOW = win.offsetWidth; resizeOH = win.offsetHeight;
  e.preventDefault(); e.stopPropagation();
}

// ── START MENU ──
function toggleStartMenu(e) {
  e.stopPropagation();
  document.getElementById('start-menu').classList.toggle('visible');
}

function closeMenus() {
  document.getElementById('start-menu').classList.remove('visible');
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('visible'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', closeMenus);

// ── DROPDOWN MENUS ──
function toggleDropdown(id) {
  event.stopPropagation();
  const dd = document.getElementById(id);
  const wasVisible = dd.classList.contains('visible');
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('visible'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('open'));
  if (!wasVisible) {
    dd.classList.add('visible');
    dd.closest('.menu-item').classList.add('open');
  }
}

// ── FILE / ICON SELECTION ──
function selectFile(el) {
  el.closest('.window-content, .window').querySelectorAll('.file-item.selected').forEach(f => f.classList.remove('selected'));
  el.classList.add('selected');
}
function selectIcon(el) {
  document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
}

// ── BSOD ──
function triggerBSOD() {
  closeMenus();
  document.getElementById('bsod').classList.add('visible');
}
function hideBSOD() {
  document.getElementById('bsod').classList.remove('visible');
}
document.addEventListener('keydown', e => {
  if (document.getElementById('bsod').classList.contains('visible')) hideBSOD();
});

// ============================================================
// NEOCITIES FILE BROWSER
// ============================================================
// UPDATE THIS LIST when you add/remove files on your site.
// type: 'file' or 'directory'
// size: in bytes (optional, shown as tooltip)
// path: relative to your site root — no leading slash
// ============================================================
const NEOCITIES_FILES = [
  { path: 'index.html',    type: 'file', size: 512  },
  { path: 'images/neocities.png', type: 'file', size: 6793 },
  { path: 'about.txt', type: 'file', size: 254 },
  { path: 'chant.html', type: 'file', size: 512 },
  { path: 'wallpapers', type: 'directory' },
  { path: 'wallpapers/Blue_Lace_16.png', type: 'file', size: 595 },
  { path: 'wallpapers/Fly_Away.jpg', type: 'file', size: 4684 },
  { path: 'wallpapers/Ocean_Wave.jpg', type: 'file', size: 74169 },
  { path: 'wallpapers/Prairie_Wind.png', type: 'file', size: 63706 },
  { path: 'wallpapers/Soap_Bubbles.png', type: 'file', size: 41043 },
  { path: 'wallpapers/Solar_Eclipse_(Windows_2000).jpg', type: 'file', size: 25382 },
  { path: 'wallpapers/Water_Color.jpg', type: 'file', size: 23923 },
  { path: 'wallpapers/Windows_2000.jpg', type: 'file', size: 129831 },
  { path: 'wallpapers/Zapotec.png', type: 'file', size: 7157 },
];

const SITE_ROOT = 'https://basilstrain.neocities.org/';
let ncCurrentPath = '';
let ncHistory = [];

function ncExtIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    html: '🌐', htm: '🌐',
    css:  '🎨',
    js:   '📜',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', bmp: '🖼️', svg: '🖼️', webp: '🖼️', ico: '🖼️',
    mp3: '🎵', wav: '🎵', ogg: '🎵', flac: '🎵',
    mp4: '🎬', webm: '🎬', avi: '🎬',
    pdf: '📕',
    txt: '📝', md: '📝',
    zip: '🗜️', gz: '🗜️', rar: '🗜️',
    ttf: '🔤', woff: '🔤', woff2: '🔤',
    json: '📋', xml: '📋',
  };
  return map[ext] || '📄';
}

function ncFormatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function ncRender(path) {
  ncCurrentPath = path;
  document.getElementById('nc-address').value = SITE_ROOT + path;
  document.getElementById('my-docs-title').textContent =
    '📁 ' + (path === '' ? 'basilstrain — Neocities' : path);

  const items = NEOCITIES_FILES.filter(f => {
    if (path === '') {
      return f.path.split('/').length === 1;
    } else {
      if (!f.path.startsWith(path + '/')) return false;
      return !f.path.slice(path.length + 1).includes('/');
    }
  });

  document.getElementById('nc-filecount').textContent = '📄 ' + items.length + ' file' + (items.length !== 1 ? 's' : '');
  document.getElementById('nc-status').textContent    = items.length + ' object' + (items.length !== 1 ? 's' : '');

  const pane = document.getElementById('nc-file-pane');
  if (items.length === 0) {
    pane.innerHTML = '<div style="padding:16px;color:#666;font-size:11px;">This folder is empty.</div>';
    return;
  }

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  const grid = document.createElement('div');
  grid.className = 'file-grid';

  items.forEach(f => {
    const name  = f.path.split('/').pop();
    const isDir = f.type === 'directory';
    const icon  = isDir ? '📁' : ncExtIcon(name);
    const url   = SITE_ROOT + f.path;

    const el = document.createElement('div');
    el.className = 'file-item';
    el.innerHTML = `<div class="icon">${icon}</div><span>${name}</span>`;
    if (f.size) el.title = name + '\n' + ncFormatSize(f.size);

    el.onclick    = () => selectFile(el);
    el.ondblclick = () => {
      if (isDir) { ncHistory.push(ncCurrentPath); ncRender(f.path); }
      else ncOpenFile(url, name);
    };
    grid.appendChild(el);
  });

  pane.innerHTML = '';
  pane.appendChild(grid);
}

function ncOpenFile(url, name) {
  const ext = name.split('.').pop().toLowerCase();
  const imageExts = ['png','jpg','jpeg','gif','bmp','svg','webp','ico'];
  const htmlExts  = ['html','htm'];
  const textExts  = ['txt','md','css','js','json','xml','csv','log','ini','cfg'];

  if (imageExts.includes(ext))     openPictureViewer(url, name);
  else if (htmlExts.includes(ext)) { ieNavigateTo(url); openWindow('ie'); }
  else if (textExts.includes(ext)) openInNotepad(url, name);
  else window.open(url, '_blank');
}

function ncBack() { if (ncHistory.length > 0) ncRender(ncHistory.pop()); }

function ncUp() {
  if (ncCurrentPath === '') return;
  const parts = ncCurrentPath.split('/');
  parts.pop();
  ncHistory.push(ncCurrentPath);
  ncRender(parts.join('/'));
}

// ============================================================
// INTERNET EXPLORER
// ============================================================
const IE_HOME = 'https://www.wikipedia.org/';

function ieNavigate(e) {
  if (e.key !== 'Enter') return;
  ieNavigateTo(document.getElementById('ie-address').value.trim());
}

function ieNavigateTo(url) {
  if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('/') && url.includes('.') && !/\.(html?|txt)$/i.test(url.split(/[?#]/)[0])) url = 'https://' + url;
  document.getElementById('ie-status').textContent  = '⏳ Loading...';
  document.getElementById('ie-address').value = url;
  document.getElementById('ie-frame').src = url;
}

function ieFrameLoaded() {
  document.getElementById('ie-status').textContent = '✅ Done';
  try {
    const title = document.getElementById('ie-frame').contentDocument?.title;
    if (title) document.querySelector('#ie .title-bar-text').textContent = title + ' - Windows Internet Explorer';
  } catch(e) { /* cross-origin */ }
}

document.getElementById('ie-frame').addEventListener('load', ieFrameLoaded);
document.getElementById('ie-frame').addEventListener('error', ieFrameError);

function ieFrameError() { document.getElementById('ie-status').textContent = '❌ Cannot display page'; }
function ieBack()    { document.getElementById('ie-frame').contentWindow.history.back(); }
function ieForward() { document.getElementById('ie-frame').contentWindow.history.forward(); }
function ieStop()    { document.getElementById('ie-frame').contentWindow.stop(); document.getElementById('ie-status').textContent = '✋ Stopped'; }
function ieRefresh() { document.getElementById('ie-frame').contentWindow.location.reload(); document.getElementById('ie-status').textContent = '⏳ Loading...'; }
function ieHome()    { ieNavigateTo(IE_HOME); }

// ============================================================
// RUN DIALOG
// ============================================================
// Dialogs reuse the .window machinery but get no taskbar button.
function openDialog(id) {
  const win = document.getElementById(id);
  win.classList.remove('hidden');
  win.style.display = 'flex';
  bringToFront(id);
  closeMenus();
}
function closeDialog(id) {
  const win = document.getElementById(id);
  win.style.display = 'none';
  win.classList.add('hidden');
}

function openRun() {
  openDialog('run-dialog');
  const input = document.getElementById('run-input');
  input.focus();
  input.select();
}
function closeRun() { closeDialog('run-dialog'); }

function runKey(e) {
  if (e.key === 'Enter')  runOpen();
  if (e.key === 'Escape') closeRun();
}

const RUN_PROGRAMS = {
  'notepad':        () => openWindow('notepad'),
  'notepad.exe':    () => openWindow('notepad'),
  'iexplore':       () => openWindow('ie'),
  'iexplore.exe':   () => openWindow('ie'),
  'explorer':       () => openWindow('my-docs'),
  'explorer.exe':   () => openWindow('my-docs'),
  'my documents':   () => openWindow('my-docs'),
  'mydocuments':    () => openWindow('my-docs'),
  'my computer':    () => openWindow('my-computer'),
  'mycomputer':     () => openWindow('my-computer'),
  'help':           () => openWindow('help'),
  'chant':          () => { ieNavigateTo(SITE_ROOT + 'chant.html'); openWindow('ie'); },
};

function runOpen() {
  const cmd = document.getElementById('run-input').value.trim();
  if (!cmd) return;
  const key = cmd.toLowerCase();

  if (RUN_PROGRAMS[key]) {
    RUN_PROGRAMS[key]();
  } else if (/^(https?:\/\/|www\.)/i.test(cmd)) {
    ieNavigateTo(/^www\./i.test(cmd) ? 'https://' + cmd : cmd);
    openWindow('ie');
  } else {
    const path = key.replace(/^\//, '');
    const file = NEOCITIES_FILES.find(f => f.type === 'file' && f.path.toLowerCase() === path);
    if (!file) {
      document.getElementById('run-error-title').textContent = cmd;
      document.getElementById('run-error-msg').textContent =
        "Windows cannot find '" + cmd + "'. Make sure you typed the name correctly, and then try again.";
      closeRun();
      openDialog('run-error');
      return;
    }
    ncOpenFile(SITE_ROOT + file.path, file.path.split('/').pop());
  }
  document.getElementById('run-input').value = '';
  closeRun();
}

// ============================================================
// DISPLAY PROPERTIES / CONTROL PANEL
// ============================================================
const DESKTOP_COLORS = [
  { name: 'Windows 2000 Blue', color: '#3A6EA5' },
  { name: 'Teal',              color: '#008080' },
  { name: 'Forest',            color: '#2F5F3A' },
  { name: 'Plum',              color: '#5B3A6B' },
  { name: 'Slate',             color: '#4A5568' },
  { name: 'Black',             color: '#000000' },
];

// Files in public/wallpapers/ — keep in sync when adding or removing images.
const WALLPAPERS = [
  'Blue_Lace_16.png',
  'Fly_Away.jpg',
  'Ocean_Wave.jpg',
  'Prairie_Wind.png',
  'Soap_Bubbles.png',
  'Solar_Eclipse_(Windows_2000).jpg',
  'Water_Color.jpg',
  'Windows_2000.jpg',
  'Zapotec.png',
];

// Images at least this big are screen-sized pictures (stretch); smaller ones are patterns (tile).
const WALLPAPER_STRETCH_MIN = { w: 640, h: 480 };
const wallpaperSize = {};   // file -> { w, h }, filled as images are loaded

function wallpaperLabel(file) {
  return file.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/\s*\(Windows 2000\)/, '');
}
function wallpaperUrl(file) { return 'wallpapers/' + encodeURI(file); }

let dpSaved   = { color: DESKTOP_COLORS[0].color, wallpaper: '', mode: 'stretch' };  // applied to the desktop
let dpPending = { ...dpSaved };                                                      // selected in the dialog

function applyDesktop(cfg) {
  document.documentElement.style.setProperty('--win-desktop', cfg.color);
  paintBackground(document.getElementById('desktop'), cfg, 1);
  dpSaved = { ...cfg };
}

// Paints wallpaper onto el. scale shrinks the picture for the preview box.
function paintBackground(el, cfg, scale) {
  el.style.backgroundColor = cfg.color;
  if (!cfg.wallpaper) { el.style.backgroundImage = 'none'; return; }
  const size = wallpaperSize[cfg.wallpaper];
  el.style.backgroundImage = 'url("' + wallpaperUrl(cfg.wallpaper) + '")';
  el.style.backgroundPosition = 'center';
  if (cfg.mode === 'stretch') {
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = 'cover';
  } else {
    el.style.backgroundRepeat = cfg.mode === 'tile' ? 'repeat' : 'no-repeat';
    el.style.backgroundSize = size ? (size.w * scale) + 'px ' + (size.h * scale) + 'px' : 'auto';
  }
}

function loadWallpaperSize(file) {
  return new Promise(resolve => {
    if (!file || wallpaperSize[file]) return resolve(wallpaperSize[file]);
    const img = new Image();
    img.onload  = () => { wallpaperSize[file] = { w: img.naturalWidth, h: img.naturalHeight }; resolve(wallpaperSize[file]); };
    img.onerror = () => resolve(null);
    img.src = wallpaperUrl(file);
  });
}

function autoWallpaperMode(size) {
  if (!size) return 'center';
  return size.w >= WALLPAPER_STRETCH_MIN.w && size.h >= WALLPAPER_STRETCH_MIN.h ? 'stretch' : 'tile';
}

// Restore saved settings
try {
  const color = localStorage.getItem('desktopColor');
  const wp    = localStorage.getItem('desktopWallpaper');
  const mode  = localStorage.getItem('desktopWallpaperMode');
  const cfg = { ...dpSaved };
  if (color && DESKTOP_COLORS.some(c => c.color === color)) cfg.color = color;
  if (wp && WALLPAPERS.includes(wp)) { cfg.wallpaper = wp; cfg.mode = ['center','tile','stretch'].includes(mode) ? mode : 'stretch'; }
  applyDesktop(cfg);
  if (cfg.wallpaper) loadWallpaperSize(cfg.wallpaper).then(() => applyDesktop(cfg));
} catch (e) { /* storage unavailable */ }

function dpRefreshPreview() {
  const preview = document.getElementById('dp-preview');
  const scale = preview.clientWidth / document.getElementById('desktop').clientWidth;
  paintBackground(preview, dpPending, scale);
  document.querySelectorAll('#dp-swatches .dp-swatch').forEach(el => {
    el.style.outline = el.dataset.color === dpPending.color ? '2px solid #000' : 'none';
  });
  document.getElementById('dp-mode').value = dpPending.mode;
  document.getElementById('dp-mode').disabled = !dpPending.wallpaper;
}

function dpSelectColor(color) { dpPending.color = color; dpRefreshPreview(); }
function dpSelectMode(mode)   { dpPending.mode = mode;   dpRefreshPreview(); }

async function dpSelectWallpaper(file) {
  dpPending.wallpaper = file;
  if (file) {
    const size = await loadWallpaperSize(file);
    if (dpPending.wallpaper !== file) return;   // selection changed while loading
    dpPending.mode = autoWallpaperMode(size);
  }
  dpRefreshPreview();
}

function openDisplayProps() {
  const swatches = document.getElementById('dp-swatches');
  if (!swatches.children.length) {
    DESKTOP_COLORS.forEach(c => {
      const el = document.createElement('div');
      el.className = 'dp-swatch';
      el.dataset.color = c.color;
      el.title = c.name;
      el.style.cssText = 'width:28px;height:20px;cursor:pointer;border:1px solid #444;outline-offset:1px;background:' + c.color;
      el.onclick = () => dpSelectColor(c.color);
      swatches.appendChild(el);
    });
  }
  const list = document.getElementById('dp-wallpapers');
  if (!list.options.length) {
    list.add(new Option('(None)', ''));
    WALLPAPERS.forEach(f => list.add(new Option(wallpaperLabel(f), f)));
  }
  dpPending = { ...dpSaved };
  list.value = dpPending.wallpaper;
  openDialog('display-props');   // must be visible before measuring the preview
  dpRefreshPreview();
  if (dpPending.wallpaper) loadWallpaperSize(dpPending.wallpaper).then(dpRefreshPreview);
}

function applyDisplayProps() {
  applyDesktop(dpPending);
  try {
    localStorage.setItem('desktopColor', dpPending.color);
    localStorage.setItem('desktopWallpaper', dpPending.wallpaper);
    localStorage.setItem('desktopWallpaperMode', dpPending.mode);
  } catch (e) { /* ignore */ }
}

function cancelDisplayProps() { closeDialog('display-props'); }

// ============================================================
// SEARCH
// ============================================================
function openSearch() {
  openWindow('search');
  const input = document.getElementById('search-input');
  input.focus();
  input.select();
}

// "*" and "?" are wildcards; a plain term matches anywhere in the name.
function searchMatcher(query) {
  const q = query.trim().toLowerCase();
  if (!q) return () => true;
  if (!/[*?]/.test(q)) return name => name.toLowerCase().includes(q);
  const re = new RegExp('^' + q.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  return name => re.test(name.toLowerCase());
}

function runSearch() {
  const query   = document.getElementById('search-input').value;
  const matches = searchMatcher(query);
  const found   = NEOCITIES_FILES.filter(f => matches(f.path.split('/').pop()));

  const box = document.getElementById('search-results');
  box.innerHTML = '';
  if (found.length) {
    const head = document.createElement('div');
    head.style.cssText = 'display:flex;gap:8px;padding:2px 6px;background:#D4D0C8;border-bottom:1px solid #808080;font-weight:bold;position:sticky;top:0;';
    head.innerHTML = '<span style="flex:2">Name</span><span style="flex:2">In Folder</span><span style="flex:1;text-align:right">Size</span>';
    box.appendChild(head);
  }
  found.forEach(f => {
    const isDir  = f.type === 'directory';
    const parts  = f.path.split('/');
    const name   = parts.pop();
    const folder = parts.join('/') || '(site root)';
    const row = document.createElement('div');
    row.className = 'file-item';
    row.style.cssText = 'display:flex;flex-direction:row;align-items:center;gap:8px;width:auto;height:auto;padding:2px 6px;text-align:left;';
    row.innerHTML = '<span style="flex:2;display:flex;align-items:center;gap:4px;"></span>' +
                    '<span style="flex:2;"></span><span style="flex:1;text-align:right;"></span>';
    row.children[0].textContent = (isDir ? '📁 ' : ncExtIcon(name) + ' ') + name;
    row.children[1].textContent = folder;
    row.children[2].textContent = isDir ? '' : ncFormatSize(f.size);
    row.onclick    = () => selectFile(row);
    row.ondblclick = () => {
      if (isDir) { openWindow('my-docs'); ncHistory = []; ncRender(f.path); }   // openWindow resets to the root
      else ncOpenFile(SITE_ROOT + f.path, name);
    };
    box.appendChild(row);
  });
  document.getElementById('search-status').textContent =
    found.length ? found.length + ' file(s) found' : 'Search is complete. There are no results to display.';
}

// ============================================================
// NOTEPAD
// ============================================================
function openInNotepad(url, name) {
  const textarea = document.getElementById('notepad-text');
  const titleBar = document.querySelector('#notepad .title-bar-text');
  textarea.value = 'Loading ' + name + '...';
  titleBar.textContent = name + ' - Notepad';
  openWindow('notepad');
  bringToFront('notepad');

  fetch(url)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(text => { textarea.value = text; })
    .catch(err => { textarea.value = '[Could not load file: ' + err.message + ']'; });
}
function newNotepadFile() {
  document.getElementById('notepad-text').value = '';
  document.querySelector('#notepad .title-bar-text').textContent = 'Untitled - Notepad';
}

// ============================================================
// PICTURE VIEWER
// ============================================================
let pvCurrentZoom = 1;
let pvRotation    = 0;
let pvCurrentUrl  = '';

function openPictureViewer(url, name) {
  pvCurrentUrl  = url;
  pvCurrentZoom = 1;
  pvRotation    = 0;

  const img    = document.getElementById('pic-viewer-img');
  const status = document.getElementById('pic-viewer-status');

  document.getElementById('pic-viewer-title').textContent = '🖼️ ' + name;
  document.getElementById('pv-open-external').onclick = () => window.open(url, '_blank');

  img.style.transform = 'rotate(0deg) scale(1)';
  img.src = '';
  status.textContent = 'Loading...';
  document.getElementById('pic-viewer-zoom').textContent = '100%';

  img.onload  = () => { status.textContent = name + '  —  ' + img.naturalWidth + ' × ' + img.naturalHeight + ' px'; pvApplyTransform(); };
  img.onerror = () => { status.textContent = 'Failed to load image.'; };
  img.src = url;

  openWindow('pic-viewer');
  bringToFront('pic-viewer');
}

function pvApplyTransform() {
  document.getElementById('pic-viewer-img').style.transform = `rotate(${pvRotation}deg) scale(${pvCurrentZoom})`;
  document.getElementById('pic-viewer-zoom').textContent = Math.round(pvCurrentZoom * 100) + '%';
}

function pvZoom(factor)  { pvCurrentZoom = Math.min(8, Math.max(0.1, pvCurrentZoom * factor)); pvApplyTransform(); }
function pvFit()         { pvCurrentZoom = 1; pvRotation = 0; pvApplyTransform(); }
function pvActual()      { const img = document.getElementById('pic-viewer-img'); const pane = document.getElementById('pic-viewer-content'); pvCurrentZoom = img.naturalWidth / pane.clientWidth || 1; pvApplyTransform(); }
function pvRotate(deg)   { pvRotation = (pvRotation + deg + 360) % 360; pvApplyTransform(); }

// ============================================================
// STARTUP — change these to control what opens on load
// ============================================================
// Open txt file
openInNotepad('https://basilstrain.neocities.org/about.txt', 'about.txt')
