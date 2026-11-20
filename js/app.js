// دوّاسة – الشاشات والتنقل
import { TRACKS, COMING, EMIRATES, TYPES, FAC, SEGMENTS, EMERGENCY, RULES, REPORT_TYPES, SEED_POSTS, SEED_EVENTS, PHOTOS, VERIFIED } from './data.js';
import { store, S, L, applyLang, applyTheme, isDark, emName, tName, typeName, fmtDist, fmtSpeed, speedUnit, distNum, distUnit, $, $$, esc, uid, fmtDur, fmtTime, fmtDate, ago, haversine, toast, haptic, getPosition, mapsLink, waLink, smsLink, trackById, profile, ic, icFill, logo, photo, trackPhoto, loadWeather, wx, sunsetOf, sunriseOf, STATUS, statusOf, isOpen, statusBadge, typeBadge, rideIndex, bestWindow, indexLabel, gauge, animateGauges, windArrow, compass, confetti, ring, compressImage, makeMap, pinIcon, meIcon, rides, bestEfforts, segById } from './core.js';
import { viewRecord, viewRide, viewDone } from './ride.js';

applyLang(); applyTheme();

/* ---------- shared UI ---------- */
function topbar({ title, sub, back, sos = true, right = '' }) {
  return `<header class="topbar">${back ? `<a class="icon-btn" href="${back}" aria-label="${L('رجوع', 'Back')}"><span class="flip">${ic('back')}</span></a>` : ''}<div class="grow"><h1 style="font-size:${back ? 21 : 26}px">${title}</h1>${sub ? `<p class="small muted">${sub}</p>` : ''}</div>${right}${sos ? `<a class="sos" href="#/sos">${ic('phone', 15, 2.2)} SOS</a>` : ''}</header>`;
}
function tabbar(active) {
  const t = (r, i, l) => `<a href="#/${r}" ${active === r ? 'aria-current="page"' : ''}>${ic(i, 24, active === r ? 2.3 : 1.8)}${l}</a>`;
  return `<nav class="tabbar" aria-label="${L('التنقل', 'Navigation')}">${t('explore', 'explore', L('استكشف', 'Explore'))}${t('map', 'map', L('الخريطة', 'Map'))}<a href="#/record" class="rec" ${active === 'record' ? 'aria-current="page"' : ''} aria-label="${L('سجّل ركبة', 'Record ride')}"><span class="btnc">${ic('bike', 28, 2)}</span>${L('سجّل', 'Record')}</a>${t('community', 'community', L('المجتمع', 'Community'))}${t('profile', 'user', L('حسابي', 'Profile'))}</nav>`;
}
const notfound = () => ({ tabs: false, html: `<main class="screen no-tabs">${topbar({ title: L('ما لقينا الصفحة', 'Not found'), back: '#/explore' })}<a class="btn" href="#/explore">${L('رجوع', 'Home')}</a></main>` });
const bikeName = (b) => ({ road: L('طريق', 'Road'), mtb: L('جبلية', 'MTB'), gravel: 'Gravel', hybrid: L('هجين', 'Hybrid'), ebike: L('كهربائية', 'E-bike') }[b] || b);
const facIcon = { rental: 'bike', shower: 'drop', locker: 'shield', cafe: 'fire', water: 'drop', parking: 'pin', toilet: 'info', prayer: 'moon', shade: 'sun', repair: 'tool', kids: 'family' };
const litLabel = (l) => ({ full: L('مضاء بالكامل', 'Fully lit'), partial: L('إنارة جزئية', 'Partly lit'), none: L('بدون إنارة', 'Not lit'), unknown: L('الإنارة: تأكد', 'Lighting: verify') }[l]);

function trackCard(t) {
  const st = statusOf(t), w = wx(t);
  return `<a class="track-card press" href="#/track/${t.id}">${trackPhoto(t, { cls: 'track-thumb' })}
    <div class="body"><span class="name">${esc(tName(t))}</span><span class="small muted">${esc(t.area)} · ${esc(emName(t.emirate))}</span>
      <div class="badges">${typeBadge(t.type)}${statusBadge(st)}${t.lit === 'full' ? `<span class="badge" style="background:var(--amber-soft);color:#B07400">${ic('light', 12)} ${L('مضاء', 'Lit')}</span>` : ''}${t.women ? `<span class="badge" style="background:#F3E8FF;color:#7E3AF2">${L('جلسات بنات', 'Women')}</span>` : ''}</div>
      <span class="tiny muted num">${t.len} ${L('كم', 'km')}${w?.feels != null ? ` · ${Math.round(w.feels)}° ${L('محسوسة', 'feels')} · ${L('ريح', 'wind')} ${Math.round(w.wind)}` : ''}${st.at ? ` · ${L('آخر تحديث', 'updated')} ${ago(st.at)}` : ''}</span></div></a>`;
}

/* ---------- filters ---------- */
let F = store.get('filters', { q: '', em: '', type: '', lit: false, open: false, family: false, women: false, rental: false });
const saveF = () => store.set('filters', F);
let myPos = null;
function filtered() {
  const q = F.q.trim().toLowerCase();
  let list = TRACKS.filter((t) => (!q || (t.name + t.en + t.area + t.emirate).toLowerCase().includes(q)) && (!F.em || t.emirate === F.em) && (!F.type || t.type === F.type) && (!F.lit || t.lit === 'full') && (!F.open || isOpen(statusOf(t))) && (!F.family || t.family) && (!F.women || t.women) && (!F.rental || t.fac.includes('rental')));
  if (F.sort === 'near' && myPos) list = list.slice().sort((a, b) => (a.lat == null) - (b.lat == null) || haversine(myPos, a) - haversine(myPos, b));
  else if (F.sort === 'index') list = list.slice().sort((a, b) => rideIndex(b).s - rideIndex(a).s);
  return list;
}
function chips() {
  const b = (k, label, on) => `<button class="chip" data-f="${k}" aria-pressed="${on}">${label}</button>`;
  return `<div class="chips">${b('em:', L('كل الإمارات', 'All emirates'), !F.em)}${EMIRATES.map((e) => b('em:' + e, esc(emName(e)), F.em === e)).join('')}</div>
  <div class="chips">${Object.keys(TYPES).map((k) => b('type:' + k, typeName(k), F.type === k)).join('')}${b('lit', ic('light', 14) + L('مضاء بالليل', 'Lit at night'), F.lit)}${b('open', L('مفتوح الحين', 'Open now'), F.open)}${b('family', L('عائلي', 'Family'), F.family)}${b('women', L('جلسات بنات', 'Women'), F.women)}${b('rental', L('تأجير', 'Rental'), F.rental)}</div>
  <div class="chips">${b('sort:', L('الترتيب الافتراضي', 'Default order'), !F.sort)}${b('sort:near', ic('pin', 14) + L('الأقرب لي', 'Nearest'), F.sort === 'near')}${b('sort:index', ic('bolt', 14) + L('أفضل مؤشر', 'Best index'), F.sort === 'index')}</div>`;
}
function bindChips(root, redraw) {
  $$('[data-f]', root).forEach((btn) => btn.onclick = async () => {
    haptic(); const [k, v] = btn.dataset.f.split(':');
    if (k === 'em') F.em = F.em === v ? '' : v; else if (k === 'type') F.type = F.type === v ? '' : v; else if (k === 'sort') {
      F.sort = v || ''; if (v === 'near' && !myPos) { try { myPos = await getPosition(); } catch { toast(L('فعّل الموقع عشان نرتّب حسب الأقرب', 'Enable location to sort by distance')); F.sort = ''; } }
    } else F[k] = !F[k];
    saveF(); redraw();
  });
}

