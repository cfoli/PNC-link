// Owner dashboard: where the owner stands today, what is still unknown,
// and which conversations could come next. Registered as pages.owner in app.js.

const OWNER = {
  industry: 'Manufacturing',
  owner: 'James D. Bennett',
  business: 'Bennett Precision Manufacturing',
  stage: 'Assess',
  readiness: 54,
  timeline: '3 yrs',
  revenue: 38.4,
  ebitda: 5.6,
  ebitdaCalc: 5.625, // unrounded EBITDA used for scenario math
  debt: 4.2,
  ownerShare: 0.85,
  value: { low: 23.9, high: 29.6, mid: 26.8, mLow: 4.3, mHigh: 5.3, bandLow: 4, bandHigh: 6 },
  dimensions: [
    ['Financial quality', 68], ['Owner transferability', 32], ['Governance', 42], ['Family alignment', 55],
    ['Operations', 63], ['Tax & legal', 38], ['Timing runway', 78],
  ],
  pathways: [
    {
      t: 'Prepare before deciding', short: 'Prepare', fit: 56, liq: 0.17, ctrl: 0.6, ev: 'Grows with readiness',
      why: 'Overall readiness is 54/100. 3 year runway allows improvement work.',
      pro: 'Improves options and potential value.', con: 'Delays liquidity; market conditions may change.',
    },
    {
      t: 'Family transfer', short: 'Family', fit: 55, liq: 0.36, ctrl: 0.8, ev: '$23.9M · 4.3x',
      why: 'A family successor may be interested, not yet confirmed. Family alignment scored 55.',
      pro: 'Preserves legacy and control within the family.', con: 'Often lower immediate liquidity; may require seller financing or gifting.',
    },
    {
      t: 'Strategic sale', short: 'Strategic sale', fit: 55, liq: 0.8, ctrl: 0.32, ev: '$29.6M · 5.3x',
      why: 'EBITDA of $5.6M may attract industry acquirers. Buyer interest has not been tested.',
      pro: 'Potentially strongest headline price.', con: 'Less control over culture, name and team after close.',
    },
  ],
  gaps: [
    ['Successor interest unconfirmed', 'Family or management pathways depend on a willing successor.', 'red'],
    ['Tax and estate review', 'Structure decisions affect after-tax proceeds.', 'orange'],
    ['6 checklist items not verified', 'Verified information narrows uncertainty.', 'blue'],
    ['Advisor verification pending', 'Later journey stages open after an advisor reviews the profile.', 'teal'],
  ],
  teams: [
    ['HW', 'Harris Williams', 'Potential fit', 82, 'EBITDA $5.6M against an illustrative sell-side threshold. Relevant if a strategic or sponsor process is pursued.', '#1814F3', '#E7EDFF'],
    ['PP', 'PNC Private Bank', 'Potential fit', 78, 'Illustrative owner share of midpoint value: $22.7M. Wealth, estate and family distribution planning.', '#16DBAA', '#DCFAF8'],
    ['BC', 'Business Credit', 'Possible fit', 64, 'Existing debt $4.2M. Financing for management, family buyouts or recapitalization.', '#FCAA0B', '#FFF5D9'],
    ['TM', 'Treasury Management', 'Possible fit', 58, 'Revenue $38.4M suggests treasury complexity. Cash management continuity through ownership change.', '#FF82AC', '#FFE0EB'],
  ],
  comparison: [
    ['Strategic sale', 5.3, 29.6, 0, 5.1, 13.9],
    ['PE with rollover', 4.8, 26.8, 4.5, 3.4, 8.7],
    ['Family transfer', 4.3, 23.9, 6.6, 2.2, 6.2],
  ],
};

const SCEN_KEY = 'pnc-nexus.scenario';
const REQ_KEY = 'pnc-nexus.meeting-request';
const SCEN_DEFAULT = { multiple: 5.0, expenses: 4, tax: 25, rollover: 0, family: 1500000 };

const loadJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const m$ = (v) => `$${v.toFixed(1)}M`;
const neg$ = (v) => (v > 0.05 ? `($${v.toFixed(1)}M)` : '-$0');

