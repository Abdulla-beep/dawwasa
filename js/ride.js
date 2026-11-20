// دوّاسة – تسجيل الركبة بالـ GPS
import { TRACKS, SEGMENTS } from './data.js';
import { store, L, S, $, $$, esc, uid, fmtDur, fmtTime, fmtDate, fmtDist, fmtSpeed, speedUnit, distNum, distUnit, haversine, toast, haptic, getPosition, mapsLink, waLink, smsLink, trackById, profile, ic, icFill, logo, makeMap, pinIcon, meIcon, sunsetOf, statusOf, isOpen, confetti, rides, bestEfforts, segById, typeName, tName, wx } from './core.js';

let watchId = null, tick = null, wakeLock = null, rideMap = null;
const nearestTrack = (p) => TRACKS.filter((t) => t.lat != null).map((t) => ({ t, d: haversine(p, t) })).sort((a, b) => a.d - b.d)[0];

/* ---------- setup ---------- */
export function viewRecord(arg, ctx) {
  const p = profile();
  if (!p || p.guest) return { tabs: false, html: `<main class="screen no-tabs">${ctx.topbar({ title: L('سجّل ركبة', 'Record a ride'), back: '#/explore' })}<div class="empty">${ic('user', 36)}<p>${L('سوّ حسابك أول عشان تحفظ ركباتك.', 'Create your profile first to save rides.')}</p><a class="btn" style="width:auto" href="#/onboard">${L('سوّ حسابك', 'Create profile')}</a></div></main>` };
  if (store.get('active')) { setTimeout(() => (location.hash = '#/ride')); return { html: '' }; }
  const bikes = store.get('bikes', []);
  let trackId = arg || store.get('lastTrack', '');
  return {
    tab: 'record',
    html: `<main class="screen">
      ${ctx.topbar({ title: L('يالله نركب', "Let's ride"), sub: L('جهّز ركبتك', 'Set up your ride') })}
      <section class="card">
        <div class="row between"><h2>${L('التراك', 'Track')}</h2><button class="btn link small" id="near">${ic('pin', 16)} ${L('أقرب تراك لي', 'Nearest to me')}</button></div>
        <select class="input" id="tr"><option value="">${L('ركبة حرة (بدون تراك)', 'Free ride (no track)')}</option>${TRACKS.map((t) => `<option value="${t.id}" ${t.id === trackId ? 'selected' : ''}>${esc(tName(t))} · ${esc(t.emirate)}</option>`).join('')}</select>
        <p class="tiny muted" id="trInfo"></p>
      </section>
      <section class="card">
        <h2>${L('الدراجة', 'Bike')}</h2>
        ${bikes.length ? `<select class="input" id="bk">${bikes.map((b) => `<option value="${b.id}">${esc(b.name)} · ${esc(({ road: L("طريق", "Road"), mtb: L("جبلية", "MTB"), gravel: "Gravel", hybrid: L("هجين", "Hybrid"), ebike: L("كهربائية", "E-bike") })[b.type] || b.type)}</option>`).join('')}</select>` : `<p class="small muted">${L('ما ضفت دراجة. تقدر تضيفها من حسابي.', 'No bike yet. Add one from Profile.')}</p>`}
      </section>
      <section class="card">
        <h2>${L('السلامة', 'Safety')}</h2>
        <label class="switch"><span>${L('ذكّرني أشارك موقعي مع جهة الطوارئ', 'Remind me to share my location')}</span><input type="checkbox" id="live" ${p.ecPhone ? 'checked' : ''}></label>
        <label class="switch"><span>${L('كشف السقوط (تجريبي)', 'Crash detection (beta)')}</span><input type="checkbox" id="crash" ${store.get('crashOn', true) ? 'checked' : ''}></label>
        <label class="switch"><span>${L('تنبيهات صوتية كل 5 كم', 'Voice cues every 5 km')}</span><input type="checkbox" id="voice" ${store.get('voiceOn', true) ? 'checked' : ''}></label>
        <div class="stack" style="gap:0">${[L('خوذة', 'Helmet'), L('أضواء أمامية وخلفية', 'Front & rear lights'), L('ماي وأملاح', 'Water & electrolytes'), L('جوال مشحون', 'Charged phone')].map((x, i) => `<label class="check"><input type="checkbox" data-c="${i}" ${i === 0 ? '' : ''}><span>${x}</span></label>`).join('')}</div>
      </section>
      <button class="btn" id="go" style="min-height:62px;font-size:18px">${icFill('play', 20)} ${L('ابدأ الركبة', 'Start ride')}</button>
      <p class="tiny muted" style="text-align:center">${L('بنطلب إذن الموقع. ركبتك تنحفظ على جوالك حتى لو انقطع الإرسال.', 'We will ask for location. Your ride is saved even without signal.')}</p>
    </main>`,
    mount() {
      const info = () => {
        const t = trackById($('#tr').value);
        if (!t) { $('#trInfo').textContent = ''; return; }
        const st = statusOf(t); const w = wx(t);
        $('#trInfo').textContent = `${typeName(t.type)} · ${t.lenText}${w?.feels != null ? ` · ${Math.round(w.feels)}° ${L('محسوسة', 'feels')}` : ''}${isOpen(st) ? '' : ' · ' + L('⚠️ التراك مسكّر حالياً', '⚠️ track currently closed')}`;
      };
      $('#tr').onchange = info; info();
      $('#near').onclick = async () => {
        try { const pos = await getPosition(); const n = nearestTrack(pos); $('#tr').value = n.t.id; info(); toast(L(`أقرب تراك: ${n.t.name} (${(n.d / 1000).toFixed(1)} كم)`, `Nearest: ${n.t.en} (${(n.d / 1000).toFixed(1)} km)`)); }
        catch { toast(L('فعّل الموقع عشان نعرف أقرب تراك', 'Enable location to find the nearest track')); }
      };
      $('#go').onclick = () => {
        const left = $$('[data-c]').filter((c) => !c.checked).length;
        if (left && !confirm(L(`باقي ${left} من قائمة السلامة. تبي تبدأ؟`, `${left} safety items unchecked. Start anyway?`))) return;
        store.set('crashOn', $('#crash').checked); store.set('voiceOn', $('#voice').checked);
        const tid = $('#tr').value; if (tid) store.set('lastTrack', tid);
        store.set('active', { id: uid(), trackId: tid || null, bikeId: $('#bk')?.value || null, startedAt: 0, pts: [], dist: 0, moving: 0, gain: 0, maxSpd: 0, laps: [], lapAt: 0, lapDist: 0, segs: {}, efforts: [], lastHydrate: 0, lastVoiceKm: 0, live: $('#live').checked, sunsetWarned: false });
        countdown(() => { const a = store.get('active'); a.startedAt = Date.now(); a.lapAt = a.startedAt; a.lastHydrate = a.startedAt; store.set('active', a); location.hash = '#/ride'; });
      };
    },
  };
}
function countdown(done) {
  const el = document.createElement('div'); el.className = 'countdown'; document.body.appendChild(el);
  let n = 3; const step = () => { if (n === 0) { el.textContent = L('يالله!', 'Go!'); haptic(60); setTimeout(() => { el.remove(); done(); }, 500); return; } el.textContent = n; haptic(20); n--; setTimeout(step, 800); };
  step();
}