/* ---------- sky ---------- */
function phase(h = new Date().getHours()) { return h >= 5 && h < 7 ? 'dawn' : h >= 7 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'sunset' : 'night'; }
function sky(ph) {
  const c = { dawn: ['#3E4A7A', '#F08A5D', '#FFD3A5', '#6B3E3A'], day: ['#2F7FD0', '#8EC9EE', '#F6E3C1', '#C8945C'], sunset: ['#2B1E4A', '#E2573B', '#FFB05E', '#4A2220'], night: ['#060B16', '#13203A', '#24365A', '#0E1524'] }[ph];
  const stars = ph === 'night' ? Array.from({ length: 30 }, (_, i) => `<circle class="twinkle" style="animation-delay:${(i % 7) * .4}s" cx="${(i * 53) % 390}" cy="${(i * 37) % 140 + 8}" r="${i % 3 ? 1 : 1.6}" fill="#fff"/>`).join('') : '';
  const bx = S.lang === 'en' ? 330 : 60;
  const body = ph === 'night' ? `<path transform="translate(${bx - 322} 100)" d="M322 46 a20 20 0 1 0 14 34 a16 16 0 1 1 -14 -34z" fill="#F6EBD3"/>` : `<circle cx="${bx}" cy="${ph === 'day' ? 150 : 172}" r="${ph === 'day' ? 22 : 30}" fill="#FFE7A8" opacity=".95"/>`;
  return `<svg class="layer" viewBox="0 0 390 290" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient></defs><rect width="390" height="290" fill="url(#sk)"/>${stars}${body}
    <path d="M0 290 L0 200 Q 70 165 140 190 T 280 178 T 390 192 L390 290Z" fill="${c[3]}" opacity=".55"/>
    <path d="M0 290 L0 236 Q 110 214 210 232 T 390 226 L390 290Z" fill="${c[3]}"/>
    <path d="M0 262 L390 250" stroke="#0E1116" stroke-width="16" opacity=".55"/><path d="M0 262 L390 250" stroke="#fff" stroke-width="2" stroke-dasharray="14 12" opacity=".6"/></svg>`;
}
const riderSvg = `<svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true"><g fill="none" stroke="#0E1116" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="30" r="8"/><circle cx="50" cy="30" r="8"/><path d="M12 30l12-14h14l12 14M24 16l8 14h-20M38 16l-4-6"/></g><g class="spin" style="transform-origin:12px 30px"><path d="M12 22v16M4 30h16" stroke="#0E1116" stroke-width="1.2"/></g><circle cx="36" cy="6" r="4" fill="#FF5B14"/><path d="M34 10l-6 8 8 2 4 10" stroke="#FF5B14" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;

/* ================= VIEWS ================= */
const V = {};

V.welcome = () => ({
  tabs: false,
  html: `<div class="welcome">${photo(PHOTOS.qudra, { eager: true })}<div class="shade"></div>
    <div class="intro">${logo(64, '#0E1116')}<div class="wordmark">${L('دوّاسة', 'Dawwasa')}</div>
      <p style="font-size:17px;color:#E5E7EB;max-width:320px">${L('كل تراكات الدراجات في الإمارات، الطقس المباشر، وتسجيل ركباتك، ومجتمع الدرّاجين.', 'Every UAE cycling track, live conditions, ride tracking and the riders’ community.')}</p>
      <div class="row wrap small" style="gap:14px;color:#E5E7EB"><span class="row" style="gap:6px">${ic('route', 18)}${TRACKS.length} ${L('تراك', 'tracks')}</span><span class="row" style="gap:6px">${ic('bolt', 18)}${L('مؤشر الركوب', 'Ride Index')}</span><span class="row" style="gap:6px">${ic('trophy', 18)}${L('مقاطع وتحديات', 'Segments')}</span></div></div>
    <div class="actions"><div class="sadu"></div>
      <a class="btn" href="#/onboard">${L('يالله نبدأ', "Let's go")}</a>
      <button class="btn ghost" id="guest">${L('تصفّح بدون حساب', 'Browse as guest')}</button>
      <button class="btn link" id="lang" style="align-self:center">${ic('globe', 18)} ${L('English', 'العربية')}</button>
      <p class="tiny muted" style="text-align:center">${L('بالمتابعة توافق على الشروط وسياسة الخصوصية (صفحة «عن دوّاسة»).', 'By continuing you agree to the terms and privacy policy (see About).')}</p></div></div>`,
  mount() {
    $('#guest').onclick = () => { store.set('profile', { guest: true, name: L('ضيف', 'Guest') }); location.hash = '#/explore'; };
    $('#lang').onclick = () => { S.lang = S.lang === 'ar' ? 'en' : 'ar'; store.set('lang', S.lang); applyLang(); render(); };
  },
});

V.onboard = () => {
  const old = profile() && !profile().guest ? profile() : {};
  const d = { name: '', emirate: '', bikes: [], level: '', goal: 100, ecName: '', ecPhone: '', ...old };
  let step = 1;
  const seg = (k, opts, multi) => `<div class="seg" style="grid-template-columns:repeat(${Math.min(opts.length, 3)},1fr)">${opts.map(([v, l]) => `<button type="button" data-k="${k}" data-v="${v}" data-multi="${multi ? 1 : ''}" aria-pressed="${multi ? d[k].includes(v) : d[k] === v}">${l}</button>`).join('')}</div>`;
  const body = () => ({
    1: `<div class="field"><label for="nm">${L('اسمك', 'Your name')}</label><input class="input" id="nm" value="${esc(d.name)}" autocomplete="given-name"></div>
        <div class="field"><label>${L('إمارتك', 'Home emirate')}</label>${seg('emirate', EMIRATES.map((e) => [e, emName(e)]))}</div>`,
    2: `<div class="field"><label>${L('نوع دراجتك (تقدر تختار أكثر من وحدة)', 'Your bikes (choose any)')}</label>${seg('bikes', [['road', L('طريق', 'Road')], ['mtb', L('جبلية MTB', 'MTB')], ['gravel', 'Gravel'], ['hybrid', L('هجين', 'Hybrid')], ['ebike', L('كهربائية', 'E-bike')]], true)}</div>
        <div class="field"><label>${L('مستواك', 'Your level')}</label>${seg('level', [['beginner', L('مبتدئ', 'Beginner')], ['mid', L('متوسط', 'Intermediate')], ['pro', L('محترف', 'Advanced')]])}</div>`,
    3: `<div class="field"><label for="gl">${L('هدفك الأسبوعي', 'Weekly goal')}: <b id="glv">${d.goal}</b> ${L('كم', 'km')}</label><input type="range" id="gl" min="20" max="500" step="10" value="${d.goal}" style="accent-color:var(--orange)"></div>
        <div class="card" style="box-shadow:none;border:1px solid var(--line)"><h2>${L('جهة الطوارئ', 'Emergency contact')}</h2>
          <div class="field"><label for="ecn">${L('الاسم', 'Name')}</label><input class="input" id="ecn" value="${esc(d.ecName)}"></div>
          <div class="field"><label for="ecp">${L('رقم الجوال', 'Mobile')}</label><input class="input" id="ecp" type="tel" dir="ltr" value="${esc(d.ecPhone)}" placeholder="05X XXX XXXX"></div></div>`,
    4: `<label class="switch card" style="box-shadow:none;border:1px solid var(--line)"><span><b>${L('منطقة الخصوصية', 'Privacy zone')}</b><br><span class="small muted">${L('نخفي أول وآخر 200 م من ركباتك لما تشاركها، عشان ما يبين بيتك.', 'Hide the first and last 200 m of shared rides so your home isn’t shown.')}</span></span><input type="checkbox" id="pz" ${store.get('privacy', true) ? 'checked' : ''}></label>
        <div class="field"><label>${L('الوحدات', 'Units')}</label>${`<div class="seg" style="grid-template-columns:1fr 1fr"><button type="button" data-u="km" aria-pressed="${store.get('units', 'km') === 'km'}">${L('كيلومتر', 'Kilometres')}</button><button type="button" data-u="mi" aria-pressed="${store.get('units', 'km') === 'mi'}">${L('ميل', 'Miles')}</button></div>`}</div>
        <p class="small muted">${L('بياناتك في هالنسخة تنحفظ على جوالك.', 'In this version your data stays on your phone.')}</p>`,
  })[step];
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: L('حسابك في دوّاسة', 'Your Dawwasa profile'), back: profile() ? '#/profile' : '#/welcome', sos: false })}
      <div class="steps" id="steps"></div><form id="f" class="stack" style="gap:16px"></form>
      <div class="grid2"><button class="btn ghost" id="prev">${L('رجوع', 'Back')}</button><button class="btn" id="next"></button></div></main>`,
    mount() {
      const draw = () => {
        $('#steps').innerHTML = [1, 2, 3, 4].map((i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('');
        $('#f').innerHTML = body(); $('#prev').style.visibility = step > 1 ? 'visible' : 'hidden';
        $('#next').textContent = step < 4 ? L('التالي', 'Next') : L('يالله نركب 🚴', "Let's ride 🚴");
        $$('[data-k]').forEach((b) => b.onclick = () => { haptic(); const k = b.dataset.k, v = b.dataset.v; if (b.dataset.multi) { d[k] = d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]; b.setAttribute('aria-pressed', d[k].includes(v)); } else { d[k] = v; $$(`[data-k="${k}"]`).forEach((x) => x.setAttribute('aria-pressed', x === b)); } });
        $$('[data-u]').forEach((b) => b.onclick = () => { store.set('units', b.dataset.u); $$('[data-u]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
        $('#gl') && ($('#gl').oninput = (e) => { d.goal = +e.target.value; $('#glv').textContent = d.goal; });
      };
      const collect = () => { if ($('#nm')) d.name = $('#nm').value.trim(); if ($('#ecn')) { d.ecName = $('#ecn').value.trim(); d.ecPhone = $('#ecp').value.trim(); } if ($('#pz')) store.set('privacy', $('#pz').checked); };
      $('#prev').onclick = () => { collect(); step--; draw(); };
      $('#next').onclick = () => {
        collect();
        if (step === 1 && !d.name) return toast(L('اكتب اسمك', 'Enter your name'));
        if (step < 4) { step++; draw(); return; }
        store.set('profile', { ...d, guest: false, createdAt: old.createdAt || Date.now() });
        if (!store.get('bikes', []).length && d.bikes.length) store.set('bikes', d.bikes.map((b, i) => ({ id: uid(), name: L(`دراجتي ${i + 1}`, `My bike ${i + 1}`), type: b, km: 0 })));
        confetti(40); toast(L(`هلا ${d.name}! 🚴`, `Welcome ${d.name}! 🚴`)); location.hash = '#/explore';
      };
      draw();
    },
  };
};

function featured() {
  const p = profile() || {};
  const want = (p.bikes || []).includes('mtb') && !(p.bikes || []).includes('road') ? ['mtb'] : ['road', 'circuit', 'climb'];
  let list = TRACKS.filter((t) => t.lat != null && isOpen(statusOf(t)) && want.includes(t.type) && (p.level === 'pro' || t.type !== 'climb'));
  if (!list.length) list = TRACKS.filter((t) => t.lat != null);
  const scored = list.map((t) => ({ t, s: rideIndex(t).s })).sort((a, b) => b.s - a.s);
  const day = Math.floor(Date.now() / 86400000);
  return scored.slice(0, 3)[day % Math.min(3, scored.length)].t;
}
V.explore = () => {
  const p = profile(); const ph = phase();
  const greet = { dawn: L('صباح الخير', 'Good morning'), day: L('هلا والله', 'Hello'), sunset: L('مساء الخير', 'Good evening'), night: L('مساء النور', 'Good evening') }[ph];
  const sub = { dawn: L('أحلى وقت للركوب الحين 🌅', 'Best time to ride 🌅'), day: L('وين بتركب اليوم؟', 'Where are you riding today?'), sunset: L('ركبة الغروب تنادي 🧡', 'Sunset ride is calling 🧡'), night: L('تراكات مضاءة تنتظرك 🌙', 'Lit tracks are waiting 🌙') }[ph];
  const ft = featured();
  const em = [['دبي', '#FF5B14'], ['أبوظبي', '#2F6FED'], ['الشارقة', '#9B5DE5'], ['رأس الخيمة', '#E5484D'], ['الفجيرة', '#18B26B'], ['عجمان', '#0EA5A4'], ['أم القيوين', '#F5A524']];
  return {
    tab: 'explore',
    html: `<main class="screen">
      <section class="sky">${sky(ph)}${ph !== 'night' ? `<div class="rider">${riderSvg}</div>` : ''}
        <div class="content"><div class="row between"><span class="row" style="gap:8px;font-weight:800;font-size:18px">${logo(30, 'rgba(14,17,22,.5)')} ${L('دوّاسة', 'Dawwasa')}</span><a class="sos" href="#/sos">${ic('phone', 15, 2.2)} SOS</a></div>
        <h1>${greet}${p?.name && !p.guest ? `${L('، ', ', ')}${esc(p.name)}` : ''}</h1><span style="opacity:.92">${sub}</span></div></section>
      <a class="gauge-card press" id="gc" href="#/track/${ft.id}"></a>
      <div id="alerts" class="stack"></div>
      ${store.get('active') ? `<a href="#/ride" class="banner heat" style="text-decoration:none"><span class="ic">${ic('bike')}</span><div><b>${L('عندك ركبة شغّالة', 'Ride in progress')}</b><br><span class="small">${L('اضغط للرجوع', 'Tap to return')}</span></div></a>` : ''}
      <a class="featured press" href="#/track/${ft.id}">${trackPhoto(ft)}<div class="shade"></div><div class="body"><span class="tag">${ic('bolt', 14)} ${L('تراك اليوم', "Today's track")}</span><h2 style="font-size:23px;color:#fff">${esc(tName(ft))}</h2><span class="small" style="opacity:.9">${esc(ft.area)} · ${esc(emName(ft.emirate))} · ${ft.len} ${L('كم', 'km')}</span><div class="badges">${typeBadge(ft.type)}${ft.lit === 'full' ? `<span class="badge" style="background:rgba(255,255,255,.18);color:#fff">${L('مضاء', 'Lit')}</span>` : ''}</div></div></a>
      <section class="stack"><div class="row between"><h2>${L('الإمارات', 'Emirates')}</h2><a class="small" href="#/events">${ic('calendar', 14)} ${L('الركبات الجماعية', 'Group rides')}</a></div>
        <div class="carousel">${em.map(([e, c]) => { const n = TRACKS.filter((t) => t.emirate === e).length; return `<button class="em-card press" data-em="${e}" aria-pressed="${F.em === e}" style="background:linear-gradient(135deg, ${c}, ${c}cc)">${ic('bike', 80, 1.2)}<b>${esc(emName(e))}</b><span>${n ? `${n} ${L('تراك', 'tracks')}` : L('قريباً · اقترح تراك', 'Soon · suggest one')}</span></button>`; }).join('')}</div></section>
      <div class="sadu"></div>
      <div class="search">${ic('search', 20)}<input class="input" id="q" type="search" value="${esc(F.q)}" placeholder="${L('دوّر على تراك أو منطقة', 'Search a track or area')}" aria-label="${L('بحث', 'Search')}"></div>
      <div id="chips" class="stack"></div>
      <div class="row between"><h2 id="cnt"></h2><button class="btn link small" id="clr">${L('مسح', 'Clear')}</button></div>
      <div id="list" class="stack stagger" style="gap:10px"></div>
      <section class="card" style="background:var(--asphalt);color:#fff">${COMING.map((c) => `<div class="row" style="align-items:flex-start"><span class="tag">${L('قريباً', 'Soon')}</span><div class="stack" style="gap:2px"><b>${L(c.name, c.en)}</b><span class="small" style="color:#C9CED8">${L(c.note, c.noteEn)}</span></div></div>`).join('')}</section>
    </main>`,
    mount() {
      const draw = () => { const list = filtered(); $('#cnt').textContent = L(`${list.length} تراك`, `${list.length} tracks`); $('#list').innerHTML = list.length ? list.map(trackCard).join('') : `<div class="empty">${ic('search', 32)}<p>${F.em && !TRACKS.some((t) => t.emirate === F.em) ? L('ما عندنا تراكات موثّقة هني للحين. اقترح تراك من المجتمع!', 'No verified tracks here yet. Suggest one in Community!') : L('ما في تراكات بهالفلاتر', 'No tracks match')}</p>${F.em ? `<a class="btn small" href="#/post?type=suggestion">${L('اقترح تراك', 'Suggest a track')}</a>` : ''}</div>`; $('#chips').innerHTML = chips(); bindChips($('#chips'), draw); $$('[data-em]').forEach((b) => b.setAttribute('aria-pressed', F.em === b.dataset.em)); };
      const drawGauge = () => {
        const sc = rideIndex(ft), lab = indexLabel(sc.s), w = wx(ft), bw = bestWindow(ft);
        $('#gc').innerHTML = `${gauge(sc.s)}<div class="stack" style="gap:2px;flex:1;min-width:0"><span class="tiny muted">${L('مؤشر الركوب الحين', 'Ride Index now')} · ${esc(tName(ft))}</span><span class="row" style="gap:8px"><span class="score num" style="color:${lab.c}">${sc.s}</span><b style="color:${lab.c}">${lab.t}</b></span><span class="tiny muted">${w ? `${Math.round(w.feels)}° ${L('محسوسة', 'feels')} · ${L('ريح', 'wind')} ${Math.round(w.wind)} ${L('كم/س', 'km/h')}` : L('الطقس ينحمل…', 'Loading weather…')}${bw ? ` · ${L('أفضل وقت', 'Best')} ${fmtTime(bw.start)}` : ''}</span></div>`;
        animateGauges();
      };
      const drawAlerts = () => {
        const out = []; const closed = TRACKS.filter((t) => statusOf(t).s === 'weather_closed');
        if (closed.length) out.push(`<div class="banner blue" role="alert"><span class="ic">${ic('wave')}</span><div class="stack" style="gap:2px"><b>${L(`إغلاق تلقائي: ${closed.length} تراك جبلي`, `Auto-closed: ${closed.length} MTB tracks`)}</b><span class="small" style="opacity:.9">${L('أمطار متوقعة. المسارات الجبلية والأودية مسكّرة مؤقتاً.', 'Rain expected. MTB and wadi trails are temporarily closed.')}</span></div></div>`);
        const hot = TRACKS.map((t) => wx(t)?.feels).filter((x) => x != null); const mx = hot.length ? Math.max(...hot) : null;
        if (mx != null && mx >= 40) out.push(`<div class="banner heat" role="alert"><span class="ic">${ic('thermo')}</span><div><b>${L(`الحرارة المحسوسة ${Math.round(mx)}°`, `Feels like ${Math.round(mx)}°`)}</b><br><span class="small">${L('اركب قبل الشروق أو بالليل في تراك مضاء.', 'Ride before sunrise or at night on a lit track.')}</span></div></div>`);
        $('#alerts').innerHTML = out.join('');
      };
      $$('[data-em]').forEach((b) => b.onclick = () => { haptic(); F.em = F.em === b.dataset.em ? '' : b.dataset.em; saveF(); draw(); $('#cnt').scrollIntoView({ behavior: 'smooth' }); });
      $('#q').oninput = (e) => { F.q = e.target.value; saveF(); draw(); };
      $('#clr').onclick = () => { F = { q: '', em: '', type: '', lit: false, open: false, family: false, women: false, rental: false }; saveF(); $('#q').value = ''; draw(); };
      draw(); drawGauge(); drawAlerts();
      loadWeather().then(() => { if (cur === 'explore') { drawGauge(); drawAlerts(); draw(); } });
    },
  };
};

let mapObj = null;
V.map = () => ({
  tab: 'map',
  html: `<main class="screen">${topbar({ title: L('الخريطة', 'Map'), sub: L('تراكات الدراجات في الإمارات', 'UAE cycling tracks') })}
    <div id="chips" class="stack"></div><div class="row between"><span class="small muted" id="cnt"></span><button class="btn ghost small" id="me">${ic('pin', 16)} ${L('موقعي', 'Me')}</button></div>
    <div id="map" class="map full"></div><p class="tiny muted">${L('الدوائر المنقطة مواقع تقريبية. التراكات اللي بدون إحداثيات ما تطلع على الخريطة.', 'Dashed pins are approximate. Tracks without coordinates are not shown.')}</p></main>`,
  mount() {
    mapObj = makeMap($('#map'), [24.75, 55.35], 7); if (!mapObj) return;
    const layer = window.L.layerGroup().addTo(mapObj);
    const draw = () => {
      layer.clearLayers(); const list = filtered().filter((t) => t.lat != null);
      $('#cnt').textContent = L(`${list.length} تراك على الخريطة`, `${list.length} tracks on map`);
      list.forEach((t) => {
        const st = statusOf(t), c = isOpen(st) ? TYPES[t.type].c : '#6B7280', w = wx(t);
        window.L.marker([t.lat, t.lng], { icon: pinIcon(c, t.approx), title: t.en }).addTo(layer).bindPopup(`<div style="direction:${S.lang === 'en' ? 'ltr' : 'rtl'};min-width:190px;font-family:inherit"><b>${esc(tName(t))}</b><br><span style="font-size:12px;color:#6B7280">${esc(t.area)} · ${t.len} ${L('كم', 'km')}</span><div style="margin:6px 0;display:flex;gap:4px;flex-wrap:wrap">${typeBadge(t.type)}${statusBadge(st)}</div>${w ? `<div style="font-size:12px">${Math.round(w.feels)}° · ${windArrow(w.dir, 14)} ${Math.round(w.wind)} ${L('كم/س', 'km/h')}</div>` : ''}<a href="#/track/${t.id}" style="font-weight:700">${L('التفاصيل', 'Details')} ←</a></div>`);
        if (t.endLat) window.L.polyline([[t.lat, t.lng], [t.endLat, t.endLng]], { color: c, weight: 4, dashArray: '6 8' }).addTo(layer);
      });
      $('#chips').innerHTML = chips(); bindChips($('#chips'), draw);
    };
    draw();
    let mk; $('#me').onclick = async () => { try { const p = await getPosition(); myPos = p; mk?.remove(); mk = window.L.marker([p.lat, p.lng], { icon: meIcon() }).addTo(mapObj); mapObj.setView([p.lat, p.lng], 11); } catch { toast(L('فعّل الموقع', 'Enable location')); } };
    loadWeather().then(() => cur === 'map' && draw());
  },
  unmount() { mapObj?.remove(); mapObj = null; },
});

/* ---------- track page ---------- */
V.track = (id) => {
  const t = trackById(id); if (!t) return notfound();
  const st = statusOf(t), s = STATUS[st.s] || STATUS.open;
  const saved = store.get('saved', []).includes(id);
  const reviews = store.get('reviews', []).filter((r) => r.trackId === id);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.stars, 0) / reviews.length).toFixed(1) : null;
  const rode = rides().some((r) => r.trackId === id);
  const segs = SEGMENTS.filter((x) => x.track === id);
  const best = bestEfforts();
  const posts = allPosts().filter((p) => p.trackId === id).slice(0, 3);
  let tmap = null;
  return {
    tabs: false,
    html: `<main class="screen no-tabs">
      <div class="hero">${trackPhoto(t, { eager: true, credit: true })}<div class="shade"></div>
        <div class="bar"><a class="icon-btn" href="#/explore" style="border:0" aria-label="${L('رجوع', 'Back')}"><span class="flip">${ic('back')}</span></a>
          <div class="row"><button class="icon-btn" id="save" style="border:0" aria-label="${L('حفظ', 'Save')}">${saved ? icFill('bookmark', 20) : ic('bookmark', 20)}</button><button class="icon-btn" id="share" style="border:0" aria-label="${L('مشاركة', 'Share')}">${ic('share', 20)}</button></div></div></div>
      <div class="sheet">
        <div class="stack"><h1>${esc(tName(t))}</h1><p class="muted">${esc(t.area)} · ${esc(emName(t.emirate))}</p>
          <div class="badges">${typeBadge(t.type)}<span class="badge" style="background:var(--green-soft);color:var(--green)">${ic('shieldCheck', 13, 2)} ${esc(t.authority)}</span>${t.family ? `<span class="badge" style="background:var(--bg-2)">${ic('family', 13)} ${L('عائلي', 'Family')}</span>` : ''}${t.women ? `<span class="badge" style="background:#F3E8FF;color:#7E3AF2">${L('جلسات بنات', 'Women sessions')}</span>` : ''}${t.approx ? `<span class="badge" style="background:var(--amber-soft);color:#B07400">${L('موقع تقريبي', 'Approx. location')}</span>` : ''}</div></div>
        <section class="card tight" style="border:1.5px solid ${s.c}33"><div class="row"><span class="avatar" style="background:${s.bg};color:${s.c};border-radius:21px">${ic(st.s === 'open' ? 'shieldCheck' : st.s.includes('weather') || st.s === 'flood' ? 'wave' : st.s === 'maintenance' ? 'tool' : 'ban', 20)}</span><div class="stack" style="gap:0"><b style="color:${s.c}">${L(s.ar, s.en)}</b><span class="tiny muted">${st.at ? `${L('آخر تحديث', 'Updated')} ${ago(st.at)}${st.by ? ' · ' + esc(st.by) : ''}` : L('ما في بلاغات من المجتمع. كن أول واحد يحدّث الحالة!', 'No community updates yet.')}</span></div></div></section>
        <section class="card" id="wxCard"></section>
        <div class="grid3">
          <div class="stat"><b class="num">${t.len}</b><span>${L('كم', 'km')}</span></div>
          <div class="stat"><b class="num">${t.gain != null ? t.gain : '–'}</b><span>${L('م صعود', 'm gain')}</span></div>
          <div class="stat"><b class="num">${t.grad ? t.grad + '%' : t.maxEl ? t.maxEl : '–'}</b><span>${t.grad ? L('متوسط الميلان', 'avg grade') : L('أعلى ارتفاع', 'max elev.')}</span></div>
        </div>
        <section class="card"><h2>${L('تفاصيل التراك', 'Track details')}</h2>
          ${[['route', L('المسافة', 'Distance'), t.lenText], t.loops?.length ? ['lap', L('اللفات', 'Loops'), t.loops.join(' · ')] : null, ['bike', L('السطح', 'Surface'), t.surface], ['clock', L('المواعيد', 'Hours'), t.hours || L('تأكد قبل تروح', 'Check before going')], ['light', L('الإنارة', 'Lighting'), litLabel(t.lit) + (t.litNote ? ' – ' + t.litNote : '')], ['flag', L('الرسوم', 'Fee'), t.fee || L('تأكد', 'Verify')]].filter(Boolean).map(([i, k, v]) => `<div class="row" style="align-items:flex-start"><span style="color:var(--orange);margin-top:2px">${ic(i, 18)}</span><div class="stack" style="gap:0"><span class="tiny muted">${k}</span><span>${esc(v)}</span></div></div>`).join('')}
          ${t.rules ? `<p class="small" style="background:var(--orange-soft);border-radius:12px;padding:10px 12px">💡 ${esc(t.rules)}</p>` : ''}
          ${t.fac.length ? `<div class="badges">${t.fac.map((f) => `<span class="badge" style="background:var(--bg-2)">${ic(facIcon[f], 13)} ${L(FAC[f][0], FAC[f][1])}</span>`).join('')}</div>` : ''}</section>
        ${t.lat != null ? `<div id="tmap" class="map" style="height:200px"></div>` : `<div class="banner amber"><span class="ic">${ic('pin')}</span><div class="small">${L('الموقع الدقيق للحين مب مضاف. ساعدنا واقترح الموقع من المجتمع.', 'Exact location not added yet. Suggest it in Community.')}</div></div>`}
        <div class="grid2">${t.lat != null ? `<a class="btn ghost" href="https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}" target="_blank" rel="noopener">${ic('route', 18)} Google Maps</a><a class="btn ghost" href="https://waze.com/ul?ll=${t.lat},${t.lng}&navigate=yes" target="_blank" rel="noopener">${ic('pin', 18)} Waze</a>` : ''}</div>
        ${isOpen(st) ? `<a class="btn" href="#/record/${t.id}" style="min-height:58px;font-size:17px">${ic('bike', 20)} ${L('سجّل ركبة هنا', 'Ride here')}</a>` : `<div class="banner blue"><span class="ic">${ic('ban')}</span><div><b>${L('التراك مسكّر حالياً', 'Track currently closed')}</b><br><span class="small">${L('شوف تراك ثاني قريب من الخريطة.', 'Find another nearby on the map.')}</span></div></div>`}
        ${segs.length ? `<section class="card"><h2>${ic('trophy', 20)} ${L('المقاطع', 'Segments')}</h2>${segs.map((g) => `<div class="row between"><div class="stack" style="gap:0"><b>${esc(S.lang === 'en' ? g.en : g.name)}</b><span class="tiny muted">${g.dist} ${L('كم', 'km')} · ${g.kind === 'summit' ? L('صعود للقمة', 'Summit climb') : L('لفة كاملة', 'Full loop')}</span></div><span class="stack" style="gap:0;text-align:end"><span class="tiny muted">${L('أفضل وقت لك', 'Your best')}</span><b class="num">${best[g.id] ? fmtDur(best[g.id].time) + ' 🏆' : '–'}</b></span></div>`).join('')}<p class="tiny muted">${L('لوحة المتصدرين بين كل الدرّاجين تنضاف مع السيرفر.', 'The all-riders leaderboard arrives with the server.')}</p></section>` : ''}
        <section class="stack"><div class="row between"><h2>${L('من المجتمع', 'From the community')}</h2><a class="small" href="#/post?track=${t.id}">${ic('flag', 14)} ${L('بلّغ أو شارك', 'Report or share')}</a></div>${posts.length ? posts.map(postCard).join('') : `<p class="small muted">${L('ما في منشورات عن هالتراك.', 'No posts yet.')}</p>`}</section>
        <section class="card"><div class="row between"><h2>${L('التقييمات', 'Reviews')}</h2>${avg ? `<b style="color:var(--amber)">★ ${avg} <span class="small muted">(${reviews.length})</span></b>` : ''}</div>${reviews.length ? reviews.slice(-5).reverse().map((r) => `<div class="stack" style="gap:2px;border-top:1px solid var(--line);padding-top:8px"><div class="row between"><b class="small">${esc(r.name)}</b><span class="tiny muted">${ago(r.at)}</span></div><span style="color:var(--amber)">${'★'.repeat(r.stars)}</span>${r.text ? `<p class="small">${esc(r.text)}</p>` : ''}</div>`).join('') : `<p class="small muted">${rode ? L('قيّم التراك من ملخص ركبتك.', 'Rate it from your ride summary.') : L('التقييم بس للي ركبوا التراك.', 'Only riders who rode here can review.')}</p>`}</section>
        <p class="tiny muted">${L('المصادر', 'Sources')}: ${t.src.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(' · ')} · ${L('آخر تحقق', 'Last verified')} ${VERIFIED}</p>
      </div></main>`,
    mount() {
      const drawWx = () => {
        const w = wx(t), sc = rideIndex(t), lab = indexLabel(sc.s), bw = bestWindow(t);
        $('#wxCard').innerHTML = `<div class="row between"><h2>${L('الظروف الحين', 'Conditions now')}</h2>${w ? `<span class="tiny muted">Open-Meteo</span>` : ''}</div>
          <div class="row" style="gap:14px">${gauge(sc.s, 96)}<div class="stack" style="gap:2px"><span class="row" style="gap:8px"><span class="score num" style="color:${lab.c}">${sc.s}</span><b style="color:${lab.c}">${lab.t}</b></span><span class="tiny muted">${sc.why.length ? sc.why.join('، ') : L('الظروف حلوة', 'Conditions look good')}</span></div></div>
          ${w ? `<div class="grid3">
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${Math.round(w.temp)}°</b><span>${L('محسوسة', 'feels')} ${Math.round(w.feels)}°</span></div>
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num row" style="justify-content:center;gap:4px">${windArrow(w.dir, 18)}${Math.round(w.wind)}</b><span>${L('ريح كم/س من', 'wind km/h from')} ${compass(w.dir)}</span></div>
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${w.hum}%</b><span>${L('رطوبة', 'humidity')}</span></div>
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${Math.round(w.uv ?? 0)}</b><span>UV</span></div>
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${w.prob}%</b><span>${L('مطر', 'rain')}</span></div>
            <div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num" style="font-size:15px">${fmtTime(sunriseOf(t))}<br>${fmtTime(sunsetOf(t))}</b><span>${L('شروق / غروب', 'sunrise / sunset')}</span></div></div>
            ${bw ? `<div class="row" style="background:var(--green-soft);border-radius:14px;padding:10px 12px;gap:10px">${ic('clock', 20)}<span class="small"><b>${L('أفضل وقت للركوب', 'Best time to ride')}:</b> ${fmtTime(bw.start)} – ${fmtTime(bw.end)} <span class="muted">(${L('مؤشر', 'index')} ${bw.s})</span></span></div>` : ''}
            ${t.loop && w.wind >= 12 ? `<p class="small muted">${ic('wind', 14)} ${L(`الريح من ${compass(w.dir)}: بتكون ضدك وإنت متجه ${compass(w.dir)}، وتساعدك في الرجعة.`, `Wind from ${compass(w.dir)}: headwind when heading ${compass(w.dir)}, tailwind on the way back.`)}</p>` : ''}` : `<p class="small muted">${L('بيانات الطقس تنحمل… تحتاج إنترنت.', 'Loading weather… needs internet.')}</p>`}`;
        animateGauges();
      };
      drawWx(); loadWeather().then(() => cur === 'track' && drawWx());
      if (t.lat != null && window.L?.map) { tmap = makeMap($('#tmap'), [t.lat, t.lng], 13); if (tmap) { window.L.marker([t.lat, t.lng], { icon: pinIcon(TYPES[t.type].c, t.approx) }).addTo(tmap); if (t.endLat) { window.L.marker([t.endLat, t.endLng], { icon: pinIcon('#0E1116') }).addTo(tmap); window.L.polyline([[t.lat, t.lng], [t.endLat, t.endLng]], { color: '#FF5B14', dashArray: '6 8' }).addTo(tmap); tmap.fitBounds([[t.lat, t.lng], [t.endLat, t.endLng]], { padding: [30, 30] }); } const w = wx(t); if (w) window.L.marker([t.lat + .01, t.lng + .01], { icon: window.L.divIcon({ className: '', html: `<div style="background:var(--card);border-radius:12px;padding:4px 8px;box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;gap:4px;align-items:center;font-size:12px;font-weight:700;white-space:nowrap">${windArrow(w.dir, 16)} ${Math.round(w.wind)}</div>`, iconSize: [60, 26] }) }).addTo(tmap); } }
      $('#save').onclick = () => { haptic(); let sv = store.get('saved', []); sv = sv.includes(id) ? sv.filter((x) => x !== id) : [...sv, id]; store.set('saved', sv); toast(sv.includes(id) ? L('انحفظ 🔖', 'Saved 🔖') : L('انشال', 'Removed')); render(); };
      $('#share').onclick = async () => { const text = `${t.name} – ${t.lenText}\n${t.lat != null ? `https://maps.google.com/?q=${t.lat},${t.lng}\n` : ''}#دوّاسة`; try { if (navigator.share) await navigator.share({ title: t.name, text, url: location.href }); else { await navigator.clipboard.writeText(text); toast(L('انسخ', 'Copied')); } } catch {} };
      bindPosts();
    },
    unmount() { tmap?.remove(); tmap = null; },
  };
};

/* ---------- community ---------- */
const seedTime = (h) => store.get('installedAt') - h * 3600000;
function allPosts() {
  const conf = store.get('confirms', {});
  return [...store.get('posts', []), ...SEED_POSTS.map((p) => ({ ...p, at: seedTime(p.hoursAgo) }))].map((p) => ({ ...p, confirms: (p.confirms || 0) + (conf[p.id] ? 1 : 0), confirmed: !!conf[p.id] })).sort((a, b) => b.at - a.at);
}
const REACTS = [['fire', '🔥', 'يحمّس', 'Fire'], ['clap', '👏', 'كفو', 'Kudos'], ['heart', '❤️', 'حبيته', 'Love']];
function trustLevel(n) { return n >= 15 ? { ar: 'سفير التراك', en: 'Track Ambassador', c: '#B07400', bg: 'var(--amber-soft)', next: null } : n >= 5 ? { ar: 'مراسل موثوق', en: 'Trusted reporter', c: 'var(--blue)', bg: 'var(--blue-soft)', next: 15 } : { ar: 'مراسل', en: 'Reporter', c: 'var(--orange)', bg: 'var(--orange-soft)', next: 5 }; }
function postCard(p) {
  const t = trackById(p.trackId), type = REPORT_TYPES.find((x) => x.id === p.type) || REPORT_TYPES[0];
  const myR = store.get('reacts', {})[p.id] || {};
  const img = p.photoData ? { data: p.photoData, place: t?.name } : p.photo ? PHOTOS[p.photo] : null;
  const ride = p.rideId ? rides().find((r) => r.id === p.rideId) : null;
  const canConfirm = !p.mine && !['photo', 'ride', 'tip', 'suggestion'].includes(p.type);
  return `<article class="post ${p.team ? 'team' : ''}">
    <div class="row"><span class="avatar" style="background:${p.team ? 'var(--asphalt)' : 'var(--orange-soft)'};color:${p.team ? '#fff' : 'var(--orange)'}">${p.team ? logo(30) : esc((p.author || '?')[0])}</span>
      <div class="stack" style="gap:0;flex:1;min-width:0"><b class="small">${esc(p.author)}</b><span class="tiny muted">${ago(p.at)}${t ? ` · <a href="#/track/${t.id}">${esc(tName(t))}</a>` : ''}</span></div>
      ${['photo', 'ride'].includes(p.type) ? '' : `<span class="badge" style="background:var(--bg-2)">${ic(type.icon, 13)} ${L(type.ar, type.en)}</span>`}</div>
    ${img ? photo(img, { cls: 'photo', credit: !!img.by, type: t?.type }) : ''}
    ${ride ? `<div class="grid3"><div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${distNum(ride.dist).toFixed(1)}</b><span>${distUnit()}</span></div><div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${fmtDur(ride.moving)}</b><span>${L('وقت', 'time')}</span></div><div class="stat" style="box-shadow:none;background:var(--bg)"><b class="num">${fmtSpeed(ride.avg)}</b><span>${speedUnit()}</span></div></div>` : ''}
    <p>${esc(p.text)}</p>
    <div class="row between wrap" style="gap:8px"><div class="reacts">${REACTS.map(([k, e, ar, en]) => { const n = (p.reacts?.[k] || 0) + (myR[k] ? 1 : 0); return `<button class="react" data-react="${p.id}" data-k="${k}" aria-pressed="${!!myR[k]}" aria-label="${L(ar, en)}">${e} <span>${n || L(ar, en)}</span></button>`; }).join('')}</div>
      ${canConfirm ? `<button class="btn ghost small" data-confirm="${p.id}" aria-pressed="${p.confirmed}" style="${p.confirmed ? 'border-color:var(--green);color:var(--green)' : ''}">${ic('check', 15)} ${p.confirmed ? L('أكّدت', 'Confirmed') : L('أكّد', 'Confirm')} · ${p.confirms}</button>` : ''}</div></article>`;
}
function bindPosts() {
  $$('[data-react]').forEach((b) => b.onclick = () => {
    haptic(8); const r = store.get('reacts', {}), id = b.dataset.react, k = b.dataset.k; r[id] = r[id] || {}; r[id][k] = !r[id][k]; store.set('reacts', r);
    const p = allPosts().find((x) => x.id === id); const n = (p?.reacts?.[k] || 0) + (r[id][k] ? 1 : 0); const r0 = REACTS.find((x) => x[0] === k);
    b.setAttribute('aria-pressed', r[id][k]); b.querySelector('span').textContent = n || L(r0[2], r0[3]); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  });
  $$('[data-confirm]').forEach((b) => b.onclick = () => {
    haptic(); const c = store.get('confirms', {}), id = b.dataset.confirm; if (c[id]) delete c[id]; else c[id] = Date.now(); store.set('confirms', c);
    const p = allPosts().find((x) => x.id === id); const rt = REPORT_TYPES.find((x) => x.id === p?.type);
    if (p && rt?.status && p.confirms >= 3) { const s = store.get('status', {}); s[p.trackId] = { s: rt.status, at: Date.now(), by: L('بلاغ مؤكّد من المجتمع', 'Confirmed community report') }; store.set('status', s); toast(L('تأكد البلاغ من 3 أشخاص وتحدّثت حالة التراك', 'Confirmed by 3 riders – track status updated')); }
    render();
  });
}
let ctab = 'all';
V.community = () => {
  const now = new Date(), month = now.toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'ar-AE', { month: 'long' });
  const monthKm = rides().filter((r) => { const d = new Date(r.startedAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((a, r) => a + r.dist, 0) / 1000;
  const myN = store.get('posts', []).length, tl = trustLevel(myN);
  const tabs = [['all', L('الكل', 'All')], ['photos', L('📸 صور', '📸 Photos')], ['rides', L('ركبات', 'Rides')], ['reports', L('بلاغات', 'Reports')], ['team', L('فريق دوّاسة', 'Team')]];
  const list = allPosts().filter((p) => ctab === 'all' || (ctab === 'photos' && (p.photo || p.photoData)) || (ctab === 'rides' && p.type === 'ride') || (ctab === 'reports' && !['photo', 'ride', 'tip', 'suggestion'].includes(p.type)) || (ctab === 'team' && p.team));
  return {
    tab: 'community',
    html: `<main class="screen">${topbar({ title: L('المجتمع', 'Community'), sub: L('ركبات وصور وحالة التراكات أول بأول', 'Rides, photos and live track status') })}
      <div class="dark-card"><div style="position:relative;display:flex;align-items:center;justify-content:center">${ring(monthKm / 200)}<b style="position:absolute;font-size:13px" class="num">${Math.round(monthKm)}</b></div><div class="stack" style="gap:2px;flex:1"><span class="tiny" style="color:#FF9A6B">${L('تحدي', 'Challenge')} ${esc(month)}</span><b style="font-size:18px">${L('200 كم هالشهر', '200 km this month')}</b><span class="small" style="color:#C9CED8">${monthKm >= 200 ? L('كفو! خلّصت التحدي 🏅', 'Done! 🏅') : L(`باقي ${Math.ceil(200 - monthKm)} كم`, `${Math.ceil(200 - monthKm)} km to go`)}</span></div></div>
      <a class="card tight press" href="#/events" style="flex-direction:row;align-items:center;gap:12px;text-decoration:none;color:inherit"><span class="avatar" style="background:var(--orange-soft);color:var(--orange)">${ic('calendar', 20)}</span><div class="stack" style="gap:0;flex:1"><b>${L('الركبات الجماعية', 'Group rides')}</b><span class="tiny muted">${L('انضم لركبة أو نظّم وحدة', 'Join a ride or organise one')}</span></div><span class="flip muted">${ic('fwd', 18)}</span></a>
      <div class="card tight" style="flex-direction:row;align-items:center;gap:12px;background:${tl.bg}"><span class="avatar" style="background:var(--card);color:${tl.c}">${ic('shield', 20)}</span><div class="stack" style="gap:3px;flex:1"><b class="small">${L('مستواك', 'Your level')}: ${L(tl.ar, tl.en)}</b><div class="progress" style="background:var(--card)"><div style="width:${Math.min(100, myN / 15 * 100)}%"></div></div><span class="tiny muted">${L('كل بلاغ أو صورة تقرّبك من «سفير التراك»', 'Every post brings you closer to Track Ambassador')}</span></div></div>
      <div class="chips">${tabs.map(([k, l]) => `<button class="chip" data-tab="${k}" aria-pressed="${ctab === k}">${l}</button>`).join('')}</div>
      <div class="stack stagger" style="gap:12px">${list.length ? list.map(postCard).join('') : `<div class="empty">${ic('camera', 32)}<p>${L('ما في شي هنا للحين', 'Nothing here yet')}</p></div>`}</div>
      <p class="tiny muted" style="text-align:center">${L('نسخة تجريبية: منشوراتك تنحفظ على جوالك. المشاركة مع كل الدرّاجين تنضاف مع السيرفر.', 'Beta: posts are saved on your phone. Sharing with everyone comes with the server.')}</p>
      <a class="fab" href="#/post">${ic('plus', 20)} ${L('شارك', 'Share')}</a></main>`,
    mount() { $$('[data-tab]').forEach((b) => b.onclick = () => { haptic(); ctab = b.dataset.tab; render(); }); bindPosts(); },
  };
};
V.post = (arg) => {
  const p = profile();
  const qs = new URLSearchParams((location.hash.split('?')[1]) || '');
  if (!p || p.guest) return { tabs: false, html: `<main class="screen no-tabs">${topbar({ title: L('شارك', 'Share'), back: '#/community' })}<div class="empty">${ic('user', 36)}<p>${L('سوّ حسابك أول.', 'Create your profile first.')}</p><a class="btn" style="width:auto" href="#/onboard">${L('سوّ حسابك', 'Create profile')}</a></div></main>` };
  let type = qs.get('type') || '', photoData = null;
  const tid = qs.get('track') || '';
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: L('شارك مع المجتمع', 'Share with the community'), back: tid ? `#/track/${tid}` : '#/community' })}
      <form id="f" class="stack" style="gap:16px">
        <div class="field"><label>${L('شو تبي تشارك؟', 'What are you sharing?')}</label><div class="type-grid">${REPORT_TYPES.filter((r) => !r.hidden).map((r) => `<button type="button" data-type="${r.id}" aria-pressed="${type === r.id}">${ic(r.icon, 22)}${L(r.ar, r.en)}</button>`).join('')}</div></div>
        <div class="field"><label for="tr">${L('التراك', 'Track')}</label><select class="input" id="tr"><option value="">${L('اختار (أو اكتب تراك جديد في الاقتراح)', 'Choose (or describe a new one)')}</option>${EMIRATES.filter((e) => TRACKS.some((t) => t.emirate === e)).map((e) => `<optgroup label="${esc(emName(e))}">${TRACKS.filter((t) => t.emirate === e).map((t) => `<option value="${t.id}" ${t.id === tid ? 'selected' : ''}>${esc(tName(t))}</option>`).join('')}</optgroup>`).join('')}</select></div>
        <div class="field"><label>${L('صورة (اختياري)', 'Photo (optional)')}</label><label class="upload" id="up">${ic('camera', 30)}<span class="small">${L('صوّر أو اختار من الألبوم', 'Take or choose a photo')}</span><input type="file" id="file" accept="image/*" hidden></label></div>
        <div class="field"><label for="tx">${L('اكتب شي', 'Write something')}</label><textarea class="input" id="tx" maxlength="500" placeholder="${L('شو شفت بالضبط؟ أو اقترح تراك جديد مع موقعه', 'What did you see? Or suggest a new track with its location')}"></textarea></div>
        <p class="tiny muted">${L('شارك اللي شفته بنفسك، واحترم خصوصية الناس في الصور. البلاغ يتأكد لما يأكده 3 درّاجين.', 'Share only what you saw and respect people’s privacy. Reports are confirmed by 3 riders.')}</p>
        <button class="btn" type="submit">${ic('check', 18)} ${L('نشر', 'Post')}</button></form></main>`,
    mount() {
      $$('[data-type]').forEach((b) => b.onclick = () => { haptic(); type = b.dataset.type; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
      $('#file').onchange = async (e) => { const f = e.target.files?.[0]; if (!f) return; try { photoData = await compressImage(f); $('#up').innerHTML = `<img src="${photoData}" alt="">`; if (!type) { type = 'photo'; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.type === 'photo')); } } catch { toast(L('ما قدرنا نفتح الصورة', 'Could not open image')); } };
      $('#f').onsubmit = (e) => {
        e.preventDefault(); const track = $('#tr').value;
        if (!type) return toast(L('اختار نوع المنشور', 'Choose a type'));
        if (!track && type !== 'suggestion') return toast(L('اختار التراك', 'Choose a track'));
        if (type === 'photo' && !photoData) return toast(L('أضف صورة', 'Add a photo'));
        const rt = REPORT_TYPES.find((r) => r.id === type);
        const posts = store.get('posts', []);
        posts.unshift({ id: uid(), mine: true, author: p.name, trackId: track || null, type, text: $('#tx').value.trim() || L(rt.ar, rt.en), at: Date.now(), photoData });
        if (!store.set('posts', posts)) { posts[0].photoData = null; store.set('posts', posts); toast(L('مساحة الجوال امتلت، انحفظ بدون الصورة', 'Storage full, saved without photo')); }
        if (rt.status && track) { const s = store.get('status', {}); s[track] = { s: rt.status, at: Date.now(), by: p.name }; store.set('status', s); }
        haptic([10, 30, 10]); if (type === 'photo') confetti(30);
        toast(L('ما قصّرت! انتشر منشورك', 'Thanks! Posted')); ctab = 'all'; location.hash = '#/community';
      };
    },
  };
};

/* ---------- events ---------- */
function allEvents() {
  const mine = store.get('events', []), joined = store.get('joined', {});
  const day = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d.toISOString().slice(0, 10); };
  return [...mine, ...SEED_EVENTS.map((e) => ({ ...e, date: day(e.dayOffset) }))].map((e) => ({ ...e, isJoined: !!joined[e.id], count: (e.joined || 0) + (joined[e.id] ? 1 : 0) })).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}
const evTs = (e) => new Date(`${e.date}T${e.time}:00+04:00`).getTime();
const levelName = (l) => ({ beginner: L('مبتدئ', 'Beginner'), mid: L('متوسط', 'Intermediate'), pro: L('محترف', 'Advanced') }[l] || l);
V.events = () => ({
  tab: 'community',
  html: `<main class="screen">${topbar({ title: L('الركبات الجماعية', 'Group rides'), back: '#/community' })}
    <div class="stack stagger" style="gap:12px">${allEvents().map((e) => { const t = trackById(e.trackId); return `<a class="card press" href="#/event/${e.id}" style="text-decoration:none;color:inherit;flex-direction:row;gap:12px;align-items:center">
      <div class="stack" style="gap:0;align-items:center;justify-content:center;width:58px;height:62px;border-radius:16px;background:var(--orange);color:#fff;flex-shrink:0"><b style="font-size:22px;line-height:1">${new Date(evTs(e)).getDate()}</b><span class="tiny">${fmtDate(evTs(e), { month: 'short' })}</span></div>
      <div class="stack" style="gap:3px;flex:1;min-width:0"><b>${esc(e.title)}</b><span class="tiny muted">${t ? esc(tName(t)) : ''} · ${e.time} · ${e.distance} ${L('كم', 'km')} · ${esc(e.pace)}</span>
        <div class="badges">${e.example ? `<span class="badge" style="background:var(--bg-2)">${L('مثال توضيحي', 'Example')}</span>` : ''}${e.women ? `<span class="badge" style="background:#F3E8FF;color:#7E3AF2">${L('بنات فقط', 'Women only')}</span>` : ''}${e.lights ? `<span class="badge" style="background:var(--amber-soft);color:#B07400">${L('أضواء إلزامية', 'Lights required')}</span>` : ''}${e.isJoined ? `<span class="badge" style="background:var(--green-soft);color:var(--green)">${L('مسجّل', 'Joined')}</span>` : ''}</div></div>
      <span class="tiny muted num">${e.count}/${e.max}</span></a>`; }).join('')}</div>
    <a class="fab" href="#/newevent">${ic('plus', 20)} ${L('نظّم ركبة', 'Organise')}</a></main>`,
  mount() {},
});
V.event = (id) => {
  const e = allEvents().find((x) => x.id === id); if (!e) return notfound();
  const t = trackById(e.trackId), ts = evTs(e);
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: esc(e.title), back: '#/events' })}
      ${e.example ? `<div class="banner amber"><span class="ic">${ic('info')}</span><div class="small">${L('هذي فعالية مثال توضيحي عشان تشوف شكل الركبات الجماعية.', 'This is an example event to show how group rides look.')}</div></div>` : ''}
      <div class="dark-card" style="flex-direction:column;align-items:stretch"><span class="tiny" style="color:#FF9A6B">${L('تبدأ بعد', 'Starts in')}</span><b class="num" id="cd" style="font-size:30px"></b><span class="small" style="color:#C9CED8">${fmtDate(ts, { weekday: 'long', day: 'numeric', month: 'long' })} · ${e.time}</span></div>
      <section class="card">${[['pin', L('التراك', 'Track'), t ? tName(t) : '–'], ['route', L('المسافة', 'Distance'), `${e.distance} ${L('كم', 'km')}`], ['bolt', L('السرعة', 'Pace'), e.pace], ['user', L('المستوى', 'Level'), levelName(e.level)], ['community', L('المسجّلين', 'Riders'), `${e.count} / ${e.max}`], ['flag', L('المنظّم', 'Organiser'), e.organizer]].map(([i, k, v]) => `<div class="row"><span style="color:var(--orange)">${ic(i, 18)}</span><span class="muted small" style="width:80px">${k}</span><b class="small">${esc(v)}</b></div>`).join('')}${e.note ? `<p class="small" style="background:var(--bg);border-radius:12px;padding:10px">${esc(e.note)}</p>` : ''}${e.rta ? `<span class="badge" style="background:var(--green-soft);color:var(--green);align-self:flex-start">${ic('shieldCheck', 13)} ${L('المنظّم أكد موافقة هيئة الطرق والمواصلات', 'Organiser confirmed RTA approval')}</span>` : ''}</section>
      <button class="btn ${e.isJoined ? 'ghost' : ''}" id="join">${e.isJoined ? L('إلغاء التسجيل', 'Leave') : e.count >= e.max ? L('سجّلني في قائمة الانتظار', 'Join waitlist') : L('سجّلني 🚴', 'Join 🚴')}</button>
      <div class="grid2"><button class="btn ghost" id="ics">${ic('calendar', 18)} ${L('أضف للتقويم', 'Add to calendar')}</button><button class="btn ghost" id="sh">${ic('share', 18)} ${L('شارك', 'Share')}</button></div>
      ${t ? `<a class="btn link" href="#/track/${t.id}" style="align-self:center">${L('شوف التراك والطقس', 'See track & weather')}</a>` : ''}</main>`,
    mount() {
      const tickCd = () => { const s = Math.max(0, (ts - Date.now()) / 1000); const d = Math.floor(s / 86400); $('#cd') && ($('#cd').textContent = `${d ? d + L(' يوم ', 'd ') : ''}${fmtDur(s % 86400)}`); };
      tickCd(); this._iv = setInterval(tickCd, 1000);
      $('#join').onclick = () => { if (!profile() || profile().guest) { toast(L('سوّ حسابك أول', 'Create a profile first')); return location.hash = '#/onboard'; } const j = store.get('joined', {}); if (j[id]) delete j[id]; else { j[id] = Date.now(); confetti(30); } store.set('joined', j); haptic(); render(); };
      $('#ics').onclick = () => { const dt = (x) => new Date(x).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Dawwasa//AR\nBEGIN:VEVENT\nUID:${id}@dawwasa\nDTSTAMP:${dt(Date.now())}\nDTSTART:${dt(ts)}\nDTEND:${dt(ts + 2.5 * 3600000)}\nSUMMARY:${e.title}\nLOCATION:${t ? `${t.en} (${t.lat},${t.lng})` : ''}\nDESCRIPTION:${e.note || ''}\nEND:VEVENT\nEND:VCALENDAR`; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'dawwasa-ride.ics'; a.click(); };
      $('#sh').onclick = async () => { const text = `${e.title} – ${fmtDate(ts)} ${e.time}\n${t ? tName(t) : ''} · ${e.distance} km · ${e.pace}\n#دوّاسة`; try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast(L('انسخ', 'Copied')); } } catch {} };
    },
    unmount() { clearInterval(this._iv); },
  };
};
V.newevent = () => {
  const p = profile();
  if (!p || p.guest) return { tabs: false, html: `<main class="screen no-tabs">${topbar({ title: L('نظّم ركبة', 'Organise'), back: '#/events' })}<div class="empty"><p>${L('سوّ حسابك أول.', 'Create your profile first.')}</p><a class="btn" style="width:auto" href="#/onboard">${L('سوّ حسابك', 'Create profile')}</a></div></main>` };
  const tom = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: L('نظّم ركبة جماعية', 'Organise a group ride'), back: '#/events' })}
      <form id="f" class="stack" style="gap:14px">
        <div class="field"><label for="ti">${L('العنوان', 'Title')}</label><input class="input" id="ti" required placeholder="${L('مثلاً: ركبة فجر الجمعة', 'e.g. Friday dawn ride')}"></div>
        <div class="field"><label for="tr">${L('التراك', 'Track')}</label><select class="input" id="tr" required>${TRACKS.filter((t) => t.lat != null).map((t) => `<option value="${t.id}">${esc(tName(t))}</option>`).join('')}</select></div>
        <div class="grid2"><div class="field"><label for="dt">${L('التاريخ', 'Date')}</label><input class="input" type="date" id="dt" value="${tom}" min="${new Date().toISOString().slice(0, 10)}"></div><div class="field"><label for="tm">${L('الوقت', 'Time')}</label><input class="input" type="time" id="tm" value="05:30"></div></div>
        <div class="grid2"><div class="field"><label for="ds">${L('المسافة (كم)', 'Distance (km)')}</label><input class="input" type="number" id="ds" value="40" min="1"></div><div class="field"><label for="mx">${L('أقصى عدد', 'Max riders')}</label><input class="input" type="number" id="mx" value="20" min="2"></div></div>
        <div class="field"><label for="pc">${L('السرعة', 'Pace')}</label><input class="input" id="pc" value="25–28 ${L('كم/س', 'km/h')}"></div>
        <div class="field"><label for="lv">${L('المستوى', 'Level')}</label><select class="input" id="lv"><option value="beginner">${levelName('beginner')}</option><option value="mid" selected>${levelName('mid')}</option><option value="pro">${levelName('pro')}</option></select></div>
        <label class="switch"><span>${L('أضواء إلزامية', 'Lights required')}</span><input type="checkbox" id="li" checked></label>
        <label class="switch"><span>${L('للبنات فقط', 'Women only')}</span><input type="checkbox" id="wo"></label>
        <label class="check card tight" id="rtaRow" style="box-shadow:none;border:1px solid var(--line)"><input type="checkbox" id="rta"><span class="small">${L('في دبي: الركبات الجماعية لأكثر من 4 درّاجين تحتاج موافقة هيئة الطرق والمواصلات. أأكد إني حاصل عليها.', 'In Dubai, group rides of more than 4 riders need RTA approval. I confirm I have it.')}</span></label>
        <div class="field"><label for="nt">${L('ملاحظات', 'Notes')}</label><textarea class="input" id="nt" placeholder="${L('نقطة التجمع، المتطلبات…', 'Meeting point, requirements…')}"></textarea></div>
        <button class="btn" type="submit">${L('انشر الركبة', 'Publish ride')}</button></form></main>`,
    mount() {
      const sync = () => { $('#rtaRow').style.display = trackById($('#tr').value)?.emirate === 'دبي' ? '' : 'none'; }; $('#tr').onchange = sync; sync();
      $('#f').onsubmit = (ev) => {
        ev.preventDefault(); const t = trackById($('#tr').value), mx = +$('#mx').value;
        if (t.emirate === 'دبي' && mx > 4 && !$('#rta').checked) return toast(L('أكّد موافقة هيئة الطرق والمواصلات أو خلّ العدد 4 أو أقل', 'Confirm RTA approval or keep it to 4 riders'));
        const e = { id: uid(), mine: true, title: $('#ti').value.trim(), trackId: t.id, date: $('#dt').value, time: $('#tm').value, distance: +$('#ds').value, max: mx, pace: $('#pc').value, level: $('#lv').value, lights: $('#li').checked, women: $('#wo').checked, rta: $('#rta').checked, note: $('#nt').value.trim(), organizer: p.name, joined: 0 };
        const all = store.get('events', []); all.push(e); store.set('events', all); const j = store.get('joined', {}); j[e.id] = Date.now(); store.set('joined', j);
        confetti(40); toast(L('انتشرت ركبتك الجماعية 🚴‍♂️', 'Group ride published 🚴‍♂️')); location.hash = `#/event/${e.id}`;
      };
    },
  };
};

