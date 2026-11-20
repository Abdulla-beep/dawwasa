// دوّاسة – الأساسيات: التخزين، اللغة، الأدوات، الأيقونات، الطقس، مؤشر الركوب
import { TRACKS, TYPES, PHOTOS, EMIRATE_EN, SEGMENTS } from './data.js';

/* storage */
const mem = {};
export const store = {
  get(k, d) { try { const v = localStorage.getItem('d.' + k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch { return k in mem ? mem[k] : d; } },
  set(k, v) { mem[k] = v; try { localStorage.setItem('d.' + k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { delete mem[k]; try { localStorage.removeItem('d.' + k); } catch {} },
};
if (!store.get('installedAt')) store.set('installedAt', Date.now());

/* language + theme + units */
export const S = { lang: store.get('lang', 'ar') };
export const L = (ar, en) => (S.lang === 'en' ? en : ar);
export function applyLang() { document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === 'en' ? 'ltr' : 'rtl'; }
export function isDark() { const t = store.get('theme', 'auto'); if (t === 'dark') return true; if (t === 'light') return false; const h = new Date().getHours(); return h >= 19 || h < 5; }
export function applyTheme() { document.documentElement.dataset.theme = isDark() ? 'dark' : 'light'; document.querySelector('meta[name=theme-color]')?.setAttribute('content', isDark() ? '#0F141C' : '#F7F4EE'); }
export const emName = (e) => (S.lang === 'en' ? EMIRATE_EN[e] || e : e);
export const tName = (t) => (S.lang === 'en' ? t.en : t.name);
export const typeName = (k) => L(TYPES[k]?.ar || k, TYPES[k]?.en || k);
const mi = () => store.get('units', 'km') === 'mi';
export const fmtDist = (m, dec = 2) => mi() ? (m / 1609.34).toFixed(dec) + ' ' + L('ميل', 'mi') : (m >= 1000 || dec === 1 ? (m / 1000).toFixed(dec) + ' ' + L('كم', 'km') : Math.round(m) + ' ' + L('م', 'm'));
export const distNum = (m) => mi() ? (m / 1609.34) : (m / 1000);
export const distUnit = () => mi() ? L('ميل', 'mi') : L('كم', 'km');
export const fmtSpeed = (kmh) => (mi() ? kmh / 1.609 : kmh).toFixed(1);
export const speedUnit = () => mi() ? 'mph' : L('كم/س', 'km/h');

/* helpers */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
export const pad = (n) => String(n).padStart(2, '0');
export const fmtDur = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`; };
export const fmtTime = (ts) => new Date(ts).toLocaleTimeString(S.lang === 'en' ? 'en-GB' : 'ar-AE', { hour: 'numeric', minute: '2-digit' });
export const fmtDate = (ts, o = { day: 'numeric', month: 'short' }) => new Date(ts).toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'ar-AE', o);
export function ago(ts) {
  const s = (Date.now() - ts) / 1000; if (s < 60) return L('الحين', 'just now');
  const m = s / 60, h = m / 60, d = h / 24;
  if (m < 60) return L(`قبل ${Math.round(m)} دقيقة`, `${Math.round(m)} min ago`);
  if (h < 24) { const r = Math.round(h); return L(r === 1 ? 'قبل ساعة' : r === 2 ? 'قبل ساعتين' : `قبل ${r} ساعات`, `${r} h ago`); }
  const r = Math.round(d); return L(r === 1 ? 'أمس' : `قبل ${r} أيام`, `${r} d ago`);
}
export function haversine(a, b) { const R = 6371000, t = (x) => x * Math.PI / 180; const dLa = t(b.lat - a.lat), dLo = t(b.lng - a.lng); const s = Math.sin(dLa / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
export const hashStr = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
let toastT;
export function toast(msg) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); } el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
export const haptic = (ms = 12) => { try { navigator.vibrate?.(ms); } catch {} };
export function getPosition(o = {}) { return new Promise((res, rej) => { if (!navigator.geolocation) return rej(new Error('nogeo')); navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }), rej, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000, ...o }); }); }
export const mapsLink = (p) => `https://maps.google.com/?q=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
export const waLink = (phone, text) => `https://wa.me/${String(phone || '').replace(/[^\d]/g, '').replace(/^0/, '971')}?text=${encodeURIComponent(text)}`;
export const smsLink = (phone, text) => `sms:${phone || ''}${/iPhone|iPad/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(text)}`;
export const trackById = (id) => TRACKS.find((t) => t.id === id);
export const profile = () => store.get('profile', null);

/* icons */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', back: '<path d="M9 5l7 7-7 7"/>', fwd: '<path d="M15 5l-7 7 7 7"/>',
  explore: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  community: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2.2.6 3.5 2.8 3.5 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5l4-8h5l4 8M9.5 8.5L12 16.5h-6.5M14.5 8.5L12 5h-2M15 5h2"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/>', shieldCheck: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 000-7H9a3.5 3.5 0 010-7h7"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12l4 4 10-10"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  wave: '<path d="M7 15a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 1117 15z"/><path d="M3 20c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>', ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  tool: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  wind: '<path d="M3 8h11a3 3 0 10-3-3M3 12h15a3 3 0 11-3 3M3 16h8"/>', bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17v.5"/>', msg: '<path d="M4 5h16v11H8l-4 4z"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>', bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  mountain: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', trophy: '<path d="M8 4h8v5a4 4 0 01-8 0zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 21h8M9 17h6"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/>', light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>', play: '<path d="M7 4l13 8-13 8z"/>', stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>', lap: '<path d="M4 12a8 8 0 108-8M4 4v4h4"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>', fire: '<path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  family: '<circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="12" cy="11" r="2"/><path d="M3 20v-4a4 4 0 014-4M21 20v-4a4 4 0 00-4-4M9 20v-2a3 3 0 016 0v2"/>',
  women: '<circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/>', thermo: '<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/>', arrowUp: '<path d="M12 20V4M5 11l7-7 7 7"/>',
};
export const ic = (n, s = 22, sw = 1.9) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
export const icFill = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${P[n]}</svg>`;
export const logo = (s = 40, bg = '#1B2230') => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="${bg}"/><circle cx="24" cy="24" r="12" fill="none" stroke="#FF5B14" stroke-width="4" stroke-dasharray="4 2.3"/><path d="M12 31c4-3 8-3 12 0s8 3 12 0" fill="none" stroke="#FF5B14" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="3.5" fill="#FF5B14"/></svg>`;

/* sporty illustrations by track type */
export function art(seed = 0, type = 'road', h = 200) {
  const pal = { road: ['#FFB38A', '#FF5B14', '#1B2230'], circuit: ['#9DB8F5', '#2F6FED', '#1B2230'], mtb: ['#9BE3BF', '#18B26B', '#13261D'], climb: ['#F6B0B2', '#E5484D', '#2A1416'], urban: ['#CDB4F2', '#9B5DE5', '#1D1530'], park: ['#9FE0DE', '#0EA5A4', '#0F2524'] }[type] || ['#FFB38A', '#FF5B14', '#1B2230'];
  const sx = 60 + (seed % 230);
  const road = type === 'climb' || type === 'mtb'
    ? `<path d="M120 ${h} C 160 ${h * .8}, 260 ${h * .78}, 220 ${h * .62} S 150 ${h * .48}, 240 ${h * .42}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-dasharray="10 8"/>`
    : `<path d="M90 ${h} L 190 ${h * .55} L 210 ${h * .55} L 300 ${h}Z" fill="${pal[2]}" opacity=".85"/><path d="M195 ${h} L 199 ${h * .55}" stroke="#fff" stroke-width="3" stroke-dasharray="12 10" opacity=".8"/>`;
  return `<svg class="art" viewBox="0 0 390 ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${seed}${type}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient></defs><rect width="390" height="${h}" fill="url(#g${seed}${type})"/><circle cx="${sx}" cy="${h * .28}" r="22" fill="#fff" opacity=".55"/><path d="M0 ${h} L0 ${h * .62} Q 80 ${h * .5} 150 ${h * .6} T 300 ${h * .52} T 390 ${h * .6} L390 ${h}Z" fill="${pal[2]}" opacity=".35"/>${road}</svg>`;
}
export function photo(p, { cls = '', credit = false, eager = false, seed = 0, type = 'road' } = {}) {
  if (!p) return `<div class="ph ${cls}">${art(seed, type)}</div>`;
  const src = p.data || p.src;
  return `<div class="ph ${cls}">${art(hashStr(src), type)}<img src="${esc(src)}" alt="${esc(p.place || '')}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer" onload="this.classList.add('ok')" onerror="this.remove()">${credit && p.by ? `<a class="credit" href="https://commons.wikimedia.org/wiki/${encodeURI(p.page)}" target="_blank" rel="noopener">📷 ${esc(p.by)} · ${esc(p.lic)}</a>` : ''}</div>`;
}
export const trackPhoto = (t, o = {}) => photo(t.photo ? PHOTOS[t.photo] : null, { seed: TRACKS.indexOf(t), type: t.type, ...o });

/* weather (Open-Meteo, no key) */
const WX_TRACKS = TRACKS.filter((t) => t.lat != null);
export let weather = store.get('wx', null);
export async function loadWeather(force = false) {
  if (!force && weather && Date.now() - weather.at < 30 * 60000) return weather;
  try {
    const lat = WX_TRACKS.map((t) => t.lat).join(','), lng = WX_TRACKS.map((t) => t.lng).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,uv_index,is_day&hourly=apparent_temperature,wind_speed_10m,precipitation_probability,uv_index,is_day&daily=sunrise,sunset,precipitation_sum,precipitation_probability_max&forecast_days=2&timezone=Asia%2FDubai`;
    const r = await fetch(url); if (!r.ok) throw new Error('wx');
    let data = await r.json(); if (!Array.isArray(data)) data = [data];
    const by = {};
    data.forEach((d, i) => {
      const t = WX_TRACKS[i], c = d.current || {}, h = d.hourly || {}, dl = d.daily || {};
      const nowIdx = Math.max(0, (h.time || []).findIndex((x) => new Date(x + ':00+04:00').getTime() > Date.now()) - 1);
      const hours = (h.time || []).slice(nowIdx, nowIdx + 26).map((x, k) => ({ t: new Date(x + ':00+04:00').getTime(), feels: h.apparent_temperature[nowIdx + k], wind: h.wind_speed_10m[nowIdx + k], prob: h.precipitation_probability?.[nowIdx + k] ?? 0, uv: h.uv_index?.[nowIdx + k] ?? 0, day: h.is_day?.[nowIdx + k] ?? 1 }));
      const prob24 = Math.max(0, ...hours.slice(0, 24).map((x) => x.prob || 0));
      const sum = Math.max(...(dl.precipitation_sum || [0]).slice(0, 2).map((x) => x || 0));
      by[t.id] = { temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, gust: c.wind_gusts_10m, dir: c.wind_direction_10m, uv: c.uv_index, day: c.is_day, rainNow: c.precipitation || 0, prob: hours[0]?.prob ?? 0, prob24, sum, hours, sunrise: dl.sunrise?.[0], sunset: dl.sunset?.[0], sunriseTom: dl.sunrise?.[1], flood: prob24 >= 70 || sum >= 5 || (c.precipitation || 0) >= 2 };
    });
    weather = { at: Date.now(), by }; store.set('wx', weather);
  } catch { /* offline: keep cache */ }
  return weather;
}
export function wx(t) {
  if (!t || !weather?.by) return null;
  if (weather.by[t.id]) return weather.by[t.id];
  // tracks without coords borrow the nearest weather in the same emirate
  const twin = WX_TRACKS.find((x) => x.emirate === t.emirate);
  return twin ? weather.by[twin.id] : null;
}
const ts = (s) => (s ? new Date(s + ':00+04:00').getTime() : null);
export function sunsetOf(t) { const w = wx(t); if (w?.sunset) return ts(w.sunset); const d = new Date(); d.setHours(17, 40, 0, 0); return d.getTime(); }
export function sunriseOf(t) { const w = wx(t); if (w?.sunrise) return ts(w.sunrise); const d = new Date(); d.setHours(6, 30, 0, 0); return d.getTime(); }

/* track status */
export const STATUS = {
  open: { ar: 'مفتوح', en: 'Open', c: '#18B26B', bg: 'var(--green-soft)' },
  closed: { ar: 'مسكّر', en: 'Closed', c: '#E5484D', bg: 'var(--red-soft)' },
  maintenance: { ar: 'صيانة', en: 'Works', c: '#C47F05', bg: 'var(--amber-soft)' },
  flood: { ar: 'ماء على المسار', en: 'Flooded', c: '#2F6FED', bg: 'var(--blue-soft)' },
  weather_closed: { ar: 'مسكّر · طقس', en: 'Closed · weather', c: '#2F6FED', bg: 'var(--blue-soft)' },
};
export function statusOf(t) {
  const w = wx(t);
  if ((t.type === 'mtb') && w?.flood) return { s: 'weather_closed', at: weather.at, by: L('إغلاق تلقائي حسب توقعات الطقس', 'Auto-closed by forecast') };
  const o = store.get('status', {})[t.id];
  if (o) return o;
  return { s: 'open', at: null, by: null };
}
export const isOpen = (st) => st.s === 'open';
export const statusBadge = (st) => { const s = STATUS[st.s] || STATUS.open; return `<span class="badge" style="background:${s.bg};color:${s.c}"><span class="dot" style="background:${s.c}"></span>${L(s.ar, s.en)}</span>`; };
export const typeBadge = (k) => `<span class="badge" style="background:${TYPES[k].c}1f;color:${TYPES[k].c}">${typeName(k)}</span>`;

/* ride index */
function scoreAt(t, h, isNight) {
  let s = 100; const why = [];
  const feels = h.feels, wind = h.wind, prob = h.prob ?? 0, uv = h.uv ?? 0;
  if (feels != null) {
    if (feels >= 40) { s -= 60; why.push(L('حر شديد', 'Extreme heat')); } else if (feels >= 36) { s -= 40; why.push(L('حر', 'Hot')); } else if (feels >= 32) { s -= 20; why.push(L('دافي', 'Warm')); } else if (feels >= 28) s -= 8;
  }
  if (wind != null) { if (wind >= 30) { s -= 25; why.push(L('ريح قوية', 'Strong wind')); } else if (wind >= 20) { s -= 10; why.push(L('ريح', 'Windy')); } }
  if (prob >= 60) { s -= t.type === 'mtb' ? 45 : 30; why.push(L('مطر متوقع', 'Rain likely')); }
  if (uv >= 8 && !isNight) { s -= 10; why.push(L('أشعة قوية', 'High UV')); }
  if (isNight && t.lit === 'none') { s -= 40; why.push(L('ظلام بدون إنارة', 'Dark, unlit')); }
  else if (isNight && (t.lit === 'partial' || t.lit === 'unknown')) { s -= 12; why.push(L('إنارة جزئية', 'Partly lit')); }
  return { s: Math.max(0, Math.min(100, Math.round(s))), why };
}
export function rideIndex(t) {
  if (!isOpen(statusOf(t))) return { s: 0, why: [L('التراك مسكّر', 'Track closed')] };
  const w = wx(t);
  const now = Date.now(), night = now < sunriseOf(t) - 20 * 60000 || now > sunsetOf(t) + 20 * 60000;
  if (!w) return { ...scoreAt(t, {}, night), noData: true };
  return scoreAt(t, { feels: w.feels, wind: w.wind, prob: w.prob, uv: w.uv }, night);
}
export function bestWindow(t) {
  const w = wx(t); if (!w?.hours?.length) return null;
  const hrs = w.hours.slice(1, 25);
  let best = null;
  for (let i = 0; i < hrs.length - 1; i++) {
    const a = hrs[i], b = hrs[i + 1];
    const nightA = !a.day, nightB = !b.day;
    const sa = scoreAt(t, a, nightA).s, sb = scoreAt(t, b, nightB).s;
    const s = Math.round((sa + sb) / 2);
    if (!best || s > best.s) best = { s, start: a.t, end: b.t + 3600000 };
  }
  return best;
}
export const indexLabel = (s) => s >= 80 ? { t: L('ممتاز للركوب', 'Great for riding'), c: '#18B26B' } : s >= 60 ? { t: L('جيد', 'Good'), c: '#2F6FED' } : s >= 35 ? { t: L('انتبه', 'Be careful'), c: '#F5A524' } : { t: L('ما ننصح الحين', 'Not advised now'), c: '#E5484D' };
export function gauge(score, size = 92) {
  const r = 38, c = Math.PI * r, lab = indexLabel(score);
  return `<svg width="${size}" height="${size * .62}" viewBox="0 0 92 57" aria-hidden="true"><path d="M8 50 A38 38 0 0 1 84 50" fill="none" stroke="var(--line)" stroke-width="9" stroke-linecap="round"/><path class="g-arc" d="M8 50 A38 38 0 0 1 84 50" fill="none" stroke="${lab.c}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - score / 100)}" style="transition:stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)"/></svg>`;
}
export const animateGauges = () => requestAnimationFrame(() => setTimeout(() => $$('.g-arc').forEach((a) => a.style.strokeDashoffset = a.dataset.off), 60));
export const windArrow = (deg, s = 22) => `<span style="display:inline-flex;transform:rotate(${(deg + 180) % 360}deg)" aria-hidden="true">${ic('arrowUp', s, 2.4)}</span>`;
export const compass = (deg) => { const ar = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'], en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; const i = Math.round(((deg % 360) + 360) % 360 / 45) % 8; return L(ar[i], en[i]); };

/* confetti in UAE flag colours */
export function confetti(n = 80) {
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  const cols = ['#00732F', '#FFFFFF', '#0E1116', '#EF3340', '#FF5B14'];
  for (let i = 0; i < n; i++) { const e = document.createElement('i'); e.style.left = Math.random() * 100 + '%'; e.style.background = cols[i % cols.length]; e.style.animationDuration = 1.3 + Math.random() * 1.1 + 's'; e.style.animationDelay = Math.random() * .5 + 's'; e.style.boxShadow = '0 0 0 1px rgba(0,0,0,.08)'; box.appendChild(e); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2900);
}
export function ring(p, size = 64, color = '#FF5B14', track = 'rgba(255,255,255,.18)') {
  const r = 26, c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="${track}" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, Math.max(0, p)))}" transform="rotate(-90 32 32)"/></svg>`;
}
export function compressImage(file, max = 1200, q = .74) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', q)); }; img.src = fr.result; }; fr.readAsDataURL(file); });
}

/* map helpers (Leaflet as window.L) */
export function makeMap(el, center, zoom) {
  if (!window.L?.map) { el.innerHTML = `<div class="empty">${L('الخريطة تحتاج إنترنت أول مرة', 'The map needs internet the first time')}</div>`; return null; }
  const m = window.L.map(el, { zoomControl: true }).setView(center, zoom);
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
  setTimeout(() => m.invalidateSize(), 200);
  return m;
}
export const pinIcon = (c, approx) => window.L.divIcon({ className: '', html: `<div class="pin ${approx ? 'approx' : ''}" style="background:${c}"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
export const meIcon = () => window.L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

/* rides / stats */
export const rides = () => store.get('rides', []);
export function bestEfforts() { const b = {}; rides().forEach((r) => (r.efforts || []).forEach((e) => { if (!b[e.seg] || e.time < b[e.seg].time) b[e.seg] = { ...e, rideId: r.id, at: r.startedAt }; })); return b; }
export const segById = (id) => SEGMENTS.find((s) => s.id === id);