/* ---------- live ride ---------- */
function speak(text) { try { if (!store.get('voiceOn', true) || !window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(text); u.lang = S.lang === 'en' ? 'en-GB' : 'ar-SA'; speechSynthesis.speak(u); } catch {} }
let audioCtx;
function beep(f = 880, ms = 300) { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination); g.gain.value = .2; o.start(); setTimeout(() => o.stop(), ms); } catch {} }

export function viewRide(arg, ctx) {
  const a = store.get('active');
  if (!a || !a.startedAt) { setTimeout(() => (location.hash = '#/record')); return { html: '' }; }
  const t = trackById(a.trackId);
  const p = profile() || {};
  let paused = !!a.paused, crashAt = 0, crashBase = null, overlayOn = false;
  return {
    tabs: false,
    html: `<main class="screen no-tabs">
      <div class="row between"><span class="row small" style="gap:6px"><span class="live-dot"></span><b>${L('الركبة شغّالة', 'Riding')}</b>${t ? ` · ${esc(tName(t))}` : ''}</span><a class="sos" href="#/sos">${ic('phone', 15, 2.2)} SOS</a></div>
      <section class="ride-top" aria-live="polite">
        <div class="row between" style="align-items:flex-end">
          <div class="stack" style="gap:2px"><span class="lbl">${L('السرعة', 'Speed')} (${speedUnit()})</span><span class="big num" id="spd">0.0</span></div>
          <div class="stack" style="gap:2px;text-align:end"><span class="lbl">${L('المسافة', 'Distance')} (${distUnit()})</span><span class="big num" id="dst" style="font-size:44px">0.00</span></div>
        </div>
        <div class="ride-grid">
          <div><span class="lbl">${L('وقت الحركة', 'Moving time')}</span><b class="num" id="mov">00:00</b></div>
          <div><span class="lbl">${L('المعدل', 'Average')}</span><b class="num" id="avg">0.0</b></div>
          <div><span class="lbl">${L('الصعود', 'Elevation')}</span><b class="num" id="gain">0 ${L('م', 'm')}</b></div>
        </div>
        <div class="row between tiny" style="color:#9AA3B2"><span id="gps">${L('نحدد موقعك…', 'Locating…')}</span><span>${L('أعلى سرعة', 'Max')} <b class="num" id="max" style="color:#fff">0.0</b></span></div>
      </section>
      <div id="alerts"></div>
      <div id="rmap" class="map" style="height:240px"></div>
      <div class="grid3">
        <button class="btn ghost" id="pause">${ic(paused ? 'play' : 'pause', 18)} <span>${paused ? L('كمّل', 'Resume') : L('إيقاف مؤقت', 'Pause')}</span></button>
        <button class="btn ghost" id="lap">${ic('lap', 18)} ${L('لفة', 'Lap')}</button>
        <button class="btn ghost" id="share">${ic('share', 18)} ${L('موقعي', 'Location')}</button>
      </div>
      <div id="laps" class="stack"></div>
      <button class="btn dark" id="end" style="min-height:58px">${ic('stop', 18)} ${L('إنهاء الركبة', 'Finish ride')}</button>
      <p class="tiny muted" style="text-align:center">${L('خلّ الشاشة مفتوحة لتتبّع أدق. الإيقاف التلقائي تحت 3 كم/س.', 'Keep the screen on for best tracking. Auto-pause below 3 km/h.')}</p>
    </main>`,
    mount() {
      (async () => { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch {} })();
      if (window.L?.map) {
        const start = a.pts[0] || (t?.lat != null ? [t.lat, t.lng] : [25.1, 55.3]);
        rideMap = makeMap($('#rmap'), [start[0], start[1]], 14);
      }
      let line, me;
      if (rideMap) {
        if (t?.lat != null) window.L.marker([t.lat, t.lng], { icon: pinIcon('#FF5B14') }).addTo(rideMap);
        line = window.L.polyline(a.pts.map((x) => [x[0], x[1]]), { color: '#FF5B14', weight: 5 }).addTo(rideMap);
      }
      const segs = t ? SEGMENTS.filter((s) => s.track === t.id) : SEGMENTS.filter((s) => s.kind === 'summit');
      const lapsHtml = () => a.laps.length ? `<div class="list">${a.laps.map((l, i) => `<div><b class="num">${L('لفة', 'Lap')} ${i + 1}</b><span class="grow"></span><span class="num small">${fmtDist(l.d)} · ${fmtDur(l.s)} · ${fmtSpeed(l.d / 1000 / (l.s / 3600) || 0)} ${speedUnit()}</span></div>`).join('')}</div>` : '';
      $('#laps').innerHTML = lapsHtml();
      let curSpd = 0;
      const ui = () => {
        $('#spd').textContent = fmtSpeed(curSpd);
        $('#dst').textContent = distNum(a.dist).toFixed(2);
        $('#mov').textContent = fmtDur(a.moving);
        $('#avg').textContent = fmtSpeed(a.moving ? a.dist / 1000 / (a.moving / 3600) : 0);
        $('#gain').textContent = `${Math.round(a.gain)} ${L('م', 'm')}`;
        $('#max').textContent = fmtSpeed(a.maxSpd);
      };
      const alertBox = (html) => { $('#alerts').innerHTML = html; };
      const save = () => store.set('active', a);
      const showCrash = () => {
        if (overlayOn) return; overlayOn = true;
        const el = document.createElement('div'); el.className = 'overlay'; el.setAttribute('role', 'alertdialog');
        let n = 30;
        el.innerHTML = `<b style="font-size:24px">${L('هل أنت بخير؟', 'Are you OK?')}</b><span class="big num" id="cd">30</span><span>${L('لاحظنا توقف مفاجئ. إذا ما رديت بنجهّز رسالة لجهة الطوارئ.', 'Sudden stop detected. If you don’t respond, we’ll prepare a message to your emergency contact.')}</span><button class="btn white" id="okb" style="max-width:320px">${L('أنا بخير', "I'm OK")}</button><a class="btn dark" id="helpb" style="max-width:320px" target="_blank" rel="noopener">${L('أرسل موقعي الحين', 'Send my location now')}</a><span class="tiny" style="opacity:.85">${L('تطبيق الويب ما يقدر يرسل SMS بروحه، بيفتح لك الرسالة جاهزة.', 'A web app can’t send SMS by itself; we open the message for you.')}</span>`;
        document.body.appendChild(el);
        const last = a.pts[a.pts.length - 1];
        const text = L(`طوارئ! ممكن طحت بالدراجة. آخر موقع لي: ${mapsLink({ lat: last[0], lng: last[1] })}`, `Emergency! I may have crashed. My last location: ${mapsLink({ lat: last[0], lng: last[1] })}`);
        el.querySelector('#helpb').href = p.ecPhone ? waLink(p.ecPhone, text) : smsLink('', text);
        const iv = setInterval(() => { n--; el.querySelector('#cd').textContent = n; beep(n % 2 ? 880 : 660, 250); haptic(200); if (n <= 0) { clearInterval(iv); el.querySelector('#helpb').click(); } }, 1000);
        el.querySelector('#okb').onclick = () => { clearInterval(iv); el.remove(); overlayOn = false; crashAt = 0; crashBase = null; };
      };
      const onPos = (pos) => {
        const c = pos.coords, now = Date.now();
        $('#gps') && ($('#gps').textContent = `GPS ±${Math.round(c.accuracy)} ${L('م', 'm')}`);
        if (c.accuracy > 35 || paused) return;
        const pt = [+c.latitude.toFixed(6), +c.longitude.toFixed(6), c.altitude != null ? Math.round(c.altitude * 10) / 10 : null, now];
        const last = a.pts[a.pts.length - 1];
        let d = 0, dt = 0;
        if (last) { d = haversine({ lat: last[0], lng: last[1] }, { lat: pt[0], lng: pt[1] }); dt = (now - last[3]) / 1000; }
        const spd = c.speed != null && c.speed >= 0 ? c.speed * 3.6 : (dt > 0 ? (d / dt) * 3.6 : 0);
        const prevSpd = curSpd; curSpd = spd;
        // crash detection
        if (store.get('crashOn', true)) {
          if (prevSpd > 20 && spd < 2 && dt <= 3) { crashAt = now; crashBase = pt; }
          if (crashAt && crashBase) {
            const moved = haversine({ lat: crashBase[0], lng: crashBase[1] }, { lat: pt[0], lng: pt[1] });
            if (moved > 15) { crashAt = 0; crashBase = null; } else if (now - crashAt > 60000) showCrash();
          }
        }
        if (last && d < 2) { ui(); return; }
        if (last && (spd > 120 || (d > 300 && dt < 10))) { a.pts.push(pt); save(); return; } // GPS jump: reset reference without counting distance
        if (last && spd >= 3) { a.moving += dt; a.dist += d; }
        if (spd > a.maxSpd && spd < 110) a.maxSpd = spd;
        // elevation (smoothed)
        if (pt[2] != null) { a.alt = a.alt == null ? pt[2] : a.alt * .8 + pt[2] * .2; if (a.base == null) a.base = a.alt; if (a.alt - a.base > 3) { a.gain += a.alt - a.base; a.base = a.alt; } else if (a.base - a.alt > 3) a.base = a.alt; }
        a.pts.push(pt); if (a.pts.length > 8000) a.pts.splice(1, 1);
        // segments
        segs.forEach((s) => {
          const st = a.segs[s.id] = a.segs[s.id] || {};
          if (s.kind === 'loop' && t) {
            const inZone = haversine({ lat: t.lat, lng: t.lng }, { lat: pt[0], lng: pt[1] }) <= s.r;
            if (inZone && !st.in) {
              if (st.passAt && (a.dist - st.passDist) / 1000 >= s.minDist) { const time = (now - st.passAt) / 1000; a.efforts.push({ seg: s.id, time, at: now }); toast(L(`🏁 ${s.name}: ${fmtDur(time)}`, `🏁 ${s.en}: ${fmtDur(time)}`)); speak(L(`خلّصت ${s.name} في ${fmtDur(time)}`, `${s.en} done in ${fmtDur(time)}`)); haptic([30, 40, 30]); }
              st.passAt = now; st.passDist = a.dist;
            }
            st.in = inZone;
          } else if (s.kind === 'summit' && !st.done) {
            if (haversine({ lat: s.lat, lng: s.lng }, { lat: pt[0], lng: pt[1] }) <= s.r && a.gain >= s.minGain) { const time = (now - a.startedAt) / 1000; a.efforts.push({ seg: s.id, time, at: now, approx: true }); st.done = true; toast(L(`⛰️ وصلت القمة! ${s.name}`, `⛰️ Summit! ${s.en}`)); speak(L('كفو! وصلت القمة', 'Well done, summit reached')); confetti(50); }
          }
        });
        // voice every 5 km
        const km = Math.floor(a.dist / 5000) * 5;
        if (km > a.lastVoiceKm) { a.lastVoiceKm = km; speak(L(`${km} كيلو. المعدل ${fmtSpeed(a.dist / 1000 / (a.moving / 3600) || 0)}`, `${km} kilometres. Average ${fmtSpeed(a.dist / 1000 / (a.moving / 3600) || 0)}`)); }
        save();
        if (rideMap) { line.addLatLng([pt[0], pt[1]]); if (!me) me = window.L.marker([pt[0], pt[1]], { icon: meIcon() }).addTo(rideMap); else me.setLatLng([pt[0], pt[1]]); if (a.pts.length === 1 || a.pts.length % 15 === 0) rideMap.panTo([pt[0], pt[1]]); }
        ui();
      };
      if (navigator.geolocation) watchId = navigator.geolocation.watchPosition(onPos, (e) => { $('#gps') && ($('#gps').textContent = e.code === 1 ? L('الموقع مرفوض – فعّله من الإعدادات', 'Location denied – enable it in settings') : L('ما في إشارة GPS', 'No GPS signal')); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 30000 });
      tick = setInterval(() => {
        const now = Date.now();
        const msgs = [];
        if (now - a.lastHydrate > 20 * 60000) { a.lastHydrate = now; toast(L('💧 وقت تشرب ماي', '💧 Time to drink')); haptic([20, 60, 20]); speak(L('وقت تشرب ماي', 'Time to drink')); save(); }
        if (t && t.lit !== 'full' && !a.sunsetWarned && now > sunsetOf(t) - 30 * 60000 && now < sunsetOf(t)) { a.sunsetWarned = true; save(); msgs.push(`<div class="banner amber"><span class="ic">${ic('moon', 20)}</span><div class="small"><b>${L('الشمس بتغيب بعد شوي', 'Sunset soon')}</b><br>${L('التراك مب كله مضاء. شغّل الأضواء أو ارجع.', 'Track is not fully lit. Turn on lights or head back.')}</div></div>`); }
        const w = wx(t); if (w?.feels >= 40) msgs.push(`<div class="banner heat"><span class="ic">${ic('thermo', 20)}</span><div class="small"><b>${L(`الحرارة المحسوسة ${Math.round(w.feels)}°`, `Feels like ${Math.round(w.feels)}°`)}</b><br>${L('خفّف السرعة واشرب ماي.', 'Ease off and hydrate.')}</div></div>`);
        if (msgs.length) alertBox(msgs.join(''));
        if (!paused && a.pts.length) { const last = a.pts[a.pts.length - 1]; if (now - last[3] > 4000) curSpd = 0; ui(); }
      }, 1000);
      ui();
      if (a.live && p.ecPhone && !a.liveSent) {
        alertBox(`<div class="banner amber"><span class="ic">${ic('share', 20)}</span><div class="stack small" style="gap:6px"><b>${L('شارك موقعك مع', 'Share your location with')} ${esc(p.ecName || L('جهة الطوارئ', 'your contact'))}</b><span>${L('المشاركة المباشرة التلقائية تحتاج السيرفر. الحين نرسل موقعك برسالة، وتقدر تحدّثه من زر «موقعي».', 'Automatic live sharing needs the server. For now we send your location by message; update it with the “Location” button.')}</span><a class="btn small" id="liveSend" target="_blank" rel="noopener" style="align-self:flex-start">${L('أرسل بالواتساب', 'Send on WhatsApp')}</a></div></div>`);
        getPosition().then((pos) => { const b = $('#liveSend'); if (b) b.href = waLink(p.ecPhone, L(`بدأت ركبة دراجة${t ? ' في ' + t.name : ''}. موقعي: ${mapsLink(pos)}`, `Started a ride${t ? ' at ' + t.en : ''}. My location: ${mapsLink(pos)}`)); }).catch(() => {});
        $('#alerts').addEventListener('click', (e) => { if (e.target.id === 'liveSend') { a.liveSent = true; save(); } });
      }
      $('#pause').onclick = () => { paused = !paused; a.paused = paused; save(); haptic(); $('#pause').innerHTML = `${ic(paused ? 'play' : 'pause', 18)} <span>${paused ? L('كمّل', 'Resume') : L('إيقاف مؤقت', 'Pause')}</span>`; };
      $('#lap').onclick = () => { const now = Date.now(); a.laps.push({ d: a.dist - a.lapDist, s: (now - a.lapAt) / 1000 }); a.lapAt = now; a.lapDist = a.dist; save(); haptic(30); $('#laps').innerHTML = lapsHtml(); toast(L(`لفة ${a.laps.length} ✓`, `Lap ${a.laps.length} ✓`)); };
      $('#share').onclick = async () => {
        let last = a.pts[a.pts.length - 1]; let pos = last ? { lat: last[0], lng: last[1] } : null;
        if (!pos) { try { pos = await getPosition(); } catch {} }
        if (!pos) return toast(L('ما قدرنا نحدد موقعك', 'Could not get your location'));
        const text = L(`أنا أركب دراجة${t ? ' في ' + t.name : ''}. موقعي الحين: ${mapsLink(pos)}`, `I'm cycling${t ? ' at ' + t.en : ''}. My location: ${mapsLink(pos)}`);
        if (p.ecPhone) window.open(waLink(p.ecPhone, text), '_blank'); else if (navigator.share) { try { await navigator.share({ text }); } catch {} } else { try { await navigator.clipboard.writeText(text); toast(L('انسخ موقعك', 'Copied')); } catch {} }
      };
      $('#end').onclick = () => {
        if (!confirm(L('تبي تنهي الركبة؟', 'Finish this ride?'))) return;
        const end = Date.now();
        const prevBadges = store.get('badgesEarned', []);
        const r = { id: a.id, trackId: a.trackId, bikeId: a.bikeId, startedAt: a.startedAt, endedAt: end, dist: Math.round(a.dist), moving: Math.round(a.moving), elapsed: Math.round((end - a.startedAt) / 1000), gain: Math.round(a.gain), max: +a.maxSpd.toFixed(1), avg: a.moving ? +(a.dist / 1000 / (a.moving / 3600)).toFixed(1) : 0, laps: a.laps, efforts: a.efforts, pts: a.pts.filter((_, i, arr) => i % 2 === 0 || i === arr.length - 1).map((x) => [x[0], x[1], x[2], x[3]]), prevBadges };
        const all = rides(); all.push(r);
        if (!store.set('rides', all)) { r.pts = r.pts.filter((_, i) => i % 4 === 0); all[all.length - 1] = r; store.set('rides', all); }
        if (r.bikeId) { const b = store.get('bikes', []); const bk = b.find((x) => x.id === r.bikeId); if (bk) { bk.km = (bk.km || 0) + r.dist / 1000; store.set('bikes', b); } }
        store.del('active');
        location.hash = `#/done/${r.id}`;
      };
    },
    unmount() { if (watchId != null) navigator.geolocation.clearWatch(watchId); watchId = null; clearInterval(tick); tick = null; try { wakeLock?.release(); } catch {} wakeLock = null; rideMap?.remove(); rideMap = null; },
  };
}