/* ---------- SOS + rules ---------- */
V.sos = () => {
  const p = profile() || {}; const med = store.get('medical', { blood: '', allergy: '' });
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: L('الطوارئ', 'Emergency'), back: 'javascript:history.back()', sos: false })}
      <section class="sos-hero"><div class="grid2"><a class="sos-big" href="tel:999"><b>999</b><span class="small" style="font-weight:700">${L('الشرطة', 'Police')}</span></a><a class="sos-big" href="tel:998"><b>998</b><span class="small" style="font-weight:700">${L('الإسعاف', 'Ambulance')}</span></a></div>
        <button class="btn white" id="loc">${ic('pin', 18)} ${L('حدّد موقعي واعرض الإحداثيات', 'Show my coordinates')}</button>
        <div id="lo" class="stack" hidden><div class="coords" id="co"></div><p class="small" style="text-align:center;opacity:.9">${L('اقرا الأرقام للمسعف', 'Read these to the operator')}</p><div class="grid2"><a class="btn white small" id="sm" style="width:100%">SMS</a><a class="btn white small" id="wa" target="_blank" rel="noopener" style="width:100%">WhatsApp</a></div></div></section>
      <section class="list">${EMERGENCY.map((e) => `<div><div class="grow"><b>${L(e.ar, e.en)}</b><span class="small muted">${L(e.hint, e.hintEn)}</span></div><a class="tel" href="tel:${e.num}" style="background:${e.urgent ? 'var(--red)' : 'var(--bg-2)'};color:${e.urgent ? '#fff' : 'var(--ink)'}">${ic('phone', 15, 2)} ${e.num}</a></div>`).join('')}${p.ecPhone ? `<div><div class="grow"><b>${esc(p.ecName || L('جهة الطوارئ', 'Contact'))}</b><span class="small muted">${L('جهة الطوارئ', 'Emergency contact')}</span></div><a class="tel" href="tel:${esc(p.ecPhone)}" style="background:var(--orange);color:#fff">${ic('phone', 15, 2)} ${L('اتصل', 'Call')}</a></div>` : ''}</section>
      <section class="card"><h2>${L('إذا طحت', 'If you crash')}</h2><p class="small">${L('اطلع من الطريق لمكان آمن، ولا تحرّك رقبتك إذا تحس بألم. اتصل 998، وخل أحد يوقف ورا عشان ينبّه السيارات.', 'Move off the road if you can, don’t move your neck if it hurts, call 998, and have someone warn traffic behind you.')}</p></section>
      <section class="card"><div class="row between"><h2>${L('بطاقتي الطبية', 'Medical card')}</h2><span class="tiny muted">${L('على جوالك بس', 'On your phone only')}</span></div><div class="grid2"><input class="input" id="bl" placeholder="${L('فصيلة الدم', 'Blood type')}" value="${esc(med.blood)}" dir="ltr"><input class="input" id="al" placeholder="${L('حساسية', 'Allergies')}" value="${esc(med.allergy)}"></div><button class="btn ghost" id="sv">${L('حفظ', 'Save')}</button></section>
      <a class="btn ghost" href="#/rules">${ic('shield', 18)} ${L('قوانين الدراجات في الإمارات', 'UAE cycling rules')}</a></main>`,
    mount() {
      $('#loc').onclick = async () => { try { const pos = await getPosition({ maximumAge: 0 }); $('#lo').hidden = false; $('#co').textContent = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`; const txt = L(`طوارئ! محتاج مساعدة. موقعي: ${mapsLink(pos)}`, `Emergency! I need help. My location: ${mapsLink(pos)}`); $('#sm').href = smsLink(p.ecPhone, txt); $('#wa').href = waLink(p.ecPhone, txt); } catch { toast(L('فعّل الموقع', 'Enable location')); } };
      $('#sv').onclick = () => { store.set('medical', { blood: $('#bl').value.trim(), allergy: $('#al').value.trim() }); toast(L('انحفظت', 'Saved')); };
    },
  };
};
V.rules = () => ({
  tabs: false,
  html: `<main class="screen no-tabs">${topbar({ title: L('القوانين والسلامة', 'Rules & safety'), back: 'javascript:history.back()' })}
    <div class="banner amber"><span class="ic">${ic('info')}</span><div class="small">${L('ملخص من مصادر إخبارية عامة. تأكد من الجهات الرسمية قبل الإطلاق.', 'Summary from public news sources. Verify with authorities.')}</div></div>
    <section class="list">${RULES.map((r) => `<div style="align-items:flex-start"><span style="color:var(--orange);margin-top:2px">${ic('shieldCheck', 18)}</span><div class="grow"><span>${L(r.ar, r.en)}</span>${r.src ? `<a class="tiny" href="${r.src}" target="_blank" rel="noopener">${L('المصدر', 'Source')} ↗</a>` : ''}</div></div>`).join('')}</section>
    <section class="card"><h2>${L('قبل كل ركبة', 'Before every ride')}</h2>${[L('خوذة مربوطة صح', 'Helmet strapped'), L('أضواء: أبيض قدّام وأحمر ورا', 'Lights front and rear'), L('750 مل ماي على الأقل لكل ساعة في الحر', 'At least 750 ml water per hour in heat'), L('أملاح', 'Electrolytes'), L('هويتك', 'ID'), L('ضغط الكفرات', 'Tyre pressure'), L('أحد يعرف خطتك', 'Someone knows your plan')].map((x) => `<label class="check"><input type="checkbox"><span>${x}</span></label>`).join('')}</section></main>`,
});