function computeScenario(s) {
  const ev = OWNER.ebitdaCalc * s.multiple;
  const exp = ev * (s.expenses / 100);
  const share = (ev - OWNER.debt - exp) * OWNER.ownerShare;
  const roll = share * (s.rollover / 100);
  const tax = (share - roll) * (s.tax / 100);
  const fam = (s.family || 0) / 1e6;
  return { ev, exp, share, roll, tax, fam, invest: share - roll - tax - fam };
}

function ownerProfile() {
  let st = {};
  try { st = JSON.parse(localStorage.getItem(window.ProBankAuth?.obKey())) || {}; } catch {}
  const isDemo = !st.business || st.business === OWNER.business;
  return {
    business: isDemo ? OWNER.business : st.business,
    owner: isDemo ? OWNER.owner : st.name || 'Owner',
  };
}

// Chart palette (validated: lightness band, CVD separation, contrast all pass)
const C = { blue: '#1814F3', teal: '#0F9F8F', orange: '#E0662A', violet: '#9B5CF6', gray: '#C3CCE0', ink: '#343C6A', muted: '#718EBF', grid: '#EDF0F7' };
// Scenario identity colors stay the same in every chart
const SCEN_COLORS = { 'Your working scenario': C.blue, 'Strategic sale': C.teal, 'PE with rollover': C.orange, 'Family transfer': C.violet };

const eyebrow = (t) => `<div class="ow-eyebrow">${t}</div>`;
const info = (tip) => `<span class="ow-info" data-tip="${tip}"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#718EBF" stroke-width="1.5"/><path d="M8 7v4.5M8 4.6v.1" stroke="#718EBF" stroke-width="1.6" stroke-linecap="round"/></svg></span>`;
const card = (title, sub, body, extra = '', cls = '') =>
  `<section class="panel ow-card ${cls}"><div class="ow-head"><div>${sub ? eyebrow(sub) : ''}<h3 class="section-title">${title}</h3></div>${extra}</div>${body}</section>`;

/* ---------------- Charts ---------------- */

function gaugeSvg(v) {
  // Semi-circle gauge, 0-100
  const r = 34, cx = 42, cy = 40, a = Math.PI * (1 - v / 100);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  return `<svg viewBox="0 0 84 46" width="66" height="36" aria-hidden="true">
    <path d="M8 40a34 34 0 0 1 68 0" fill="none" stroke="${C.grid}" stroke-width="8" stroke-linecap="round"/>
    <path d="M8 40A34 34 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${C.blue}" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

function rangeMini(v) {
  const pos = (x) => ((x - 20) / 14) * 100;
  return `<div class="ow-mini-range" aria-hidden="true"><span style="left:${pos(v.low)}%;right:${100 - pos(v.high)}%"></span><i style="left:${pos(v.mid)}%"></i></div>`;
}

function footballField(evWorking) {
  const v = OWNER.value;
  const X0 = 170, X1 = 660, lo = 20, hi = 34;
  const x = (val) => X0 + ((val - lo) / (hi - lo)) * (X1 - X0);
  const rows = [
    { l: 'Illustrative range', s: `${v.mLow}–${v.mHigh}x`, band: [v.low, v.high], mid: v.mid },
    { l: 'Your working scenario', s: `${scenState().multiple.toFixed(1)}x`, pt: evWorking },
    ...OWNER.comparison.map(([n, m, ev]) => ({ l: n, s: `${m}x`, pt: ev })),
  ];
  let svg = `<svg viewBox="0 0 690 320" width="100%" role="img" aria-label="Enterprise value by scenario">`;
  for (let t = lo; t <= hi; t += 2) {
    svg += `<line x1="${x(t)}" x2="${x(t)}" y1="14" y2="286" stroke="${C.grid}"/>`;
    svg += `<text x="${x(t)}" y="306" font-size="12" fill="${C.muted}" text-anchor="middle">$${t}M</text>`;
  }
  // shaded demo band 4-6x of EBITDA
  const bandLo = OWNER.ebitda * v.bandLow, bandHi = OWNER.ebitda * v.bandHigh;
  svg += `<rect x="${x(Math.max(lo, bandLo))}" y="14" width="${x(Math.min(hi, bandHi)) - x(Math.max(lo, bandLo))}" height="272" fill="#F5F7FA"/>`;
  rows.forEach((r, i) => {
    const y = 42 + i * 56;
    svg += `<text x="0" y="${y - 2}" font-size="13" font-weight="600" fill="${C.ink}">${r.l}</text>`;
    svg += `<text x="0" y="${y + 14}" font-size="11.5" fill="${C.muted}">${r.s}</text>`;
    if (r.band) {
      const [a, b] = r.band;
      svg += `<rect x="${x(a)}" y="${y - 12}" width="${x(b) - x(a)}" height="24" rx="4" fill="${C.blue}" opacity=".16" data-tip="Range ${m$(a)} – ${m$(b)}"/>`;
      svg += `<rect x="${x(a)}" y="${y - 12}" width="4" height="24" rx="2" fill="${C.blue}"/><rect x="${x(b) - 4}" y="${y - 12}" width="4" height="24" rx="2" fill="${C.blue}"/>`;
      svg += `<rect x="${x(r.mid) - 1.5}" y="${y - 17}" width="3" height="34" rx="1.5" fill="${C.ink}" data-tip="Midpoint ${m$(r.mid)}"/>`;
      svg += `<text x="${x(a) - 8}" y="${y + 4}" font-size="12.5" font-weight="600" fill="${C.ink}" text-anchor="end">${m$(a)}</text>`;
      svg += `<text x="${x(b) + 8}" y="${y + 4}" font-size="12.5" font-weight="600" fill="${C.ink}">${m$(b)}</text>`;
    } else {
      const col = SCEN_COLORS[r.l];
      svg += `<line x1="${x(lo)}" x2="${x(r.pt)}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="2" opacity=".35"/>`;
      svg += `<circle cx="${x(r.pt)}" cy="${y}" r="7" fill="${col}" stroke="#fff" stroke-width="2" data-tip="${r.l}: EV ${m$(r.pt)} at ${r.s}"/>`;
      svg += `<text x="${x(r.pt) + 14}" y="${y + 4}" font-size="12.5" font-weight="600" fill="${C.ink}">${m$(r.pt)}</text>`;
    }
  });
  return svg + `</svg>`;
}