/* ---------- summary ---------- */
export function privacyTrim(pts) {
  if (!store.get('privacy', true) || pts.length < 4) return pts;
  const trimFrom = (arr) => { let d = 0; for (let i = 1; i < arr.length; i++) { d += haversine({ lat: arr[i - 1][0], lng: arr[i - 1][1] }, { lat: arr[i][0], lng: arr[i][1] }); if (d >= 200) return i; } return arr.length; };
  const s = trimFrom(pts), e = pts.length - trimFrom([...pts].reverse());
  return s < e ? pts.slice(s, e) : [];
}
function splits(r) {
  const out = []; let d = 0, lastKmAt = r.startedAt, next = 1000;
  for (let i = 1; i < r.pts.length; i++) { d += haversine({ lat: r.pts[i - 1][0], lng: r.pts[i - 1][1] }, { lat: r.pts[i][0], lng: r.pts[i][1] }); if (d >= next) { out.push((r.pts[i][3] - lastKmAt) / 1000); lastKmAt = r.pts[i][3]; next += 1000; } }
  return out;
}
function elevChart(r) {
  const alts = r.pts.map((p) => p[2]).filter((x) => x != null);
  if (alts.length < 5) return '';
  const min = Math.min(...alts), max = Math.max(...alts), span = Math.max(10, max - min);
  const pts = alts.map((a, i) => `${(i / (alts.length - 1)) * 340},${70 - ((a - min) / span) * 60}`).join(' ');
  return `<svg viewBox="0 0 340 74" width="100%" height="80" preserveAspectRatio="none" aria-label="${L('مخطط الارتفاع', 'Elevation profile')}" style="direction:ltr"><polygon points="0,74 ${pts} 340,74" fill="var(--orange-soft)"/><polyline points="${pts}" fill="none" stroke="var(--orange)" stroke-width="2"/></svg><div class="row between tiny muted" style="direction:ltr"><span>${Math.round(min)} m</span><span>${Math.round(max)} m</span></div>`;
}
function gpx(r) {
  const t = trackById(r.trackId);
  const pts = privacyTrim(r.pts);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Dawwasa" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>${esc(t ? t.en : 'Dawwasa ride')}</name><trkseg>${pts.map((p) => `<trkpt lat="${p[0]}" lon="${p[1]}">${p[2] != null ? `<ele>${p[2]}</ele>` : ''}<time>${new Date(p[3]).toISOString()}</time></trkpt>`).join('')}</trkseg></trk></gpx>`;
}
function download(name, text, type) { const b = new Blob([text], { type }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
async function shareCard(r) {
  const t = trackById(r.trackId);
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; const g = cv.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 1350); grd.addColorStop(0, '#1B2230'); grd.addColorStop(1, '#0E1116'); g.fillStyle = grd; g.fillRect(0, 0, 1080, 1350);
  const sadu = ['#9E2B25', '#1E1A14', '#FFFDF8', '#B8862B']; for (let x = 0; x < 1080; x += 36) { g.fillStyle = sadu[(x / 36) % 4]; g.fillRect(x, 0, 36, 14); }
  const pts = privacyTrim(r.pts);
  if (pts.length > 1) {
    const la = pts.map((p) => p[0]), ln = pts.map((p) => p[1]); const minA = Math.min(...la), maxA = Math.max(...la), minN = Math.min(...ln), maxN = Math.max(...ln);
    const k = Math.min(860 / Math.max(1e-6, maxN - minN), 640 / Math.max(1e-6, maxA - minA));
    g.strokeStyle = '#FF5B14'; g.lineWidth = 14; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
    pts.forEach((p, i) => { const x = 110 + (p[1] - minN) * k, y = 760 - (p[0] - minA) * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
  }
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.direction = S.lang === 'en' ? 'ltr' : 'rtl';
  g.font = '700 54px "Readex Pro", sans-serif'; g.fillText(t ? tName(t) : L('ركبة حرة', 'Free ride'), 540, 880);
  const stats = [[distNum(r.dist).toFixed(1), distUnit()], [fmtDur(r.moving), L('الوقت', 'time')], [fmtSpeed(r.avg), speedUnit()], [String(r.gain), L('م صعود', 'm gain')]];
  stats.forEach((s, i) => { const x = 135 + i * 270; g.font = '800 72px "Readex Pro", sans-serif'; g.fillStyle = '#FF5B14'; g.fillText(s[0], x, 1040); g.font = '400 34px "Readex Pro", sans-serif'; g.fillStyle = '#C9CED8'; g.fillText(s[1], x, 1095); });
  g.font = '800 64px "Readex Pro", sans-serif'; g.fillStyle = '#fff'; g.fillText(L('دوّاسة', 'Dawwasa'), 540, 1250);
  g.font = '400 30px "Readex Pro", sans-serif'; g.fillStyle = '#8B93A3'; g.fillText(fmtDate(r.startedAt, { day: 'numeric', month: 'long', year: 'numeric' }) + '  #دوّاسة', 540, 1300);
  const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
  const file = new File([blob], 'dawwasa-ride.png', { type: 'image/png' });
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: '#دوّاسة' }); return; } } catch { return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dawwasa-ride.png'; a.click();
}
export function viewDone(id, ctx) {
  const r = rides().find((x) => x.id === id);
  if (!r) return ctx.notfound();
  const t = trackById(r.trackId);
  const best = bestEfforts();
  const sp = splits(r);
  const fastest = sp.length ? Math.min(...sp) : 0;
  let stars = 0, sumMap = null;
  return {
    tabs: false,
    html: `<main class="screen no-tabs">
      <div class="stack" style="align-items:center;text-align:center;gap:6px;padding-top:8px">${logo(64)}<h1>${L('كفو عليك! 🎉', 'Well done! 🎉')}</h1><p class="muted">${t ? esc(tName(t)) : L('ركبة حرة', 'Free ride')} · ${fmtDate(r.startedAt)}</p></div>
      <div class="grid2 stagger">
        <div class="stat"><b class="num">${fmtDist(r.dist)}</b><span>${L('المسافة', 'Distance')}</span></div>
        <div class="stat"><b class="num">${fmtDur(r.moving)}</b><span>${L('وقت الحركة', 'Moving time')}</span></div>
        <div class="stat"><b class="num">${fmtSpeed(r.avg)}</b><span>${L('المعدل', 'Avg')} ${speedUnit()}</span></div>
        <div class="stat"><b class="num">${fmtSpeed(r.max)}</b><span>${L('أعلى سرعة', 'Max')} ${speedUnit()}</span></div>
      </div>
      <div id="smap" class="map" style="height:220px"></div>
      ${r.pts.some((p) => p[2] != null) ? `<section class="card"><h2>${L('الارتفاع', 'Elevation')} · ${r.gain} ${L('م', 'm')}</h2>${elevChart(r)}</section>` : ''}
      ${r.efforts?.length ? `<section class="card"><h2>${ic('trophy', 20)} ${L('المقاطع', 'Segments')}</h2>${r.efforts.map((e) => { const s = segById(e.seg); const pr = best[e.seg]?.rideId === r.id; return `<div class="row between"><span>${esc(S.lang === 'en' ? s.en : s.name)}${e.approx ? ` <span class="tiny muted">(${L('تقريبي', 'approx.')})</span>` : ''}</span><b class="num">${fmtDur(e.time)} ${pr ? '🏆' : ''}</b></div>`; }).join('')}</section>` : ''}
      ${sp.length ? `<section class="card"><h2>${L('تقسيم كل كيلو', 'Km splits')}</h2>${sp.slice(0, 40).map((s, i) => `<div class="row" style="gap:8px"><span class="num tiny muted" style="width:26px">${i + 1}</span><div class="progress" style="flex:1"><div style="width:${Math.min(100, (fastest / s) * 100)}%"></div></div><span class="num small" style="width:54px;text-align:end">${fmtDur(s)}</span></div>`).join('')}</section>` : ''}
      ${r.laps?.length ? `<section class="card"><h2>${L('اللفات', 'Laps')}</h2>${r.laps.map((l, i) => `<div class="row between small"><span>${L('لفة', 'Lap')} ${i + 1}</span><span class="num">${fmtDist(l.d)} · ${fmtDur(l.s)}</span></div>`).join('')}</section>` : ''}
      <div class="grid2"><button class="btn" id="card">${ic('share', 18)} ${L('شارك صورة', 'Share image')}</button><button class="btn ghost" id="gpx">${ic('download', 18)} GPX</button></div>
      <button class="btn dark" id="post">${ic('community', 18)} ${L('انشرها في المجتمع', 'Post to community')}</button>
      ${t ? `<section class="card"><h2>${L('قيّم التراك', 'Rate the track')}</h2><div class="stars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-s="${n}" aria-label="${n}">${icFill('star', 34)}</button>`).join('')}</div><textarea class="input" id="rv" placeholder="${L('شو رأيك في التراك؟ الإنارة، الزحمة، الرمل…', 'How was the track? Lights, crowds, sand…')}"></textarea><button class="btn ghost" id="saveRv">${L('نشر التقييم', 'Post review')}</button></section>` : ''}
      <a class="btn link" href="#/explore" style="align-self:center">${L('رجوع للرئيسية', 'Back home')}</a>
    </main>`,
    mount() {
      confetti(); haptic([20, 40, 20]);
      const newly = ctx.badges().filter((b) => b.on && !(r.prevBadges || []).includes(b.id));
      store.set('badgesEarned', ctx.badges().filter((b) => b.on).map((b) => b.id));
      if (newly.length) setTimeout(() => toast(`🏅 ${L('شارة جديدة', 'New badge')}: ${newly.map((b) => L(b.ar, b.en)).join('، ')}`), 900);
      if (window.L?.map && r.pts.length) { sumMap = makeMap($('#smap'), [r.pts[0][0], r.pts[0][1]], 13); if (sumMap) { const pl = window.L.polyline(r.pts.map((p) => [p[0], p[1]]), { color: '#FF5B14', weight: 5 }).addTo(sumMap); if (r.pts.length > 1) sumMap.fitBounds(pl.getBounds().pad(.2)); } }
      else $('#smap').style.display = 'none';
      $('#card').onclick = () => shareCard(r);
      $('#gpx').onclick = () => download(`dawwasa-${new Date(r.startedAt).toISOString().slice(0, 10)}.gpx`, gpx(r), 'application/gpx+xml');
      $('#post').onclick = () => {
        const p = profile() || {};
        const posts = store.get('posts', []);
        posts.unshift({ id: uid(), mine: true, author: p.name, trackId: r.trackId, type: 'ride', rideId: r.id, text: L(`${fmtDist(r.dist)} في ${fmtDur(r.moving)} بمعدل ${fmtSpeed(r.avg)} ${speedUnit()} 🚴`, `${fmtDist(r.dist)} in ${fmtDur(r.moving)} at ${fmtSpeed(r.avg)} ${speedUnit()} 🚴`), at: Date.now() });
        store.set('posts', posts); toast(L('انتشرت ركبتك 🔥', 'Ride posted 🔥')); location.hash = '#/community';
      };
      $$('.stars button').forEach((b) => b.onclick = () => { stars = +b.dataset.s; $$('.stars button').forEach((x) => x.classList.toggle('on', +x.dataset.s <= stars)); haptic(); });
      $('#saveRv') && ($('#saveRv').onclick = () => { if (!stars) return toast(L('اختار النجوم', 'Pick a rating')); const rv = store.get('reviews', []); rv.push({ id: uid(), trackId: t.id, stars, text: $('#rv').value.trim().slice(0, 500), name: (profile() || {}).name || L('درّاج', 'Rider'), at: Date.now() }); store.set('reviews', rv); toast(L('ما قصّرت! انضاف تقييمك', 'Thanks! Review added')); $('#saveRv').disabled = true; });
    },
    unmount() { sumMap?.remove(); sumMap = null; },
  };
}
