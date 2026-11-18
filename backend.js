/* Relie Palmo à sa base de données privée : connexion, documents et justificatifs. */
(() => {
  'use strict';
  const cfg = window.PALMO_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const BUCKET = 'justificatifs';
  const MAX_FILE = 20 * 1024 * 1024;
  const EXT = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''));

  let sb = null, uid = null;
  const cache = new Map();
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());

  const parent = (path) => path.split('/').slice(0, -1).join('/');
  const snap = (path) => ({ id: path.split('/').pop(), exists: cache.has(path), data: () => cache.get(path), metadata: { fromCache: false, hasPendingWrites: false } });

  async function loadAll() {
    const next = new Map();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('docs').select('path,data').order('path').range(from, from + 999);
      if (error) throw { code: 'unavailable' };
      data.forEach((row) => next.set(row.path, row.data));
      if (data.length < 1000) break;
    }
    cache.clear();
    next.forEach((v, k) => cache.set(k, v));
  }
  async function write(path, data) {
    const { error } = await sb.from('docs').upsert({ user_id: uid, path, collection: parent(path), data, updated_at: new Date().toISOString() });
    if (error) throw { code: 'unavailable' };
    cache.set(path, data);
    notify();
  }
  function docRef(path) {
    return {
      id: path.split('/').pop(),
      path,
      get: async () => snap(path),
      set: (data) => write(path, JSON.parse(JSON.stringify(data))),
      update: (data) => write(path, { ...(cache.get(path) || {}), ...JSON.parse(JSON.stringify(data)) }),
      delete: async () => {
        const { error } = await sb.from('docs').delete().eq('user_id', uid).eq('path', path);
        if (error) throw { code: 'unavailable' };
        cache.delete(path);
        notify();
      },
      onSnapshot: (next) => { const fn = () => next(snap(path)); listeners.add(fn); setTimeout(fn, 0); return () => listeners.delete(fn); },
      collection: (name) => colRef(`${path}/${name}`),
    };
  }
  function colRef(path) {
    return {
      path,
      doc: (id) => docRef(`${path}/${id || uuid()}`),
      onSnapshot: (next) => {
        const fn = () => { const docs = [...cache.keys()].filter((k) => parent(k) === path).map(snap); next({ docs, size: docs.length, empty: !docs.length }); };
        listeners.add(fn); setTimeout(fn, 0); return () => listeners.delete(fn);
      },
    };
  }
  const assets = {
    upload: async (blob, options) => {
      const type = (options && options.type) || blob.type;
      if (!EXT[type]) throw { code: 'unsupported_type' };
      if (blob.size > MAX_FILE) throw { code: 'too_large' };
      const id = `${uid}/${uuid()}.${EXT[type]}`;
      const { error } = await sb.storage.from(BUCKET).upload(id, blob, { contentType: type });
      if (error) throw { code: 'unavailable' };
      return { id, url: '', sizeBytes: blob.size, contentType: type };
    },
    delete: async (id) => { const { error } = await sb.storage.from(BUCKET).remove([id]); if (error) throw { code: 'unavailable' }; return { deleted: true }; },
  };
  window.palmoFileUrl = async (id) => {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(id, 3600);
    if (error) throw { code: 'unavailable' };
    return data.signedUrl;
  };
  window.palmoSignOut = async () => { await sb.auth.signOut(); cache.clear(); location.hash = ''; location.reload(); };

  function liveSync() {
    let timer;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => loadAll().then(notify).catch(() => {}), 300); };
    sb.channel('palmo-docs').on('postgres_changes', { event: '*', schema: 'public', table: 'docs', filter: `user_id=eq.${uid}` }, refresh).subscribe();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }
  async function start(session) {
    uid = session.user.id;
    $('login').hidden = true;
    $('app').hidden = false;
    document.body.classList.remove('locked');
    try { await loadAll(); } catch (e) { /* l'application affiche l'état hors ligne */ }
    const caps = { db: { doc: docRef, collection: colRef }, user: { isOwner: () => true, id: async () => uid }, assets };
    window.claude = { use: async (name) => caps[name] || null };
    liveSync();
    window.palmoBoot();
  }
  function showLogin(message) {
    document.body.classList.add('locked');
    $('app').hidden = true;
    $('login').hidden = false;
    if (message) { $('loginerr').textContent = message; $('loginerr').hidden = false; }
  }
  $('loginform').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = $('loginbtn');
    $('loginerr').hidden = true;
    btn.disabled = true; btn.textContent = 'Connexion…';
    const { data, error } = await sb.auth.signInWithPassword({ email: $('email').value.trim(), password: $('password').value });
    btn.disabled = false; btn.textContent = 'Se connecter';
    if (error) { showLogin(error.status === 400 ? 'Email ou mot de passe incorrect.' : 'Connexion impossible. Vérifie ton réseau puis réessaie.'); return; }
    $('password').value = '';
    start(data.session);
  });
  async function init() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    if (!cfg.url || !cfg.anonKey) { showLogin('Palmo n’est pas encore relié à sa base de données.'); $('loginbtn').disabled = true; return; }
    sb = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'palmo-auth' } });
    const { data } = await sb.auth.getSession();
    if (data.session) start(data.session); else showLogin();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