function radar() {
  const dims = OWNER.dimensions;
  const short = ['Financial', 'Transferability', 'Governance', 'Family', 'Operations', 'Tax & legal', 'Runway'];
  const cx = 240, cy = 158, R = 118, n = dims.length;
  const pt = (i, val) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + R * (val / 100) * Math.cos(a), cy + R * (val / 100) * Math.sin(a)];
  };
  let svg = `<svg viewBox="0 0 480 320" width="100%" role="img" aria-label="Readiness across seven dimensions">`;
  [25, 50, 75, 100].forEach((ring) => {
    svg += `<polygon points="${dims.map((_, i) => pt(i, ring).join(',')).join(' ')}" fill="none" stroke="${C.grid}" stroke-width="1"/>`;
  });
  dims.forEach((_, i) => { const [x2, y2] = pt(i, 100); svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${C.grid}"/>`; });
  svg += `<text x="${cx + 4}" y="${cy - R * 0.5 + 4}" font-size="10" fill="#B1B9CF">50</text>`;
  const poly = dims.map(([, v], i) => pt(i, v).join(',')).join(' ');
  svg += `<polygon points="${poly}" fill="${C.blue}" fill-opacity=".14" stroke="${C.blue}" stroke-width="2" stroke-linejoin="round"/>`;
  dims.forEach(([name, v], i) => {
    const [x, y] = pt(i, v);
    svg += `<circle cx="${x}" cy="${y}" r="5" fill="${C.blue}" stroke="#fff" stroke-width="2"/>`;
    svg += `<circle cx="${x}" cy="${y}" r="14" fill="transparent" data-tip="${name.replace('&', '&amp;')}: ${v}/100"/>`;
    const [lx, ly] = pt(i, 118);
    const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
    svg += `<text x="${lx}" y="${ly + 4}" font-size="13.5" fill="${C.muted}" text-anchor="${anchor}">${short[i].replace('&', '&amp;')} <tspan font-weight="700" fill="${C.ink}">${v}</tspan></text>`;
  });
  return svg + `</svg>`;
}

function waterfall(r) {
  const steps = [
    ['Enterprise value', r.ev, 'start'],
    ['Debt', -OWNER.debt], ['Fees', -r.exp],
    ['Non-owner 15%', -(r.ev - OWNER.debt - r.exp - r.share)],
    ['Rollover', -r.roll], ['Taxes', -r.tax], ['Family', -r.fam],
    ['Investable', r.invest, 'end'],
  ];
  const W = 700, top = 30, base = 240, bw = 54, gap = (W - 30 - steps.length * bw) / (steps.length - 1);
  const y = (v) => base - (v / r.ev) * (base - top);
  let svg = `<svg viewBox="0 0 ${W} 290" width="100%" role="img" aria-label="Proceeds waterfall">`;
  [0, 0.25, 0.5, 0.75, 1].forEach((f) => {
    const yy = base - f * (base - top);
    svg += `<line x1="30" x2="${W}" y1="${yy}" y2="${yy}" stroke="${C.grid}"/>`;
    svg += `<text x="24" y="${yy + 4}" font-size="11" fill="${C.muted}" text-anchor="end">${Math.round(r.ev * f)}</text>`;
  });
  let run = 0;
  steps.forEach(([label, v, kind], i) => {
    const x = 30 + i * (bw + gap);
    let y0, y1, fill;
    if (kind === 'start') { y0 = 0; y1 = v; run = v; fill = C.blue; }
    else if (kind === 'end') { y0 = 0; y1 = v; fill = C.teal; }
    else { y1 = run; run += v; y0 = run; fill = C.gray; }
    const h = Math.max(1.5, y(y0) - y(y1));
    svg += `<rect x="${x}" y="${y(y1)}" width="${bw}" height="${h}" rx="4" fill="${fill}" data-tip="${label}: ${v < 0 ? '−' : ''}${m$(Math.abs(v))}"/>`;
    if (i < steps.length - 1) {
      const nx = x + bw + gap;
      svg += `<line x1="${x + bw}" x2="${nx}" y1="${y(run)}" y2="${y(run)}" stroke="#B1B9CF" stroke-dasharray="3 3"/>`;
    }
    const valTxt = kind ? m$(v) : Math.abs(v) < 0.05 ? '$0' : `−${Math.abs(v).toFixed(1)}`;
    svg += `<text x="${x + bw / 2}" y="${y(Math.max(y0, y1)) - 7}" font-size="12" font-weight="${kind ? 700 : 600}" fill="${kind === 'end' ? '#0B7A6E' : C.ink}" text-anchor="middle">${valTxt}</text>`;
    svg += `<text x="${x + bw / 2}" y="262" font-size="11.5" fill="${C.muted}" text-anchor="middle">${label}</text>`;
  });
  svg += `<line x1="30" x2="${W}" y1="${base}" y2="${base}" stroke="#B1B9CF"/>`;
  return svg + `</svg>`;
}

function comparisonBars(r, s) {
  const rows = [['Your working scenario', s.multiple, r.ev, r.roll, r.tax, r.invest], ...OWNER.comparison];
  const max = Math.max(...rows.map((x) => x[2]));
  const seg = (w, col, tip) => (w > 0.05 ? `<i style="width:${(w / max) * 100}%;background:${col}" data-tip="${tip}"></i>` : '');
  return `<div class="ow-legend">
      <span><i style="background:${C.teal}"></i>Investable</span><span><i style="background:${C.orange}"></i>Taxes</span>
      <span><i style="background:${C.violet}"></i>Rollover</span><span><i style="background:${C.gray}"></i>Debt, fees &amp; other</span>
    </div>
    <div class="ow-stack">
      ${rows.map(([n, mlt, ev, roll, tax, inv]) => {
        const other = ev - roll - tax - inv;
        return `<div class="row${n === 'Your working scenario' ? ' mine' : ''}">
          <div class="lbl"><i style="background:${SCEN_COLORS[n]}"></i><span>${n}<small>${Number(mlt).toFixed(1)}x · EV ${m$(ev)}</small></span></div>
          <div class="bar">${seg(inv, C.teal, `Investable ${m$(inv)}`)}${seg(tax, C.orange, `Taxes ${m$(tax)}`)}${seg(roll, C.violet, `Rollover ${m$(roll)}`)}${seg(other, C.gray, `Debt, fees &amp; other ${m$(other)}`)}</div>
          <b>${m$(inv)}</b>
        </div>`;
      }).join('')}
    </div>
    <table class="ow-table" hidden>
      <thead><tr><th>Scenario</th><th>Multiple</th><th>EV</th><th>Rollover</th><th>Taxes</th><th>Investable</th></tr></thead>
      <tbody>${rows.map(([n, mlt, ev, roll, tax, inv]) => `<tr><td>${n}</td><td>${Number(mlt).toFixed(1)}x</td><td>${m$(ev)}</td><td>${roll > 0.05 ? m$(roll) : '$0'}</td><td>${m$(tax)}</td><td><b>${m$(inv)}</b></td></tr>`).join('')}</tbody>
    </table>`;
}

const scenState = () => ({ ...SCEN_DEFAULT, ...loadJSON(SCEN_KEY, {}) });

/* ---------------- Pathways + team logos ---------------- */

const PATH_COLORS = [C.blue, C.violet, C.teal];

function pathwaysPanel() {
  const P = OWNER.pathways;
  const X0 = 44, X1 = 396, Y0 = 16, Y1 = 214;
  const px = (v) => X0 + v * (X1 - X0), py = (v) => Y1 - v * (Y1 - Y0);
  const tip = (pw) => `${pw.why} + ${pw.pro} − ${pw.con}`;
  let svg = `<svg viewBox="0 0 410 252" width="100%" role="img" aria-label="Pathways by liquidity and control">
    <rect x="${X0}" y="${Y0}" width="${(X1 - X0) / 2}" height="${(Y1 - Y0) / 2}" fill="#F3F1FF"/>
    <rect x="${(X0 + X1) / 2}" y="${(Y0 + Y1) / 2}" width="${(X1 - X0) / 2}" height="${(Y1 - Y0) / 2}" fill="#EAF7F5"/>
    <text x="${X0 + 10}" y="${Y0 + 18}" font-size="11.5" font-weight="600" fill="#8B7FD9">KEEP &amp; BUILD</text>
    <text x="${X1 - 10}" y="${Y1 - 10}" font-size="11.5" font-weight="600" fill="#3F9C92" text-anchor="end">SELL &amp; EXIT</text>
    <line x1="${X0}" x2="${X1}" y1="${Y1}" y2="${Y1}" stroke="#B1B9CF"/>
    <line x1="${X0}" x2="${X0}" y1="${Y0}" y2="${Y1}" stroke="#B1B9CF"/>
    <line x1="${(X0 + X1) / 2}" x2="${(X0 + X1) / 2}" y1="${Y0}" y2="${Y1}" stroke="#DFE5EE" stroke-dasharray="4 4"/>
    <line x1="${X0}" x2="${X1}" y1="${(Y0 + Y1) / 2}" y2="${(Y0 + Y1) / 2}" stroke="#DFE5EE" stroke-dasharray="4 4"/>
    <text x="${X1}" y="${Y1 + 20}" font-size="12" fill="${C.muted}" text-anchor="end">Immediate liquidity →</text>
    <text x="${X0}" y="${Y1 + 20}" font-size="12" fill="${C.muted}">Low</text>
    <text transform="translate(${X0 - 14} ${Y0}) rotate(-90)" font-size="12" fill="${C.muted}" text-anchor="end">Legacy &amp; control →</text>`;
  P.forEach((pw, i) => {
    const x = px(pw.liq), y = py(pw.ctrl), r = pw.fit * 0.36;
    const right = x < X1 - 120;
    svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${PATH_COLORS[i]}" fill-opacity=".18" stroke="${PATH_COLORS[i]}" stroke-width="2" data-tip="${tip(pw)}"/>`;
    svg += `<text x="${x}" y="${y + 5}" font-size="14" font-weight="700" fill="${C.ink}" text-anchor="middle" pointer-events="none">${pw.fit}</text>`;
    svg += `<text x="${right ? x + r + 8 : x - r - 8}" y="${y + 4}" font-size="12.5" font-weight="600" fill="${C.ink}" text-anchor="${right ? 'start' : 'end'}" pointer-events="none">${pw.short}</text>`;
  });
  svg += `</svg>`;

  const level = (v) => (v < 0.4 ? 1 : v < 0.7 ? 2 : 3);
  const dots = (v, col) => `<span class="ow-dots" aria-label="${['Low', 'Medium', 'High'][level(v) - 1]}">${[1, 2, 3].map((d) => `<i style="background:${d <= level(v) ? col : '#E3E8F1'}"></i>`).join('')}</span>`;
  const matrix = `<div class="ow-pmx">
      <div class="h"><span>Pathway</span><span>Value</span><span>Liquidity</span><span>Control</span></div>
      ${P.map((pw, i) => `<div class="r" data-tip="${tip(pw)}">
        <span class="n"><em style="background:${PATH_COLORS[i]}">0${i + 1}</em>${pw.short}</span>
        <span class="v">${pw.ev}</span>${dots(pw.liq, PATH_COLORS[i])}${dots(pw.ctrl, PATH_COLORS[i])}
      </div>`).join('')}
    </div>`;
  return `<div class="ow-chart">${svg}</div>${matrix}`;
}

// Monochrome line-icon logos for each matched team
function teamLogo(ini) {
  const g = {
    // advisory / M&A: rising chart
    HW: '<path d="M12 31l7-7 5 4 9-10"/><path d="M27 18h6v6"/>',
    // private bank: columns
    PP: '<path d="M11 18l11-6 11 6"/><path d="M14 19v10M19.5 19v10M24.5 19v10M30 19v10"/><path d="M11 32h22"/>',
    // business credit: card
    BC: '<rect x="11" y="14" width="22" height="16" rx="3"/><path d="M11 19.5h22M15 25.5h5"/>',
    // treasury: cash cycle
    TM: '<path d="M31 18a10 10 0 0 0-17.5-2"/><path d="M13 12v4.5h4.5"/><path d="M13 26a10 10 0 0 0 17.5 2"/><path d="M31 32v-4.5h-4.5"/><path d="M22 18.5v7M24.5 20c-.4-.9-1.4-1.3-2.5-1.3-1.4 0-2.4.7-2.4 1.7 0 2.3 4.9 1.1 4.9 3.4 0 1-1 1.7-2.5 1.7-1.2 0-2.2-.5-2.6-1.4"/>',
  };
  return `<svg class="ow-logo" viewBox="0 0 44 44" width="44" height="44" aria-hidden="true"><rect width="44" height="44" rx="12" fill="#111"/><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${g[ini] || ''}</g></svg>`;
}

/* ---------------- Page ---------------- */

pages.owner = () => {
  const p = ownerProfile();
  const v = OWNER.value;
  const s = scenState();
  const r = computeScenario(s);
  const requested = loadJSON(REQ_KEY, null);
  const margin = ((OWNER.ebitda / OWNER.revenue) * 100).toFixed(1);
  const weakest = [...OWNER.dimensions].sort((a, b) => a[1] - b[1])[0];

  return `
  <section class="panel ow-top">
    <div>
      ${eyebrow(`${OWNER.industry} · ${p.owner}`)}
      <h2>${p.business}</h2>
      <div class="ow-chips"><span class="chip blue">Stage: ${OWNER.stage}</span><span class="chip amber">Awaiting advisor review</span><span class="chip gray">Preliminary · illustrative</span></div>
    </div>
    <div class="ow-actions">
      <a class="ow-btn line" href="#/welcome">New profile</a>
      <a class="ow-btn solid" href="#/start/reason">Continue assessment</a>
    </div>
  </section>

  <div class="ow-kpis">
    <div class="ow-kpi"><span class="k">Enterprise value</span><b>${m$(v.mid)}</b><small>${m$(v.low)} – ${m$(v.high)}</small>${rangeMini(v)}</div>
    <div class="ow-kpi gauge"><div><span class="k">Readiness</span><b>${OWNER.readiness}<em>/100</em></b><small>Lowest: ${weakest[1]}</small></div>${gaugeSvg(OWNER.readiness)}</div>
    <div class="ow-kpi"><span class="k">Revenue</span><b>$${OWNER.revenue}M</b><small>EBITDA $${OWNER.ebitda}M · ${margin}%</small></div>
    <div class="ow-kpi"><span class="k">Investable proceeds</span><b class="teal" data-live="invest">${m$(r.invest)}</b><small>Working scenario</small></div>
    <div class="ow-kpi"><span class="k">Timeline</span><b>${OWNER.timeline}</b><small>Debt $${OWNER.debt}M</small></div>
  </div>

  <div class="grid ow-r1">
    ${card('Valuation range', 'Enterprise value by scenario', `<div class="ow-chart" id="owField">${footballField(r.ev)}</div>`,
      `<div class="ow-head-r"><span class="ow-badge orange">Low confidence</span>${info('EV = EBITDA ($5.6M) × illustrative 4.3–5.3x multiple. Shaded area is the 4–6x demo band, not an approved PNC benchmark. Not a certified valuation.')}</div>`)}
    ${card('Transition readiness', 'Across seven dimensions', `<div class="ow-chart">${radar()}</div>`,
      `<div class="ow-score">${OWNER.readiness}<small>/100</small></div>`)}
  </div>

  <div class="grid ow-r2">
    ${card('Post-transition proceeds', 'Scenario editor', `
      <div class="ow-controls">
        ${slider('multiple', 'Multiple', s.multiple, 4, 6, 0.1, 'x')}
        ${slider('expenses', 'Fees', s.expenses, 0, 10, 0.5, '%')}
        ${slider('tax', 'Tax rate', s.tax, 0, 45, 1, '%')}
        ${slider('rollover', 'Rollover', s.rollover, 0, 50, 1, '%')}
        <div class="ow-sl"><div class="l"><span>Family payout</span></div>
          <div class="ow-money"><span>$</span><input class="input" type="text" inputmode="numeric" data-k="family" value="${Number(s.family).toLocaleString('en-US')}"></div></div>
      </div>
      <div class="ow-chart" id="owWater">${waterfall(r)}</div>`,
      `<div class="ow-head-r"><button class="ow-link" data-reset>Reset</button>${info('Tax applies only to the cash portion of the owner share (after debt, fees and rollover), treated as fully taxable gain. Rollover is assumed tax-deferred. Consult tax professionals.')}</div>`)}
    ${card('Possible pathways', 'Options, not a verdict', pathwaysPanel(), info('Fit scores are relative demo indicators computed from profile fields. Hover a pathway for the reasoning.'))}
  </div>

  <div class="grid ow-r3">
    ${card('Scenario comparison', 'Where the value goes', `<div id="owCmp">${comparisonBars(r, s)}</div>`,
      `<div class="ow-head-r"><button class="ow-link" data-tableview>Table view</button>${info('Rollover equity is retained ownership, not cash; its future value is uncertain.')}</div>`)}
    ${card('PNC teams that may help', 'Potential matches', `
      <div class="ow-teams2">
        ${[...OWNER.teams].sort((a, b) => b[3] - a[3]).map(([ini, n, fit, score, d]) => `
          <div class="ow-tm" data-tip="${d}">${teamLogo(ini)}
            <div class="nm"><b>${n}</b><small>${fit}</small></div>
            <div class="sc"><b>${score}</b><span><i style="width:${score}%"></i></span></div></div>`).join('')}
      </div>`, `<div class="ow-head-r"><span class="ow-hint">Match score</span>${info('Match scores are relative demo indicators computed from profile fields (EBITDA, owner share, debt, revenue). A match is not a referral or acceptance; advisors and specialist teams make engagement decisions.')}</div>`)}
  </div>

  <div class="grid ow-r4">
    <section class="ow-next">
      ${eyebrow('Recommended next step')}
      <h3>Confirm successor interest</h3>
      <p>Family and management paths need a willing successor.</p>
      <div class="btns">
        <button class="ow-btn white" data-request ${requested ? 'disabled' : ''}>${requested ? 'Meeting requested' : 'Meet with Priya'}</button>
        <a class="ow-btn glass" href="#/plans">View journey</a>
      </div>
    </section>
    ${card('Verification', 'Advisor review', `
      <div class="ow-rings">
        ${ring(2, 7, C.blue, 'Tasks done')}${ring(1, 7, C.teal, 'Docs verified')}
      </div>
      <div class="ow-steps">${['Assess', 'Prepare', 'Select', 'Execute', 'Post'].map((st, i) => `<span class="${i === 0 ? 'on' : ''}">${st}</span>`).join('')}</div>`,
      info('Findings are self-reported. Later stages open after advisor verification.'))}
    ${card('Information gaps', 'Still unknown', `
      <div class="ow-gaps2">
        ${OWNER.gaps.map(([t, d, c]) => `<div class="g" data-tip="${d}"><i class="${c}"></i>${t}</div>`).join('')}
      </div>`, `<span class="ow-badge red">${OWNER.gaps.length} open</span>`)}
  </div>`;
};

function ring(n, total, col, label) {
  const r = 26, c = 2 * Math.PI * r;
  return `<div class="ow-ring"><svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="${C.grid}" stroke-width="7"/>
      <circle cx="32" cy="32" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * n) / total} ${c}" transform="rotate(-90 32 32)"/>
      <text x="32" y="37" text-anchor="middle" font-size="14" font-weight="700" fill="${C.ink}">${n}/${total}</text>
    </svg><span>${label}</span></div>`;
}

function slider(k, label, val, min, max, step, unit) {
  const fmt = unit === 'x' ? Number(val).toFixed(1) + 'x' : val + '%';
  return `<div class="ow-sl">
    <div class="l"><span>${label}</span><b data-out="${k}">${fmt}</b></div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${k}" data-unit="${unit}" style="--p:${((val - min) / (max - min)) * 100}%" aria-label="${label}">
  </div>`;
}

/* ---------------- Behaviour ---------------- */

let tipEl;
function bindTooltips() {
  if (tipEl) return;
  tipEl = document.createElement('div');
  tipEl.className = 'ow-tip';
  document.body.appendChild(tipEl);
  document.addEventListener('mousemove', (e) => {
    const t = e.target.closest?.('[data-tip]');
    if (!t || !document.getElementById('content').contains(t)) { tipEl.style.opacity = 0; return; }
    tipEl.textContent = t.getAttribute('data-tip');
    tipEl.style.opacity = 1;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = e.clientX + 14, y = e.clientY - h - 12;
    if (x + w > innerWidth - 8) x = e.clientX - w - 14;
    if (y < 8) y = e.clientY + 18;
    tipEl.style.transform = `translate(${x}px, ${y}px)`;
  });
}

pages.owner.mount = () => {
  bindTooltips();
  const root = document.getElementById('content');
  const s = scenState();

  const redraw = () => {
    const r = computeScenario(s);
    root.querySelector('#owWater').innerHTML = waterfall(r);
    root.querySelector('#owField').innerHTML = footballField(r.ev);
    const tableShown = !root.querySelector('#owCmp .ow-table')?.hidden;
    root.querySelector('#owCmp').innerHTML = comparisonBars(r, s);
    if (tableShown) toggleTable(true);
    root.querySelector('[data-live="invest"]').textContent = m$(r.invest);
  };
  const toggleTable = (show) => {
    const t = root.querySelector('#owCmp .ow-table');
    t.hidden = !show;
    root.querySelector('#owCmp .ow-stack').hidden = show;
    root.querySelector('#owCmp .ow-legend').hidden = show;
    root.querySelector('[data-tableview]').textContent = show ? 'Chart view' : 'Table view';
  };

  root.querySelectorAll('[data-k]').forEach((el) => {
    el.addEventListener('input', () => {
      const k = el.dataset.k;
      if (k === 'family') s.family = Number(el.value.replace(/[^0-9]/g, '')) || 0;
      else {
        s[k] = Number(el.value);
        root.querySelector(`[data-out="${k}"]`).textContent = el.dataset.unit === 'x' ? s[k].toFixed(1) + 'x' : s[k] + '%';
        el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
      }
      saveJSON(SCEN_KEY, s);
      redraw();
    });
  });
  root.querySelector('[data-k="family"]').addEventListener('blur', (e) => { e.target.value = Number(s.family).toLocaleString('en-US'); });
  root.querySelector('[data-reset]').addEventListener('click', () => {
    saveJSON(SCEN_KEY, SCEN_DEFAULT);
    root.innerHTML = pages.owner();
    pages.owner.mount();
  });
  root.querySelector('[data-tableview]').addEventListener('click', () => toggleTable(root.querySelector('#owCmp .ow-table').hidden));
  const req = root.querySelector('[data-request]');
  req?.addEventListener('click', () => {
    saveJSON(REQ_KEY, { with: 'Priya', topic: 'Successor interest', at: new Date().toISOString() });
    req.textContent = 'Meeting requested';
    req.disabled = true;
  });
};

// app.js renders before this file loads; re-render if the owner page was requested.
if (/^#\/owner|^#?\/?$/.test(location.hash)) render();
