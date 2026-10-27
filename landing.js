// Landing page + sign in / sign up, and the route gate for the whole app.
// Flow: #/home (hero) -> Get started -> onboarding as a guest -> #/signup to save -> dashboard
//       #/signin -> dashboard (or onboarding if unfinished)
// The full former landing page is kept on branch backup/landing-page.
// Accounts live in this browser only (localStorage); passwords are stored as SHA-256 hashes.

(() => {
  const ACCOUNTS = 'probank.accounts';
  const SESSION = 'probank.session';
  const ROLE = 'probank.role';
  const DEMO = { email: 'demo@probank.test', name: 'Alex Morgan', business: 'Bennett Precision Manufacturing' };

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const auth = {
    current: () => read(SESSION, null),
    account: (email) => read(ACCOUNTS, {})[email],
    obKey: (email = auth.current()) => `probank.onboarding.${email || 'guest'}`,
    onboarding: (email) => read(auth.obKey(email), {}),
    role: () => read(ROLE, 'client'),
    signIn(email, role = 'client') { write(SESSION, email); write(ROLE, role); },
    signOut() { try { localStorage.removeItem(SESSION); localStorage.removeItem(ROLE); } catch {} location.hash = '#/home'; },
    nextRoute(email = auth.current()) {
      if (auth.role() === 'advisor') return '#/overview';
      return auth.onboarding(email).done ? '#/owner' : '#/welcome';
    },
  };
  window.ProBankAuth = auth;

  // Seeded test account (credentials in TEST_ACCOUNTS.md). Only the password hash is stored here.
  const TEST = { email: 'james@pncnexus.test', name: 'James Bennett', business: 'Bennett Precision Manufacturing', hash: '9fd953642bb77d88b45b626d1f0da32ddae6c940db4e642b2a33eb2acae37291' };
  (() => {
    const accounts = read(ACCOUNTS, {});
    if (accounts[TEST.email]?.hash === TEST.hash) return;
    accounts[TEST.email] = { name: TEST.name, business: TEST.business, hash: TEST.hash };
    write(ACCOUNTS, accounts);
    const ob = read(auth.obKey(TEST.email), {});
    write(auth.obKey(TEST.email), { reason: 'family', ...ob, name: TEST.name, business: TEST.business, email: TEST.email, done: true });
  })();

  async function hash(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const img = (n) => `assets/img/home/${n}`;
  const logo = `<a class="lp-logo" href="#/home"><img src="assets/img/nexus-logo.png" alt="PNC NEXUS"></a>`;

  const ico = {
    search: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9.5" cy="9.5" r="8" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    phone: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" stroke="#F2711C" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
    fb: `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.8-.8Z" fill="#3B5998"/></svg>`,
    yt: `<svg width="24" height="20" viewBox="0 0 24 18"><rect width="24" height="17" y=".5" rx="4" fill="#F00"/><path d="m9.5 5 6.5 4-6.5 4z" fill="#fff"/></svg>`,
    li: `<svg width="20" height="20" viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#2F6EDB"/><path d="M5 9.5h3V19H5zM6.5 5a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM10 9.5h2.9v1.3c.4-.8 1.4-1.5 2.9-1.5 3 0 3.6 2 3.6 4.6V19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S13 13 13 14.3V19h-3z" fill="#fff"/></svg>`,
    ig: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" stroke="#E1306C" stroke-width="2"/><circle cx="12" cy="12" r="4.5" stroke="#E1306C" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3" fill="#E1306C"/></svg>`,
    briefcase: `<svg width="28" height="24" viewBox="0 0 28 24" fill="none"><rect x="2" y="6" width="24" height="16" rx="3" stroke="#F2711C" stroke-width="2.2"/><path d="M10 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h24" stroke="#F2711C" stroke-width="2.2"/></svg>`,
    house: `<svg width="26" height="28" viewBox="0 0 26 28" fill="none"><path d="M2 12 13 2l11 10v12a2 2 0 0 1-2 2h-5v-8H9v8H4a2 2 0 0 1-2-2z" stroke="#F2711C" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
    go: `<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h11m0 0L7.5 1.5M12 6l-4.5 4.5" stroke="#F2711C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const social = `<div class="lp-social"><a href="#" aria-label="Facebook">${ico.fb}</a><a href="#" aria-label="YouTube">${ico.yt}</a><a href="#" aria-label="LinkedIn">${ico.li}</a><a href="#" aria-label="Instagram">${ico.ig}</a></div>`;
  const PHONE = '1-800-555-0199';

  const root = document.createElement('div');
  root.className = 'lp';
  document.body.appendChild(root);

  /* ---------------- Screens ---------------- */

  function landing() {
    const signed = auth.current();
    const cta = signed
      ? `<a class="lp-btn fill sm" href="#/signin">Dashboard</a>`
      : `<a class="lp-btn fill sm" href="#/signin">Sign in</a>`;
    const values = [
      ['integrity', 'Valuation', 'A preliminary value range from a few honest answers'],
      ['demonstrate', 'Readiness', 'Scored across seven dimensions of your business'],
      ['diversity', 'Pathways', 'Family, management, sale or prepare first'],
      ['teamwork', 'Advisors', 'One relationship manager coordinating every specialist'],
      ['collaboration', 'Family', 'Bring the people who matter into the conversation'],
      ['technology', 'Secure', 'Your answers stay private and in your control'],
      ['corporate', 'Governance', 'Ownership, agreements and continuity done right'],
      ['digital', 'Wealth', 'Understand what a transition means for you and your family'],
    ];
    const services = [
      ['svc-transition.jpg', 'Transition planning'],
      ['svc-valuation.jpg', 'Business valuation'],
      ['svc-wealth.jpg', 'Wealth planning'],
      ['../landing/handshake.jpg', 'Advisory team'],
    ];
    const stats = [
      ['5', 'min', 'To your first picture', true], ['7', '', 'Transition paths'],
      ['7', '', 'Readiness dimensions'], ['4', '', 'Specialist teams'],
      ['3', '', 'Simple steps'], ['1', '', 'Advisor coordinating'],
      ['100', '%', 'Your answers, your control'], ['1', '', 'Shared profile with your advisor'],
    ];
    return `
    <header class="lp-head"><div class="lp-wrap">
      ${logo}
      <div class="right"><a class="lp-search" href="#" aria-label="Search">${ico.search}</a>${cta}</div>
    </div></header>

    <section class="lp-hero"><div class="lp-wrap lp-hero-grid">
      <div class="lp-hero-copy">
        <h1 class="lp-h1">Plan Your Next Chapter with us</h1>
        <p>A few honest answers today give you a clear picture of what your business may be worth and where it could go next.</p>
        <div class="lp-hero-btns">
          ${signed
            ? `<a class="lp-btn fill" href="#/signin">Go to dashboard</a><a class="lp-btn line" href="#" data-signout>Sign out</a>`
            : `<a class="lp-btn fill" href="#/welcome">Get started</a><a class="lp-btn line" href="#/signin">Sign in</a>`}
        </div>
        <div class="lp-contact"><span class="ph">${ico.phone}${PHONE}</span>${social}</div>
      </div>
      <div class="lp-visual">
        <div class="lp-family"><img src="${img('family.png')}" alt="Family business owners"></div>
        <div class="lp-chip a">${ico.briefcase}Business Sale</div>
        <div class="lp-chip b">${ico.house}Family Succession</div>
      </div>
    </div></section>
  `;
  }

  function authScreen(mode) {
    const up = mode === 'signup';
    const side = `<aside class="au-side">
      ${logo}
      <div class="copy">
        <h2>${up ? 'Start Your Next Chapter' : 'Welcome Back'}</h2>
        <p>${up ? 'Create your account, then take the 5-minute quick start to see your value range, readiness and pathways.' : 'Pick up where you left off. Your answers, plans and advisory team are waiting.'}</p>
        <ul><li>Preliminary value range</li><li>Transition readiness score</li><li>Matched PNC specialists</li></ul>
      </div>
      <div class="fam"><img src="${img('family.png')}" alt=""></div>
    </aside>`;
    const fields = up
      ? `<div class="au-row2">
          <div class="au-field"><label>Your name</label><input class="au-input" name="name" autocomplete="name" placeholder="Alex Morgan"></div>
          <div class="au-field"><label>Business name</label><input class="au-input" name="business" autocomplete="organization" placeholder="Your company"></div>
        </div>`
      : '';
    return `<div class="au">${side}
      <main class="au-main"><div class="au-card">
        <h1>${up ? 'Create your account' : 'Sign in'}</h1>
        <div class="sub">${up ? 'It takes less than a minute.' : 'Good to see you again.'}</div>
        <form class="au-form" id="auForm" data-mode="${mode}" novalidate>
          ${up ? '' : `<div class="au-field"><label>I am signing in as</label>
            <div class="au-role" role="radiogroup" aria-label="Account type">
              <label><input type="radio" name="role" value="client" ${auth.role() !== 'advisor' ? 'checked' : ''}><span><b>Client</b><small>Business owner</small></span></label>
              <label><input type="radio" name="role" value="advisor" ${auth.role() === 'advisor' ? 'checked' : ''}><span><b>Advisor</b><small>PNC team member</small></span></label>
            </div></div>`}
          ${fields}
          <div class="au-field"><label>Email</label><input class="au-input" name="email" type="email" autocomplete="email" placeholder="you@company.com"></div>
          <div class="au-field"><label>Password</label><div class="au-pw"><input class="au-input" name="password" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="${up ? '8+ characters' : 'Your password'}"><button type="button" data-showpw>Show</button></div></div>
          <div class="au-err" id="auErr"></div>
          <div class="au-actions">
            <button class="lp-btn fill" type="submit">${up ? 'Create account' : 'Sign in'}</button>
            <button class="lp-btn line" type="button" data-demo>Explore the demo account</button>
          </div>
        </form>
        <div class="au-switch">${up ? 'Already have an account? <a href="#/signin">Sign in</a>' : 'New to PNC NEXUS? <a href="#/signup">Create an account</a>'}</div>
        <a class="au-back" href="#/home">Back to home</a>
      </div></main>
    </div>`;
  }

  /* ---------------- Router + gate ---------------- */

  const PUBLIC = ['', 'home', 'signin', 'signup'];
  const ONBOARDING = ['welcome', 'start/reason', 'start/notes', 'start/building', 'start/done'];
  const route = () => location.hash.replace(/^#\/?/, '');

  function gate() {
    const r = route();
    const user = auth.current();
    if (!user) {
      // Guests may take the onboarding before creating an account
      if (r === '' || r === 'landing') { location.replace('#/home'); return false; }
      if (!PUBLIC.includes(r) && !ONBOARDING.includes(r)) { location.replace('#/home'); return false; }
      return true;
    }
    // The front page is always shown; it offers a dashboard button when signed in
    if (r === '' || r === 'landing') { location.replace('#/home'); return false; }
    if (r === 'signup') { location.replace(auth.nextRoute()); return false; }
    // Signed in but onboarding unfinished: dashboard routes go to onboarding
    if (auth.role() !== 'advisor' && !PUBLIC.includes(r) && !ONBOARDING.includes(r) && !auth.onboarding().done) { location.replace('#/welcome'); return false; }
    return true;
  }

  function render() {
    if (!gate()) return;
    const r = route();
    if (r === 'home') root.innerHTML = landing();
    else if (r === 'signin' || r === 'signup') root.innerHTML = authScreen(r);
    else { root.classList.remove('show'); return; }
    root.classList.add('show');
    root.scrollTop = 0;
  }

  /* ---------------- Events ---------------- */

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-signout]')) { e.preventDefault(); auth.signOut(); render(); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      e.preventDefault();
      root.querySelector('#lp-' + jump.dataset.jump)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const pw = e.target.closest('[data-showpw]');
    if (pw) {
      const input = pw.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      pw.textContent = input.type === 'password' ? 'Show' : 'Hide';
      return;
    }
    if (e.target.closest('[data-demo]')) {
      const accounts = read(ACCOUNTS, {});
      accounts[DEMO.email] = { ...accounts[DEMO.email], name: DEMO.name, business: DEMO.business };
      write(ACCOUNTS, accounts);
      const ob = auth.onboarding(DEMO.email);
      write(auth.obKey(DEMO.email), { ...ob, name: DEMO.name, business: DEMO.business, reason: ob.reason || 'family', done: true });
      const role = root.querySelector('input[name="role"]:checked')?.value || 'client';
      auth.signIn(DEMO.email, role);
      location.hash = auth.nextRoute(DEMO.email);
    }
  });

  root.addEventListener('submit', async (e) => {
    if (e.target.id === 'lpNews') {
      e.preventDefault();
      const input = e.target.querySelector('input');
      const ok = /^\S+@\S+\.\S+$/.test(input.value);
      root.querySelector('#lpNewsOk').textContent = ok ? 'Thanks! You are on the list.' : 'Please enter a valid email address.';
      if (ok) input.value = '';
      return;
    }
    if (e.target.id !== 'auForm') return;
    e.preventDefault();
    const f = e.target;
    const up = f.dataset.mode === 'signup';
    const v = Object.fromEntries(new FormData(f));
    const errEl = f.querySelector('#auErr');
    f.querySelectorAll('.au-input').forEach((el) => el.classList.remove('err'));
    const fail = (name, msg) => { if (name) { f[name].classList.add('err'); f[name].focus(); } errEl.textContent = msg; };
    const email = (v.email || '').trim().toLowerCase();

    if (up && !v.name.trim()) return fail('name', 'Please enter your name.');
    if (up && !v.business.trim()) return fail('business', 'Please enter your business name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('email', 'Please enter a valid email address.');
    if (up && v.password.length < 8) return fail('password', 'Password must be at least 8 characters.');
    if (!up && !v.password) return fail('password', 'Please enter your password.');

    const accounts = read(ACCOUNTS, {});
    const h = await hash(v.password);
    if (up) {
      if (accounts[email]?.hash) return fail('email', 'An account with this email already exists. Sign in instead.');
      accounts[email] = { name: v.name.trim(), business: v.business.trim(), hash: h };
      write(ACCOUNTS, accounts);
      // Keep anything answered during guest onboarding
      const guest = read(auth.obKey(null), {});
      write(auth.obKey(email), { ...guest, name: v.name.trim(), business: v.business.trim(), email });
      try { localStorage.removeItem(auth.obKey(null)); } catch {}
    } else {
      if (!accounts[email] || accounts[email].hash !== h) return fail(null, 'Email or password is incorrect.');
    }
    auth.signIn(email, up ? 'client' : v.role || 'client');
    location.hash = auth.nextRoute(email);
  });

  window.addEventListener('hashchange', render);
  render();
})();
