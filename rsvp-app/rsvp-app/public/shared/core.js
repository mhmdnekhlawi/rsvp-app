/* ============================================================
   CONFIG
   ============================================================ */
const SUPABASE_URL = 'https://vlimnmitchnpftjznfli.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaW1ubWl0Y2hucGZ0anpuZmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwODY0MTYsImV4cCI6MjA5NzY2MjQxNn0.vF4-SJBSwAe30YG2v-Ny65KjDH4TA5S-QIhDhMq5AM8';

/* ============================================================
   SUPABASE REST HELPER
   ============================================================ */
/* ------------------------------------------------------------
   SESSION
   The anon key can no longer read the tables. The host signs in
   with a real Supabase account and we send that token instead.
   ------------------------------------------------------------ */
const SESSION_KEY = 'sb_session';

function getSession(){
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch(e){ return null; }
}
function setSession(s){
  if (!s || !s.access_token){ localStorage.removeItem(SESSION_KEY); return null; }
  s.expires_at = Math.floor(Date.now() / 1000) + (s.expires_in || 3600);
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}

async function signIn(email, password){
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Sign in failed');
  return setSession(data);
}

async function refreshSession(){
  const s = getSession();
  if (!s || !s.refresh_token) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: s.refresh_token })
  });
  if (!res.ok){ localStorage.removeItem(SESSION_KEY); return null; }
  return setSession(await res.json());
}

/* Tokens last an hour; renew a minute early so nothing fails mid-click. */
async function currentToken(){
  let s = getSession();
  if (!s) return null;
  if (s.expires_at && s.expires_at - 60 < Math.floor(Date.now() / 1000)) s = await refreshSession();
  return s ? s.access_token : null;
}

/* ------------------------------------------------------------
   SUPABASE REST HELPER
   ------------------------------------------------------------ */
async function sb(path, opts = {}, _retried) {
  const token = await currentToken();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (res.status === 401 && token && !_retried){
    if (await refreshSession()) return sb(path, opts, true);
    localStorage.removeItem(SESSION_KEY);
  }
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

/* Guest-side calls. These use the anon key and are the only two
   things it is allowed to do. */
async function rpc(fn, args){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {})
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}
const getConfig = () => sb('event_config?id=eq.1&select=*').then(r => r && r[0]);

/* ============================================================
   SHARED HELPERS  (used by every section)
   ============================================================ */
function toast(msg){
  let t = document.getElementById('toast');
  if (!t){ t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.className = 'toast';
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return String(s).replace(/'/g,'%27').replace(/"/g,'%22').replace(/</g,'%3C').replace(/>/g,'%3E'); }

function logout(){
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('rsvp_host');
  location.href = '/';
}
const isHost = () => !!getSession();

/* Sends you back to the front door if you are not logged in. */
function requireHost(){
  if (isHost()) return true;
  location.href = '/';
  return false;
}

/* ============================================================
   SECTION BAR
   Add a section here and it appears on every page.
   `path` is where it lives, `key` is what the page passes to renderNav().
   ============================================================ */
const SECTIONS = [
  { key: 'rsvp',     label: 'RSVP',      icon: '\u2709', path: '/' },
  { key: 'moveplan', label: 'Move plan', icon: '\u{1F4E6}', path: '/moveplan/' }
];

function renderNav(active){
  const el = document.getElementById('hubnav');
  if (!el) return;
  el.className = 'hubnav';
  el.innerHTML = SECTIONS.map(s =>
    `<a class="hubnav-item${s.key === active ? ' on' : ''}" href="${s.path}">
       <span class="hubnav-icon">${s.icon}</span>${escapeHtml(s.label)}</a>`).join('');
}