/* ---------- profile ---------- */
function badges() {
  const R = rides(), km = R.reduce((a, r) => a + r.dist, 0) / 1000, ems = new Set(R.map((r) => trackById(r.trackId)?.emirate).filter(Boolean));
  const has = (seg) => R.some((r) => (r.efforts || []).some((e) => e.seg === seg));
  return [
    { id: 'first', icon: 'flag', ar: 'أول ركبة', en: 'First ride', on: R.length >= 1, c: '#FF5B14' },
    { id: 'dawn', icon: 'sun', ar: 'ركّاب الفجر', en: 'Dawn rider', on: R.some((r) => { const h = new Date(r.startedAt); return h.getHours() < 6 || (h.getHours() === 6 && h.getMinutes() < 30); }), c: '#F5A524' },
    { id: 'night', icon: 'moon', ar: 'ركّاب الليل', en: 'Night rider', on: R.some((r) => new Date(r.startedAt).getHours() >= 20), c: '#2F6FED' },
    { id: 'century', icon: 'bolt', ar: '100 كم بركبة', en: '100 km ride', on: R.some((r) => r.dist >= 100000), c: '#E5484D' },
    { id: 'k1000', icon: 'route', ar: '1,000 كم', en: '1,000 km', on: km >= 1000, c: '#9B5DE5' },
    { id: 'jais', icon: 'mountain', ar: 'قمة جيس', en: 'Jais summit', on: has('jais-climb'), c: '#18B26B' },
    { id: 'hafeet', icon: 'mountain', ar: 'قمة حفيت', en: 'Hafeet summit', on: has('hafeet-climb'), c: '#0EA5A4' },
    { id: 'em5', icon: 'map', ar: '5 إمارات', en: '5 emirates', on: ems.size >= 5, c: '#00732F' },
    { id: 'helper', icon: 'shield', ar: 'خدوم المجتمع', en: 'Community helper', on: store.get('posts', []).length >= 5, c: '#B07400' },
  ];
}
V.profile = () => {
  const p = profile() || { guest: true, name: L('ضيف', 'Guest') }; const R = rides();
  const now = new Date(), wkStart = new Date(now); wkStart.setHours(0, 0, 0, 0); wkStart.setDate(wkStart.getDate() - ((wkStart.getDay() + 1) % 7));
  const wk = R.filter((r) => r.startedAt >= wkStart.getTime()).reduce((a, r) => a + r.dist, 0) / 1000;
  const total = R.reduce((a, r) => a + r.dist, 0) / 1000, time = R.reduce((a, r) => a + r.moving, 0), gain = R.reduce((a, r) => a + (r.gain || 0), 0);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6 + i); const n = new Date(d); n.setDate(n.getDate() + 1); return { d, km: R.filter((r) => r.startedAt >= d.getTime() && r.startedAt < n.getTime()).reduce((a, r) => a + r.dist, 0) / 1000 }; });
  const mx = Math.max(1, ...days.map((x) => x.km));
  const B = badges(), best = bestEfforts(), bikes = store.get('bikes', []);
  const pass = {}; R.forEach((r) => { const e = trackById(r.trackId)?.emirate; if (e && !pass[e]) pass[e] = r.startedAt; });
  const longest = R.reduce((a, r) => (r.dist > (a?.dist || 0) ? r : a), null), fastest = R.reduce((a, r) => (r.max > (a?.max || 0) ? r : a), null);
  return {
    tab: 'profile',
    html: `<main class="screen">${topbar({ title: L('حسابي', 'Profile'), right: `<a class="icon-btn" href="#/settings" aria-label="${L('الإعدادات', 'Settings')}">${ic('gear', 20)}</a>` })}
      <section class="row" style="gap:14px"><span class="avatar" style="width:68px;height:68px;border-radius:34px;background:var(--orange);color:#fff;font-size:28px">${esc((p.name || '?')[0])}</span><div class="stack" style="gap:3px;flex:1"><b style="font-size:22px">${esc(p.name)}</b><span class="small muted">${p.guest ? L('تتصفح كضيف', 'Guest') : [emName(p.emirate || ''), levelName(p.level)].filter(Boolean).join(' · ')}</span></div></section>
      ${p.guest ? `<a class="btn" href="#/onboard">${L('سوّ حسابك', 'Create your profile')}</a>` : ''}
      <div class="dark-card"><div style="position:relative;display:flex;align-items:center;justify-content:center">${ring(wk / (p.goal || 100), 76)}<b style="position:absolute" class="num">${wk < 10 ? wk.toFixed(1) : Math.round(wk)}</b></div><div class="stack" style="gap:2px;flex:1"><span class="tiny" style="color:#FF9A6B">${L('هدف الأسبوع', 'Weekly goal')}</span><b style="font-size:20px" class="num">${Math.round(wk)} / ${p.goal || 100} ${L('كم', 'km')}</b><div class="bars" style="height:44px">${days.map((x, i) => `<div class="${i === 6 ? 'today' : ''}" style="height:${Math.max(6, x.km / mx * 100)}%" title="${x.km.toFixed(1)}"></div>`).join('')}</div></div></div>
      <div class="grid3 stagger"><div class="stat"><b class="num">${R.length}</b><span>${L('ركبات', 'Rides')}</span></div><div class="stat"><b class="num">${total < 10 ? total.toFixed(1) : total.toFixed(0)}</b><span>${L('كم', 'km')}</span></div><div class="stat"><b class="num">${(time / 3600).toFixed(1)}</b><span>${L('ساعات', 'hours')}</span></div><div class="stat"><b class="num">${gain}</b><span>${L('م صعود', 'm gain')}</span></div><div class="stat"><b class="num">${longest ? (longest.dist / 1000).toFixed(1) : '–'}</b><span>${L('أطول ركبة', 'Longest')}</span></div><div class="stat"><b class="num">${fastest ? fmtSpeed(fastest.max) : '–'}</b><span>${L('أعلى سرعة', 'Top speed')}</span></div></div>
      <section class="passport"><div class="row between"><div class="stack" style="gap:0"><span class="tiny" style="color:#FF9A6B;letter-spacing:1px">${L('دولة الإمارات العربية المتحدة', 'UNITED ARAB EMIRATES')}</span><b style="font-size:21px">${L('جواز دوّاسة', 'Dawwasa Passport')}</b></div><b style="font-size:26px;color:var(--orange)">${Object.keys(pass).length}/7</b></div><div class="sadu"></div>
        <div class="stamps">${EMIRATES.map((e) => `<button class="stamp ${pass[e] ? 'on' : ''}" data-stamp="${e}">${ic(TRACKS.some((t) => t.emirate === e) ? 'bike' : 'clock', 18)}<span>${esc(emName(e))}</span>${pass[e] ? `<span style="font-size:8px">${new Date(pass[e]).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>` : !TRACKS.some((t) => t.emirate === e) ? `<span style="font-size:8px">${L('قريباً', 'Soon')}</span>` : ''}</button>`).join('')}<div class="stamp" style="border-style:solid;border-color:rgba(255,91,20,.6)">${logo(26, 'transparent')}</div></div></section>
      <section class="stack"><div class="row between"><h2>${L('الشارات', 'Badges')}</h2><span class="small muted">${B.filter((b) => b.on).length}/${B.length}</span></div><div class="badges-grid">${B.map((b) => `<button class="bdg ${b.on ? '' : 'off'}" data-b="${b.id}"><span class="medal" style="background:${b.c}22;color:${b.c};${b.on ? `box-shadow:0 0 0 3px var(--card),0 0 0 5px ${b.c}` : ''}">${ic(b.icon, 24)}</span><b>${L(b.ar, b.en)}</b></button>`).join('')}</div></section>
      ${Object.keys(best).length ? `<section class="card"><h2>${ic('trophy', 20)} ${L('أفضل أوقاتي', 'Personal bests')}</h2>${Object.values(best).map((e) => { const s = segById(e.seg); return `<div class="row between"><span>${esc(S.lang === 'en' ? s.en : s.name)}</span><b class="num">${fmtDur(e.time)}</b></div>`; }).join('')}</section>` : ''}
      <section class="stack"><div class="row between"><h2>${L('دراجاتي', 'My bikes')}</h2><button class="btn link small" id="addBike">${ic('plus', 16)} ${L('أضف', 'Add')}</button></div>${bikes.length ? `<div class="list">${bikes.map((b) => `<div><span style="color:var(--orange)">${ic('bike', 22)}</span><div class="grow"><b>${esc(b.name)}</b><span class="tiny muted">${esc(bikeName(b.type))} · ${(b.km || 0).toFixed(0)} ${L('كم', 'km')}${(b.km || 0) >= 1000 * ((b.serviced || 0) + 1) ? ` · <span style="color:var(--red)">${L('وقت الصيانة 🔧', 'Service due 🔧')}</span>` : ''}</span></div>${(b.km || 0) >= 1000 * ((b.serviced || 0) + 1) ? `<button class="btn ghost small" data-svc="${b.id}">${L('سويتها', 'Done')}</button>` : ''}</div>`).join('')}</div>` : `<p class="small muted">${L('أضف دراجتك عشان نحسب كيلوهاتها ونذكّرك بالصيانة كل 1,000 كم.', 'Add a bike to track its km and get a service reminder every 1,000 km.')}</p>`}</section>
      ${R.length ? `<section class="stack"><h2>${L('ركباتي', 'My rides')}</h2><div class="list">${R.slice().reverse().slice(0, 10).map((r) => { const t = trackById(r.trackId); return `<a href="#/done/${r.id}"><span style="color:var(--orange)">${ic('route', 20)}</span><div class="grow"><b class="small">${t ? esc(tName(t)) : L('ركبة حرة', 'Free ride')}</b><span class="tiny muted num">${fmtDate(r.startedAt)} · ${fmtDist(r.dist, 1)} · ${fmtDur(r.moving)} · ${fmtSpeed(r.avg)} ${speedUnit()}</span></div></a>`; }).join('')}</div></section>` : ''}
      <div class="list"><a href="#/sos"><span style="color:var(--red)">${ic('phone', 20)}</span><span class="grow">${L('الطوارئ', 'Emergency')}</span></a><a href="#/rules"><span>${ic('shield', 20)}</span><span class="grow">${L('القوانين والسلامة', 'Rules & safety')}</span></a><a href="#/settings"><span>${ic('gear', 20)}</span><span class="grow">${L('الإعدادات', 'Settings')}</span></a><a href="#/about"><span>${ic('info', 20)}</span><span class="grow">${L('عن دوّاسة', 'About Dawwasa')}</span><span class="small muted">v1.0</span></a></div></main>`,
    mount() {
      $$('[data-b]').forEach((b) => b.onclick = () => { haptic(); const x = B.find((y) => y.id === b.dataset.b); toast(`${x.on ? '🏅' : '🔒'} ${L(x.ar, x.en)}`); });
      $$('[data-stamp]').forEach((b) => b.onclick = () => { haptic(); const e = b.dataset.stamp; if (pass[e]) toast(L(`ختم ${e}: ${fmtDate(pass[e])}`, `${emName(e)}: ${fmtDate(pass[e])}`)); else { F.em = e; saveF(); location.hash = '#/explore'; } });
      $('#addBike').onclick = () => { const name = prompt(L('اسم الدراجة؟ (مثلاً: Trek الأحمر)', 'Bike name?')); if (!name) return; const type = prompt(L('نوعها؟ (طريق / جبلية / Gravel / هجين / كهربائية)', 'Type? (road / MTB / gravel / hybrid / e-bike)'), L('طريق', 'road')) || ''; const b = store.get('bikes', []); b.push({ id: uid(), name: name.slice(0, 40), type: type.slice(0, 20), km: 0 }); store.set('bikes', b); render(); };
      $$('[data-svc]').forEach((x) => x.onclick = () => { const b = store.get('bikes', []); const k = b.find((y) => y.id === x.dataset.svc); k.serviced = Math.floor((k.km || 0) / 1000); store.set('bikes', b); toast(L('تمام، سجّلنا الصيانة 🔧', 'Service logged 🔧')); render(); });
    },
  };
};
V.settings = () => {
  const th = store.get('theme', 'auto');
  return {
    tabs: false,
    html: `<main class="screen no-tabs">${topbar({ title: L('الإعدادات', 'Settings'), back: '#/profile', sos: false })}
      <section class="card"><h2>${L('المظهر', 'Appearance')}</h2><div class="seg" style="grid-template-columns:repeat(3,1fr)">${[['auto', L('تلقائي', 'Auto')], ['light', L('فاتح', 'Light')], ['dark', L('داكن', 'Dark')]].map(([v, l]) => `<button data-th="${v}" aria-pressed="${th === v}">${l}</button>`).join('')}</div><p class="tiny muted">${L('التلقائي يصير داكن من 7 المسا لين 5 الصبح.', 'Auto switches to dark from 7 PM to 5 AM.')}</p></section>
      <section class="card"><h2>${L('اللغة والوحدات', 'Language & units')}</h2><div class="seg" style="grid-template-columns:1fr 1fr"><button data-lang="ar" aria-pressed="${S.lang === 'ar'}">العربية</button><button data-lang="en" aria-pressed="${S.lang === 'en'}">English</button></div><div class="seg" style="grid-template-columns:1fr 1fr"><button data-u="km" aria-pressed="${store.get('units', 'km') === 'km'}">${L('كيلومتر', 'km')}</button><button data-u="mi" aria-pressed="${store.get('units', 'km') === 'mi'}">${L('ميل', 'miles')}</button></div></section>
      <section class="card"><h2>${L('الخصوصية والسلامة', 'Privacy & safety')}</h2>
        <label class="switch"><span>${L('منطقة الخصوصية (إخفاء أول وآخر 200 م)', 'Privacy zone (hide first/last 200 m)')}</span><input type="checkbox" data-set="privacy" ${store.get('privacy', true) ? 'checked' : ''}></label>
        <label class="switch"><span>${L('كشف السقوط (تجريبي)', 'Crash detection (beta)')}</span><input type="checkbox" data-set="crashOn" ${store.get('crashOn', true) ? 'checked' : ''}></label>
        <label class="switch"><span>${L('تنبيهات صوتية', 'Voice cues')}</span><input type="checkbox" data-set="voiceOn" ${store.get('voiceOn', true) ? 'checked' : ''}></label>
        <a class="btn ghost" href="#/onboard">${ic('user', 18)} ${L('تعديل الحساب وجهة الطوارئ', 'Edit profile & contact')}</a></section>
      <button class="btn ghost" id="out" style="color:var(--red)">${ic('logout', 18)} ${L('تسجيل خروج', 'Sign out')}</button>
      <button class="btn link" id="wipe" style="align-self:center;color:var(--red)">${L('حذف كل بياناتي من الجوال', 'Delete all my data on this phone')}</button></main>`,
    mount() {
      $$('[data-th]').forEach((b) => b.onclick = () => { store.set('theme', b.dataset.th); applyTheme(); render(); });
      $$('[data-lang]').forEach((b) => b.onclick = () => { S.lang = b.dataset.lang; store.set('lang', S.lang); applyLang(); render(); });
      $$('[data-u]').forEach((b) => b.onclick = () => { store.set('units', b.dataset.u); render(); });
      $$('[data-set]').forEach((i) => i.onchange = () => store.set(i.dataset.set, i.checked));
      $('#out').onclick = () => { if (confirm(L('تسجيل خروج؟ ركباتك تبقى على الجوال.', 'Sign out? Rides stay on this phone.'))) { store.del('profile'); location.hash = '#/welcome'; } };
      $('#wipe').onclick = () => { if (!confirm(L('متأكد؟ بينحذف كل شي: الحساب والركبات والمنشورات.', 'Sure? This deletes everything.'))) return; try { Object.keys(localStorage).filter((k) => k.startsWith('d.')).forEach((k) => localStorage.removeItem(k)); } catch {} location.hash = '#/welcome'; location.reload(); };
    },
  };
};
V.about = () => ({
  tabs: false,
  html: `<main class="screen no-tabs">${topbar({ title: L('عن دوّاسة', 'About Dawwasa'), back: profile() ? '#/profile' : '#/welcome', sos: false })}
    <section class="dark-card" style="flex-direction:column;text-align:center;padding:24px">${logo(72, '#0E1116')}<b style="font-size:32px">${L('دوّاسة', 'Dawwasa')}</b><span class="small" style="color:#C9CED8">${L('مجتمع الدرّاجين في الإمارات', 'The UAE riders’ community')}</span><span class="tag" style="align-self:center">${L('الإصدار 1.0 تجريبي', 'v1.0 beta')}</span></section>
    <section class="card"><h2>${L('نبذة', 'About')}</h2><p class="small" style="line-height:1.9">${L('دوّاسة يجمع لك تراكات الدراجات المرخّصة في الإمارات مع الظروف المباشرة لكل تراك (الحرارة والريح والمطر ومؤشر الركوب)، ويسجّل ركباتك بالـ GPS، ويحسب أوقاتك في المقاطع المشهورة مثل صعود جيس وحفيت، ويربطك بالركبات الجماعية ومجتمع الدرّاجين.', 'Dawwasa brings together licensed UAE cycling tracks with live conditions (heat, wind, rain and a Ride Index), records your rides by GPS, times famous segments like the Jais and Hafeet climbs, and connects you with group rides and the riders’ community.')}</p></section>
    <section class="card"><h2>${L('السياسات', 'Policies')}</h2><p class="small muted">${L('سياسة الخصوصية والشروط وإخلاء المسؤولية وقواعد المجتمع وسياسة المنظمين قيد الإعداد ولازم يراجعها محامي قبل الإطلاق.', 'Privacy policy, terms, safety disclaimer, community guidelines and organiser policy are being drafted and need legal review before launch.')}</p><p class="small">${L('بياناتك في هالنسخة تنحفظ على جوالك بس، ونخفي بداية ونهاية ركباتك لما تشاركها.', 'In this version your data stays on your phone, and the start/end of shared rides is hidden.')}</p></section>
    <section class="card"><h2>${L('حقوق الصور والبيانات', 'Credits')}</h2>${Object.values(PHOTOS).map((p) => `<a class="small" href="https://commons.wikimedia.org/wiki/${encodeURI(p.page)}" target="_blank" rel="noopener" style="color:inherit">📷 ${esc(p.place)}: ${esc(p.by)} · ${esc(p.lic)}</a>`).join('')}<span class="tiny muted">${L('الطقس من Open-Meteo · الخرائط © OpenStreetMap · Leaflet (BSD-2). بيانات التراكات من مصادر عامة، آخر تحقق', 'Weather by Open-Meteo · Maps © OpenStreetMap · Leaflet (BSD-2). Track data from public sources, last verified')} ${VERIFIED}.</span></section>
    <p class="tiny muted" style="text-align:center">${L('المعلومات للإرشاد فقط. التزم بتعليمات الجهات الرسمية، وفي الطوارئ اتصل 999.', 'Information is for guidance only. Follow official instructions; in an emergency call 999.')}<br>${L('صُنع في الإمارات', 'Made in the UAE')} 🇦🇪</p></main>`,
});

/* ride views */
const ctx = { topbar, notfound, badges };
V.record = (a) => viewRecord(a, ctx);
V.ride = (a) => viewRide(a, ctx);
V.done = (a) => viewDone(a, ctx);

/* ---------- router ---------- */
let cur = null, curView = null;
function render() {
  const raw = location.hash.replace(/^#\/?/, '').split('?')[0];
  const [name, arg] = raw.split('/');
  if (!profile() && !['welcome', 'onboard', 'about', 'sos', 'rules'].includes(name)) { location.replace('#/welcome'); return; }
  if (!name) { location.replace(store.get('active')?.startedAt ? '#/ride' : '#/explore'); return; }
  if (name === 'welcome' && profile()) { location.replace('#/explore'); return; }
  try { curView?.unmount?.call(curView); } catch {}
  applyTheme();
  const v = (V[name] || notfound)(arg ? decodeURIComponent(arg) : undefined);
  cur = name; curView = v;
  $('#app').innerHTML = (v.html || '') + (v.tabs === false ? '' : tabbar(v.tab));
  window.scrollTo(0, 0);
  try { v.mount?.call(v); } catch (e) { console.error(e); }
}
window.addEventListener('hashchange', render);
render();
loadWeather();
setInterval(applyTheme, 60000);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
