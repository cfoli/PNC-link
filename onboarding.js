// Onboarding flow (Duolingo-style), shown after sign-up and before the dashboard.
// Routes: #/welcome  #/start/reason  #/start/notes  #/start/building  #/start/done
// State is kept per account in localStorage only ("Saved in this browser only").
// Sign-in/sign-up and route gating live in landing.js.

(() => {
  const DEMO_BUSINESS = 'Bennett Precision Manufacturing';
  const store = () => window.ProBankAuth.obKey();

  const load = () => { try { return JSON.parse(localStorage.getItem(store())) || {}; } catch { return {}; } };
  const save = (patch) => {
    const next = { ...load(), ...patch };
    try { localStorage.setItem(store(), JSON.stringify(next)); } catch {}
    return next;
  };

  const REASONS = [
    { id: 'retirement', emo: '🏖️', t: 'Retirement', d: 'Stepping back on your own timeline.' },
    { id: 'family', emo: '🌳', t: 'Family succession', d: 'Passing leadership or ownership to family.' },
    { id: 'offer', emo: '✉️', t: 'Unsolicited offer', d: 'Someone asked to buy. Is it fair?' },
    { id: 'liquidity', emo: '💰', t: 'Liquidity need', d: 'Taking some value off the table.' },
    { id: 'partner', emo: '🤝', t: 'Partner change', d: 'A co-owner is leaving or arriving.' },
    { id: 'growth', emo: '🚀', t: 'Growth capital', d: 'Funding the next chapter.' },
    { id: 'unsure', emo: '🧭', t: 'Not sure yet', d: 'Just want to understand the options.' },
  ];

  // Order of the progress-bar steps
  const STEPS = ['start/reason', 'start/notes', 'start/building'];

  const root = document.createElement('div');
  root.className = 'ob';
  document.body.appendChild(root);

  const mascot = `<svg class="ob-mascot" viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".07"/>
    <rect x="18" y="22" width="84" height="82" rx="30" fill="#1814F3"/>
    <rect x="18" y="22" width="84" height="40" rx="20" fill="#4C49ED" opacity=".55"/>
    <circle cx="44" cy="58" r="14" fill="#fff"/><circle cx="76" cy="58" r="14" fill="#fff"/>
    <circle cx="47" cy="60" r="6.5" fill="#232323"/><circle cx="79" cy="60" r="6.5" fill="#232323"/>
    <circle cx="49" cy="57.5" r="2" fill="#fff"/><circle cx="81" cy="57.5" r="2" fill="#fff"/>
    <path d="M50 80q10 9 20 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <rect x="36" y="88" width="48" height="8" rx="4" fill="#FF82AC"/>
    <path d="M60 22V10" stroke="#1814F3" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="9" r="6" fill="#16DBCC"/>
  </svg>`;

  const arrowLeft = `<svg width="20" height="18" viewBox="0 0 20 18" fill="none"><path d="M19 9H2m0 0 7.5-7.5M2 9l7.5 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const chevron = `<svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="m2 2 6 6-6 6" stroke="#afafaf" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const lock = `<svg width="13" height="14" viewBox="0 0 13 14" fill="none"><rect x="1" y="6" width="11" height="7.5" rx="2" fill="#afafaf"/><path d="M3.5 6V4.2a3 3 0 0 1 6 0V6" stroke="#afafaf" stroke-width="1.8"/></svg>`;

  function topBar(route, { back = true, skip = false } = {}) {
    const i = STEPS.indexOf(route);
    const pct = i < 0 ? 0 : Math.round(((i + 1) / (STEPS.length + 1)) * 100);
    return `<div class="ob-top">
      <a class="ob-back ${back ? '' : 'hidden'}" href="#" data-back aria-label="Back">${arrowLeft}</a>
      <div class="ob-bar"><i style="width:${pct}%"></i></div>
      <a class="ob-skip ${skip ? '' : 'hidden'}" href="#" data-skip>SKIP</a>
    </div>`;
  }

  /* ---------------- Screens ---------------- */

  const screens = {};

  screens.welcome = () => {
    const st = load();
    const resumeName = st.business || DEMO_BUSINESS;
    const guest = !window.ProBankAuth.current();
    return `
    <div class="ob-top"><a class="ob-logo" href="#/home"><img src="assets/img/nexus-logo.png" alt="PNC NEXUS"></a>${guest
      ? '<a class="ob-skip" href="#/signin" style="margin-left:auto">SIGN IN</a>'
      : '<a class="ob-skip" href="#" data-signout style="margin-left:auto">SIGN OUT</a>'}</div>
    <div class="ob-body" style="max-width:900px">
      <div class="ob-talk">${mascot}<div class="ob-bubble">Hi${st.name ? ' ' + esc(st.name.split(' ')[0]) : ''}! I'm your PNC NEXUS guide. Let's understand where your business is today.</div></div>
      <div style="text-align:center"><span class="ob-eyebrow">Quick start · About 5 minutes</span></div>
      <h1 class="ob-h1" style="margin-top:10px">Let's understand where you are.</h1>
      <p class="ob-lead">PNC NEXUS turns a few honest answers into a clear picture: what your business may be worth, how ready it is, which paths could fit, and who at PNC can help. You stay in control of every answer.</p>
      <div class="ob-steps">
        <div class="ob-step"><div class="num" style="background:#1814F3">01</div><h3>Share what you know</h3><p>Short questions, cards and sliders. Skip anything.</p></div>
        <div class="ob-step"><div class="num" style="background:#16DBCC">02</div><h3>See your picture</h3><p>Preliminary value range, readiness and pathways.</p></div>
        <div class="ob-step"><div class="num" style="background:#FF82AC">03</div><h3>Meet the right people</h3><p>An advisor verifies and coordinates specialists.</p></div>
      </div>
      <div class="ob-foot">
        <a class="ob-btn" href="#/start/reason">${guest ? "Let's start" : st.business && st.business !== DEMO_BUSINESS ? `Start with ${esc(st.business)}` : 'New profile'}</a>
        <div class="ob-or">OR</div>
        ${guest
          ? `<a class="ob-resume" href="#/signin"><span class="av">👋</span><span><span class="k">Already have an account?</span><br><span class="v">Sign in</span></span>${chevron}</a>`
          : `<button class="ob-resume" data-resume><span class="av">🏭</span><span><span class="k">Continue</span><br><span class="v">${resumeName}</span></span>${chevron}</button>`}
      </div>
    </div>`;
  };

  screens['start/reason'] = () => {
    const sel = load().reason;
    return `${topBar('start/reason')}
    <div class="ob-body" style="max-width:860px">
      <h1 class="ob-h1">What brought you here?</h1>
      <p class="ob-hint">Pick the closest. You can change it later.</p>
      <div class="ob-options">
        ${REASONS.map((r) => `
          <button class="ob-opt ${sel === r.id ? 'sel' : ''}" data-reason="${r.id}">
            <span class="emo">${r.emo}</span><span class="t">${r.t}</span><span class="d">${r.d}</span>
          </button>`).join('')}
      </div>
      <div class="ob-foot" style="max-width:none"><button class="ob-btn" data-next="start/notes" ${sel ? '' : 'disabled'}>Continue</button></div>
    </div>`;
  };

  screens['start/notes'] = () => {
    const st = load();
    return `${topBar('start/notes', { skip: true })}
    <div class="ob-body" style="max-width:600px">
      <div class="ob-talk">${mascot}<div class="ob-bubble">Almost there! Anything else I should know?</div></div>
      <div class="ob-label">Anything else on your mind? <span>(optional)</span></div>
      <textarea class="ob-field" id="obNotes" placeholder="e.g. My daughter runs operations, but I'm not sure she wants to own it.">${esc(st.notes)}</textarea>
      <div class="ob-info" style="margin-top:16px">
        <span class="ico">📁</span>
        <div><b>Have documents?</b> Secure file upload is not connected in this prototype. You can track what you have on the document checklist instead.</div>
      </div>
      <div class="ob-foot" style="max-width:none">
        <button class="ob-btn" data-start>Start assessment</button>
        <div class="ob-note">${lock} Saved in this browser only.</div>
      </div>
    </div>`;
  };

  screens['start/building'] = () => `${topBar('start/building', { back: false })}
    <div class="ob-body"><div class="ob-center">
      ${mascot}
      <h1 class="ob-h1" style="margin-top:20px">Building your picture…</h1>
      <div class="ob-checks">
        <div class="ob-check"><i></i>Reading your answers</div>
        <div class="ob-check"><i></i>Estimating a preliminary value range</div>
        <div class="ob-check"><i></i>Scoring transition readiness</div>
        <div class="ob-check"><i></i>Matching pathways and PNC specialists</div>
      </div>
    </div></div>`;

  screens['start/done'] = () => {
    const st = load();
    const reason = REASONS.find((r) => r.id === st.reason) || REASONS[6];
    return `<div class="ob-top"><div class="ob-bar"><i style="width:100%"></i></div></div>
    <div class="ob-body"><div class="ob-center">
      ${mascot}
      <h1 class="ob-h1" style="margin-top:20px">Your picture is ready${st.name ? `, ${esc(st.name.split(' ')[0])}` : ''}!</h1>
      <p class="ob-lead">${window.ProBankAuth.current() ? `We've set up ${esc(st.business || DEMO_BUSINESS)} with a starting view. An advisor will verify it with you.` : 'Create your account to save your answers and open your dashboard.'}</p>
      <div class="ob-stats">
        <div class="ob-stat" style="border-color:#1814F3"><div class="h" style="background:#1814F3">Path</div><div class="v" style="color:#1814F3">${reason.emo} ${reason.t}</div></div>
        <div class="ob-stat" style="border-color:#16DBCC"><div class="h" style="background:#16DBCC">Readiness</div><div class="v" style="color:#0fb5a8">📈 67%</div></div>
        <div class="ob-stat" style="border-color:#FF82AC"><div class="h" style="background:#FF82AC">Advisors</div><div class="v" style="color:#e4588a">👥 3 matched</div></div>
      </div>
      <div class="ob-foot" style="width:100%"><button class="ob-btn" data-finish>${window.ProBankAuth.current() ? 'Go to my dashboard' : 'Create account to save'}</button></div>
    </div></div>`;
  };

  /* ---------------- Behaviour ---------------- */

  function esc(v) {
    return String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  const route = () => location.hash.replace(/^#\/?/, '');
  const isObRoute = (r) => r in screens;
  let timers = [];

  function render() {
    timers.forEach(clearTimeout);
    timers = [];
    const r = route();
    if (!isObRoute(r)) {
      root.classList.remove('show');
      document.body.style.overflow = '';
      return;
    }
    root.innerHTML = screens[r]();
    root.classList.add('show');
    document.body.style.overflow = 'hidden';
    root.scrollTop = 0;
    if (r === 'start/building') runBuilding();
    if (r === 'start/done') confetti();
  }

  function runBuilding() {
    const checks = [...root.querySelectorAll('.ob-check')];
    checks.forEach((c, i) => timers.push(setTimeout(() => c.classList.add('on'), 600 + i * 650)));
    timers.push(setTimeout(() => (location.hash = '#/start/done'), 600 + checks.length * 650 + 500));
  }

  function confetti() {
    const box = document.createElement('div');
    box.className = 'ob-confetti';
    const colors = ['#1814F3', '#16DBCC', '#FF82AC', '#FCAA0B', '#58CC02'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      p.style.animationDelay = Math.random() * 0.5 + 's';
      box.appendChild(p);
    }
    root.appendChild(box);
    timers.push(setTimeout(() => box.remove(), 4500));
  }

  function goBack() {
    const r = route();
    const order = ['welcome', ...STEPS];
    const i = order.indexOf(r);
    location.hash = '#/' + (i > 0 ? order[i - 1] : 'welcome');
  }

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-back]')) { e.preventDefault(); goBack(); return; }
    if (t.closest('[data-signout]')) { e.preventDefault(); window.ProBankAuth.signOut(); return; }
    if (t.closest('[data-skip]')) { e.preventDefault(); save({ notes: '' }); location.hash = '#/start/building'; return; }
    if (t.closest('[data-resume]')) {
      const st = load();
      save({ done: true, business: st.business || DEMO_BUSINESS });
      location.hash = '#/owner';
      return;
    }
    const opt = t.closest('[data-reason]');
    if (opt) {
      save({ reason: opt.dataset.reason });
      root.querySelectorAll('.ob-opt').forEach((o) => o.classList.toggle('sel', o === opt));
      root.querySelector('[data-next]').disabled = false;
      return;
    }
    const next = t.closest('[data-next]');
    if (next) { location.hash = '#/' + next.dataset.next; return; }
    if (t.closest('[data-start]')) {
      save({ notes: root.querySelector('#obNotes').value.trim() });
      location.hash = '#/start/building';
      return;
    }
    if (t.closest('[data-finish]')) {
      save({ done: true });
      // Guests create an account next; their answers carry over on sign-up
      location.hash = window.ProBankAuth.current() ? '#/owner' : '#/signup';
      return;
    }
    const pw = t.closest('[data-showpw]');
    if (pw) {
      const input = pw.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      pw.textContent = input.type === 'password' ? 'SHOW' : 'HIDE';
    }
  });

  window.addEventListener('hashchange', render);
  render();


})();
