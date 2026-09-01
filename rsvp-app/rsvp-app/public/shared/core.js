/* ============================================================
   CONFIG
   ============================================================ */
const SUPABASE_URL = 'https://vlimnmitchnpftjznfli.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsaW1ubWl0Y2hucGZ0anpuZmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwODY0MTYsImV4cCI6MjA5NzY2MjQxNn0.vF4-SJBSwAe30YG2v-Ny65KjDH4TA5S-QIhDhMq5AM8';

/* ============================================================
   SUPABASE REST HELPER
   ============================================================ */
async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
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
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return String(s).replace(/'/g,'%27').replace(/"/g,'%22').replace(/</g,'%3C').replace(/>/g,'%3E'); }

function logout(){ localStorage.removeItem('rsvp_host'); location.href = '/'; }
const isHost = () => localStorage.getItem('rsvp_host') === '1';

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

