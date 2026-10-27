// PNC NEXUS — Transition Navigator
// Single-page app built from ProBank_Transition_Navigator_UI.pdf

const DASH_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='2' y='2' width='9' height='11' rx='2.5'/%3E%3Crect x='13' y='2' width='9' height='7' rx='2.5'/%3E%3Crect x='13' y='11' width='9' height='11' rx='2.5'/%3E%3Crect x='2' y='15' width='9' height='7' rx='2.5'/%3E%3C/svg%3E";

const NAV = [
  { id: 'owner', label: 'Dashboard', title: 'Owner Dashboard', icon: DASH_ICON },
  { id: 'overview', label: 'Overview', title: 'Transition' },
  { id: 'clients', label: 'Clients', title: 'Clients' },
  { id: 'cases', label: 'Cases', title: 'Cases' },
  { id: 'readiness', label: 'Readiness', title: 'Readiness' },
  { id: 'referrals', label: 'Referrals', title: 'Referrals' },
  { id: 'plans', label: 'Plans', title: 'Plans' },
  { id: 'myteam', label: 'My team', title: 'My team' },
  { id: 'documents', label: 'Documents', title: 'Documents' },
  { id: 'profile', label: 'Profile', title: 'Profile' },
];

const ic = (name) => `assets/icons/${name}.png`;

/* ---------------- SVG helpers ---------------- */

// Catmull-Rom spline through points -> smooth cubic bezier path
function smoothPath(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function sector(cx, cy, r, a0, a1, color, r0 = 0) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  if (!r0) {
    return `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z" fill="${color}"/>`;
  }
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  return `<path d="M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z" fill="${color}"/>`;
}

const bar = (x, y, w, h, color, rx) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}"/>`;

/* ---------------- Charts ---------------- */

function weeklyActionsChart() {
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const agreed = [48, 35, 33, 48, 15, 39, 40];
  const finished = [24, 13, 26, 37, 24, 24, 34];
  const y0 = 261, perUnit = 185 / 50;
  let s = `<svg viewBox="0 0 730 322" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  s += `<circle cx="509" cy="36" r="7.5" fill="#16DBCC"/><text x="527" y="41" font-size="15" fill="#718EBF">Agreed</text>`;
  s += `<circle cx="615" cy="36" r="7.5" fill="#FF82AC"/><text x="633" y="41" font-size="15" fill="#718EBF">Finished</text>`;
  for (let v = 0; v <= 50; v += 10) {
    const y = y0 - v * perUnit;
    s += `<line x1="75" x2="700" y1="${y}" y2="${y}" stroke="#F3F3F5" stroke-width="1"/>`;
    s += `<text x="58" y="${y + 4}" font-size="12" fill="#718EBF" text-anchor="end">${v}</text>`;
  }
  days.forEach((d, i) => {
    const bx = 101 + i * 90;
    const ha = agreed[i] * perUnit, hf = finished[i] * perUnit;
    s += bar(bx - 7, y0 - ha, 14, ha, '#1814F3', 7);
    s += bar(bx + 21, y0 - hf, 14, hf, '#16DBCC', 7);
    s += `<text x="${bx + 14}" y="291" font-size="12" fill="#718EBF" text-anchor="middle">${d}</text>`;
  });
  return s + `</svg>`;
}

function transitionPathsPie() {
  // Exploded pie, angles & radii measured from the design
  const T = (x, y) => [(x - 875) * 1.2, (y - 397) * 1.2];
  const slices = [
    { tip: T(1005, 528), a0: -135, a1: -48, r: 110 * 1.2, c: '#343C6A' },
    { tip: T(1013, 531), a0: -47, a1: 0, r: 120 * 1.2, c: '#FC7900' },
    { tip: T(1006, 539), a0: 0, a1: 90, r: 100 * 1.2, c: '#1814F3' },
    { tip: T(999, 533), a0: 90, a1: 224, r: 97 * 1.2, c: '#FA00FF' },
  ];
  const labels = [
    { p: T(1003, 458), a: '30%', b: 'Family' },
    { p: T(1076, 500), a: '15%', b: 'Sale' },
    { p: T(954, 541), a: '20%', b: 'Mgmt' },
    { p: T(1057, 566), a: '35%', b: 'Other' },
  ];
  let s = `<svg viewBox="0 0 350 322" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  slices.forEach((sl) => (s += sector(sl.tip[0], sl.tip[1], sl.r, sl.a0, sl.a1, sl.c)));
  labels.forEach((l) => {
    s += `<text x="${l.p[0]}" y="${l.p[1]}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${l.a}</text>`;
    s += `<text x="${l.p[0]}" y="${l.p[1] + 18}" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${l.b}</text>`;
  });
  return s + `</svg>`;
}

function caseActivityArea() {
  const T = ([x, y]) => [(x - 638) * 1.2, (y - 724) * 1.2];
  const pts = [
    [690, 885], [700, 866], [718, 847], [735, 845], [752, 855], [770, 860], [785, 845],
    [800, 815], [815, 812], [832, 822], [848, 812], [862, 772], [880, 756], [896, 766],
    [912, 812], [930, 860], [947, 862], [965, 825], [985, 798], [1002, 796], [1018, 812],
    [1038, 855], [1058, 860], [1078, 830], [1095, 790], [1115, 782], [1132, 785], [1145, 792],
  ].map(T);
  const months = [['Jul', 697], ['Aug', 757], ['Sep', 830], ['Oct', 895], ['Nov', 961], ['Dec', 1026], ['Jan', 1091]];
  const yTop = 35, yBot = 220, x0 = 62, x1 = 608;
  let s = `<svg viewBox="0 0 635 276" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <defs><linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#2D60FF" stop-opacity=".25"/><stop offset="1" stop-color="#2D60FF" stop-opacity="0"/>
    </linearGradient></defs>`;
  [0, 20, 40, 60, 80].forEach((v) => {
    const y = yBot - (v / 80) * (yBot - yTop);
    s += `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#DFE5EE" stroke-dasharray="4 4"/>`;
    s += `<text x="${x0 - 22}" y="${y + 4}" font-size="13" fill="#718EBF" text-anchor="end">${v}</text>`;
    s += `<line x1="${x0 - 15}" x2="${x0 - 9}" y1="${y}" y2="${y}" stroke="#718EBF"/>`;
  });
  months.forEach(([m, x]) => {
    const rx = (x - 638) * 1.2;
    s += `<line x1="${rx}" x2="${rx}" y1="${yTop - 10}" y2="${yBot}" stroke="#DFE5EE" stroke-dasharray="4 4"/>`;
    s += `<text x="${rx}" y="244" font-size="13" fill="#718EBF" text-anchor="middle">${m}</text>`;
  });
  s += `<line x1="${x0 - 8}" x2="${x0 - 8}" y1="${yTop - 10}" y2="${yBot}" stroke="#718EBF"/>`;
  s += `<line x1="${x0 - 8}" x2="${x1}" y1="${yBot}" y2="${yBot}" stroke="#718EBF"/>`;
  const line = smoothPath(pts);
  s += `<path d="${line} L${pts[pts.length - 1][0]},${yBot} L${pts[0][0]},${yBot} Z" fill="url(#areaG)"/>`;
  s += `<path d="${line}" fill="none" stroke="#1814F3" stroke-width="3" stroke-linecap="round"/>`;
  return s + `</svg>`;
}

function clientsMiniBars() {
  const bars = [
    ['Aug', 1075, 254], ['Sep', 1128, 205], ['Oct', 1180, 251],
    ['Nov', 1231, 298], ['Dec', 1283, 218], ['Jan', 1335, 259],
  ];
  let s = `<svg viewBox="0 0 350 225" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  bars.forEach(([m, x, top]) => {
    const rx = x - 1050, ry = top - 172, h = 347 - top;
    s += bar(rx, ry, 37, h, m === 'Dec' ? '#16DBCC' : '#EDF0F7', 10);
    s += `<text x="${rx + 18.5}" y="197" font-size="13" fill="#718EBF" text-anchor="middle">${m}</text>`;
  });
  s += `<text x="${1301 - 1050}" y="36" font-size="13" font-weight="600" fill="#343C6A" text-anchor="middle">24 cases</text>`;
  return s + `</svg>`;
}

function actionPlanBars() {
  const data = [
    ['Sat', 800, 701], ['Sun', 829, 749], ['Mon', 833, 796], ['Tue', 723, 812],
    ['Wed', 785, 721], ['Thu', 777, 830], ['Fri', 756, 719],
  ];
  let s = `<svg viewBox="0 0 730 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  const oy = 680; // page y of svg top
  data.forEach(([d, b, o], i) => {
    const x = 30 + i * 100;
    s += bar(x, b - oy, 30, 935 - b, '#1814F3', 10);
    s += bar(x + 40, o - oy, 30, 935 - o, '#FCAA0B', 10);
    s += `<text x="${x + 35}" y="${956 - oy + 4}" font-size="13" fill="#718EBF" text-anchor="middle">${d}</text>`;
  });
  return s + `</svg>`;
}

function readinessLine() {
  const T = ([x, y]) => [x - 290, y - 322];
  const pts = [[399, 524], [475, 438], [546, 475], [622, 375], [696, 451], [773, 411]].map(T);
  let s = `<svg viewBox="0 0 540 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  [['40%', 362], ['30%', 410], ['20%', 458], ['10%', 506]].forEach(([l, y]) => {
    s += `<line x1="90" x2="510" y1="${y - 322}" y2="${y - 322}" stroke="#DFE5EE" stroke-dasharray="4 4"/>`;
    s += `<text x="81" y="${y - 322 - 2}" font-size="12" fill="#718EBF" text-anchor="end">${l}</text>`;
  });
  s += `<line x1="90" x2="510" y1="230" y2="230" stroke="#DFE5EE" stroke-dasharray="4 4"/>`;
  s += `<text x="81" y="230" font-size="12" fill="#718EBF" text-anchor="end">0</text>`;
  s += `<text x="80" y="246" font-size="12" fill="#718EBF" text-anchor="end">%</text>`;
  [['May', 400], ['Jun', 474], ['Jul', 547], ['Aug', 621], ['Sep', 695], ['Oct', 770]].forEach(([m, x]) => {
    s += `<text x="${x - 290}" y="250" font-size="12" fill="#718EBF" text-anchor="middle">${m}</text>`;
  });
  s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#FCAA0B" stroke-width="2.5" stroke-linejoin="round"/>`;
  pts.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="4.5" fill="#fff" stroke="#FCAA0B" stroke-width="2.5"/>`));
  return s + `</svg>`;
}

function readinessActivity() {
  const T = ([x, y]) => [x - 860, y - 322];
  const pts = [
    [953, 498], [968, 488], [985, 485], [1000, 466], [1018, 455], [1034, 468], [1050, 491],
    [1065, 494], [1080, 466], [1092, 428], [1106, 419], [1122, 407], [1136, 398], [1152, 398],
    [1166, 420], [1181, 449], [1196, 453], [1211, 440], [1226, 420], [1241, 415], [1256, 423],
    [1272, 434], [1291, 438], [1306, 456], [1320, 477], [1335, 475], [1350, 440], [1362, 396], [1369, 388],
  ].map(T);
  let s = `<svg viewBox="0 0 540 282" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">`;
  [['40%', 362], ['30%', 410], ['20%', 458], ['10%', 506], ['0%', 552]].forEach(([l, y]) => {
    s += `<line x1="90" x2="510" y1="${y - 322}" y2="${y - 322}" stroke="#DFE5EE" stroke-dasharray="4 4"/>`;
    s += `<text x="82" y="${y - 322 - 2}" font-size="12" fill="#718EBF" text-anchor="end">${l}</text>`;
  });
  [['May', 970], ['Jun', 1045], ['Jul', 1119], ['Aug', 1194], ['Sep', 1270], ['Oct', 1346]].forEach(([m, x]) => {
    s += `<text x="${x - 860}" y="250" font-size="12" fill="#718EBF" text-anchor="middle">${m}</text>`;
  });
  s += `<path d="${smoothPath(pts)}" fill="none" stroke="#16DBCC" stroke-width="3" stroke-linecap="round"/>`;
  return s + `</svg>`;
}

function expertiseDonut() {
  const cx = 103, cy = 105; // within a 206x206 svg
  const parts = [
    { a0: -90, a1: 0, r: 100, c: '#16DBCC', d: '#13B8AB' },
    { a0: 0, a1: 90, r: 72, c: '#FF82AC', d: '#E46A93' },
    { a0: 90, a1: 180, r: 80, c: '#FFBB38', d: '#F2A21E' },
    { a0: 180, a1: 270, r: 88, c: '#4C78FF', d: '#345FE6' },
  ];
  let s = `<svg viewBox="0 0 206 210" width="206" height="210">
    <defs><filter id="dsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".08"/></filter></defs><g filter="url(#dsh)">`;
  parts.forEach((p) => (s += sector(cx, cy, p.r, p.a0, p.a1, p.c, 48)));
  parts.forEach((p) => (s += sector(cx, cy, 48, p.a0, p.a1, p.d, 34)));
  s += `</g><circle cx="${cx}" cy="${cy}" r="34" fill="#fff"/>`;
  return s + `</svg>`;
}

/* ---------------- Components ---------------- */

const CASES = {
  whitmore: {
    badge: 'Readiness', tn: 'TN-014', title: 'Whitmore Manufacturing',
    l1: 'Eleanor Whitmore · Family transfer', l2: 'Horizon: within 2 years',
    l4: 'Discuss successor role', l5: 'Oct 29 · Alex Morgan',
  },
  oak: {
    badge: 'Discovery', tn: 'TN-015', title: 'Oak &amp; Field Foods',
    l1: 'Marcus Reed · Retain ownership', l2: 'Horizon: 3–5 years',
    l4: 'Confirm owner priorities', l5: 'Oct 30 · Marcus Reed',
  },
  harbor: {
    badge: 'Specialist', tn: 'TN-016', title: 'Harbor Logistics',
    l1: 'Priya Shah · Strategic sale', l2: 'Horizon: 12–18 months',
    l4: 'Review referral scope', l5: 'Nov 2 · Alex Morgan',
  },
};

function caseCard(c, variant = '') {
  return `<div class="case-card ${variant}">
    <div class="cc-top"><span class="badge">${c.badge}</span><span class="tn">${c.tn}</span></div>
    <h3>${c.title}</h3>
    <div class="l1">${c.l1}</div>
    <div class="l2">${c.l2}</div>
    <hr>
    <div class="l3">Next agreed action</div>
    <div class="l4">${c.l4}</div>
    <div class="l5">${c.l5}</div>
  </div>`;
}

const sectionHead = (title, link = '') =>
  `<div class="section-head"><h2 class="section-title">${title}</h2>${link ? `<a href="#" class="section-link">${link}</a>` : ''}</div>`;

const stat = (icon, label, value, cls = '') =>
  `<div class="stat ${cls}"><img class="tile r" src="${ic(icon)}" alt=""><div><div class="s-label">${label}</div><div class="s-value">${value}</div></div></div>`;

const sendIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 2 11 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const chevronDown = `<svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="m1 1 6 6 6-6" stroke="#718EBF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------------- Pages ---------------- */

const pages = {};

pages.overview = () => `
  <div class="grid ov-row1">
    <section>
      ${sectionHead('My cases', 'See All')}
      <div class="cards-row ov-cards">${caseCard(CASES.whitmore)}${caseCard(CASES.oak, 'white')}</div>
    </section>
    <section>
      ${sectionHead('Recent Updates')}
      <div class="panel updates">
        ${[
          ['ov-upd0', 'Continuity plan shared', '26 October 2026', 'Review', 'c-red'],
          ['ov-upd1', 'Referral review', '25 October 2026', 'Draft', 'c-green'],
          ['ov-upd2', 'Goals agreed', '22 October 2026', 'Agreed', 'c-green'],
        ].map(([i, t, d, s, c]) => `
          <div class="upd"><img class="tile r" src="${ic(i)}" alt="">
            <div><div class="u-t">${t}</div><div class="u-d">${d}</div></div>
            <div class="u-s ${c}">${s}</div></div>`).join('')}
      </div>
    </section>
  </div>
  <div class="grid ov-row2" style="margin-top:24px">
    <section>${sectionHead('Weekly Actions')}<div class="panel chart-panel" style="padding:0">${weeklyActionsChart()}</div></section>
    <section>${sectionHead('Transition Paths')}<div class="panel pie-panel">${transitionPathsPie()}</div></section>
  </div>
  <div class="grid ov-row3" style="margin-top:24px">
    <section>
      ${sectionHead('Advisory Team')}
      <div class="panel team-panel">
        <div class="team-people">
          <div class="person"><img src="assets/img/morgan.png" alt=""><div class="p-n">A. Morgan</div><div class="p-r">RM</div></div>
          <div class="person"><img src="assets/img/patel.png" alt=""><div class="p-n">M. Patel</div><div class="p-r">Specialist</div></div>
          <div class="person"><img src="assets/img/lee.png" alt=""><div class="p-n">J. Lee</div><div class="p-r">Wealth</div></div>
          <button class="arrow-btn" aria-label="Next"><svg width="9" height="15" viewBox="0 0 9 15" fill="none"><path d="m1.5 1.5 6 6-6 6" stroke="#718EBF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div class="caseref">
          <span class="lbl">Case reference</span>
          <div class="pill"><input value="TN-014"><button>View ${sendIcon}</button></div>
        </div>
      </div>
    </section>
    <section>${sectionHead('Case Activity')}<div class="panel area-panel" style="padding:0">${caseActivityArea()}</div></section>
  </div>`;

pages.clients = () => {
  const rows = [
    ['up', 'Whitmore Mfg.', 'TN-014', 'Family', '29 Oct, 10:00 AM', 'Review', 'c-red'],
    ['down', 'Oak &amp; Field', 'TN-015', 'Sale', '30 Oct, 11:00 AM', 'Plan', 'c-green'],
    ['up', 'Harbor Logistics', 'TN-016', 'Review', '02 Nov, 10:00 AM', 'Draft', 'c-red'],
    ['up', 'Cedar', 'TN-017', 'Sale', '05 Nov, 03:00 PM', 'Agreed', 'c-red'],
    ['down', 'Nova', 'TN-018', 'Sale', '06 Nov, 10:00 AM', 'Review', 'c-green'],
  ];
  const arrow = (dir) => `<span class="circ"><svg width="12" height="14" viewBox="0 0 12 14" fill="none" ${dir === 'down' ? 'style="transform:rotate(180deg)"' : ''}><path d="M6 13V1M1 6l5-5 5 5" stroke="#718EBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  return `
  <div class="grid cl-row1">
    <section class="cl-cards">
      <div class="section-head"><h2 class="section-title">My cases</h2><a href="#" class="section-link">+ Add Case</a></div>
      <div class="cards-row">${caseCard(CASES.whitmore)}${caseCard(CASES.oak, 'white')}</div>
    </section>
    <section>${sectionHead('Case Activity')}<div class="panel mini-bars" style="padding:0">${clientsMiniBars()}</div></section>
  </div>
  <section style="margin-top:24px">
    ${sectionHead('Client Transitions')}
    <div class="tabs cl-tabs" data-tabs>
      <a href="#" class="active">All Clients</a><a href="#">Active</a><a href="#">Pending</a>
    </div>
    <div class="panel cl-table table-scroll">
      <table>
        <thead><tr><th style="width:21%">Business</th><th style="width:14%">Case ID</th><th style="width:11.5%">Path</th><th style="width:12.5%">RM</th><th style="width:18.5%">Review</th><th style="width:10%">Stage</th><th>Details</th></tr></thead>
        <tbody>${rows.map(([d, b, id, p, r, st, c]) => `
          <tr><td><div class="cl-biz">${arrow(d)}${b}</div></td><td>${id}</td><td>${p}</td><td>A. Morgan</td><td>${r}</td><td class="${c}">${st}</td><td><button class="btn-case">View case</button></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pager">
      <a href="#" class="pp"><svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M6.5 1.5l-5 5 5 5" stroke="#1814F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Previous</a>
      <a href="#" class="num active">1</a><a href="#" class="num">2</a><a href="#" class="num">3</a><a href="#" class="num">4</a>
      <a href="#" class="nn">Next<svg width="8" height="13" viewBox="0 0 8 13" fill="none"><path d="M1.5 1.5l5 5-5 5" stroke="#1814F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    </div>
  </section>`;
};

pages.cases = () => `
  <div class="grid stats4">
    ${stat('cases-stat0', 'Active cases', '12')}
    ${stat('cases-stat1', 'Active', '4')}
    ${stat('cases-stat2', 'Pending', '2')}
    ${stat('cases-stat3', 'Completed', '5')}
  </div>
  <div class="grid cs-row" style="margin-top:24px">
    <section>
      ${sectionHead('Recent Actions')}
      <div class="panel ra-panel">
        ${[
          ['cases-act0', 'Whitmore Mfg.', 'Family', 'Pending', 'Draft', 'c-red'],
          ['cases-act1', 'Harbor Logistics', 'Review', 'Completed', 'Agreed', 'c-red'],
          ['cases-act2', 'Owner goals', 'Sale', 'Completed', 'Done', 'c-green'],
        ].map(([i, t, p, s, st, c]) => `
          <div class="ra"><img class="tile" src="${ic(i)}" alt="">
            <div><div class="t">${t}</div><div class="d">26 Oct 2026</div></div>
            <div class="m">${p}</div><div class="m">A. Morgan</div><div class="m">${s}</div>
            <div class="s ${c}">${st}</div></div>`).join('')}
      </div>
    </section>
    <section>
      ${sectionHead('My case', 'See All')}
      ${caseCard(CASES.whitmore, 'light')}
    </section>
  </div>
  <div class="grid cs-row" style="margin-top:24px">
    <section>
      ${sectionHead('Action Plan Overview')}
      <div class="panel ap-panel">
        <div class="ap-head"><span>7 actions agreed &amp; 5 completed this week</span>
          <div class="legend"><span><i style="background:#396AFF"></i>Agreed</span><span><i style="background:#FF82AC"></i>Done</span></div>
        </div>
        <div style="height:285px;margin:12px -30px 0">${actionPlanBars()}</div>
      </div>
    </section>
    <section>
      ${sectionHead('File Requests')}
      <div class="panel fr-panel">
        ${[
          ['cases-file0', 'Owner goals', '5h ago', 'Open'],
          ['cases-file1', 'Alex', '2 days ago', 'Review'],
          ['cases-file2', 'Continuity', '5 days ago', 'Draft'],
          ['cases-file3', 'Eleanor', '10 days ago', 'Done'],
        ].map(([i, t, d, s]) => `
          <div class="fr"><img class="tile" src="${ic(i)}" alt="">
            <div><div class="t">${t}</div><div class="d">${d}</div></div><div class="s">${s}</div></div>`).join('')}
      </div>
    </section>
  </div>`;

pages.readiness = () => `
  <div class="grid stats3">
    ${stat('ready-stat0', 'Assessment Items', '24')}
    ${stat('ready-stat1', 'Reviewed Items', '16')}
    ${stat('ready-stat2', 'Completion', '67%', 'stat-c')}
  </div>
  <div class="grid rd-row1" style="margin-top:24px">
    <section>${sectionHead('Assessment Progress')}<div class="panel line-panel" style="padding:0">${readinessLine()}</div></section>
    <section>${sectionHead('Readiness Activity')}<div class="panel line-panel" style="padding:0">${readinessActivity()}</div></section>
  </div>
  <div class="grid rd-row2" style="margin-top:24px">
    <section>
      ${sectionHead('Review Items')}
      ${[
        ['ready-item0', 'Owner goals', 'Goals &amp; personal readiness', '4 of 6', '67%', 'c-green'],
        ['ready-item1', 'Successor role', 'Goals &amp; personal readiness', '1 of 4', '25%', 'c-red'],
        ['ready-item2', 'Continuity plan', 'Continuity', '2 of 4', '50%', 'c-green'],
      ].map(([i, t, d, n, p, c]) => `
        <div class="ri"><img class="tile" src="${ic(i)}" alt="">
          <div><div class="t">${t}</div><div class="d">${d}</div></div>
          <div><div class="t">${n}</div><div class="d">Items reviewed</div></div>
          <div><div class="t ${c}">${p}</div><div class="d">Completion</div></div></div>`).join('')}
    </section>
    <section>
      ${sectionHead('Open Questions')}
      <div class="panel oq-panel">
        <table>
          <thead><tr><th style="width:25%">No.</th><th style="width:30%">Topic</th><th style="width:24%">Items</th><th>Done</th></tr></thead>
          <tbody>${[
            ['01.', 'Goals', 6, '4/6', 'c-green'], ['02.', 'Family', 4, '1/4', 'c-green'],
            ['03.', 'Finance', 5, '3/5', 'c-red'], ['04.', 'People', 4, '2/4', 'c-green'],
            ['05.', 'Wealth', 3, '1/3', 'c-red'],
          ].map(([n, t, i, d, c]) => `<tr><td>${n}</td><td>${t}</td><td>${i}</td><td class="${c}">${d}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>
  </div>`;

pages.referrals = () => `
  <section>
    ${sectionHead('My cases')}
    <div class="grid rf-row1 cards-row">${caseCard(CASES.whitmore, 'light')}${caseCard(CASES.oak)}${caseCard(CASES.harbor, 'white')}</div>
  </section>
  <div class="grid rf-row2" style="margin-top:24px">
    <section>
      ${sectionHead('Referrals by Expertise')}
      <div class="panel exp-panel">
        ${expertiseDonut()}
        <div class="exp-legend">
          <span><i style="background:#4C78FF"></i>Transition</span><span><i style="background:#FF82AC"></i>Legal</span>
          <span><i style="background:#16DBCC"></i>Wealth</span><span><i style="background:#FFBB38"></i>Tax</span>
        </div>
      </div>
    </section>
    <section>
      ${sectionHead('Referral List')}
      ${[
        ['ref-list0', 'Transition', 'TN-014', 'Alex'],
        ['ref-list1', 'Legal', 'TN-015', 'Maya'],
        ['ref-list2', 'Wealth', 'TN-016', 'Jordan'],
      ].map(([i, team, tn, co]) => `
        <div class="rl"><img class="tile" src="${ic(i)}" alt="">
          <div><div class="t">Scope</div><div class="d">Exploratory</div></div>
          <div><div class="t">Team</div><div class="d">${team}</div></div>
          <div><div class="t">Case reference</div><div class="d">${tn}</div></div>
          <div><div class="t">Coordinator</div><div class="d">${co}</div></div>
          <a href="#" class="vd">View Details</a></div>`).join('')}
    </section>
  </div>
  <div class="grid rf-row3" style="margin-top:24px">
    <section>
      ${sectionHead('New Referral')}
      <form class="panel nr-panel" onsubmit="return false">
        <p>Connect an owner with the right specialist. Confirm the purpose, recipient, and permitted information before sharing. Personal planning records require separate permission. This demonstration uses fictional records.</p>
        <div class="nr-form">
          <div class="field"><label>Expertise</label><input class="input" value="Transition"></div>
          <div class="field"><label>Case owner</label><input class="input" value="E. Whitmore"></div>
          <div class="field"><label>Case reference</label><input class="input" value="TN-014"></div>
          <div class="field"><label>Target meeting</label><div class="select-wrap"><select class="input"><option>05 November 2026</option><option>06 November 2026</option><option>09 November 2026</option></select>${chevronDown}</div></div>
        </div>
        <button class="btn-send">Send request</button>
      </form>
    </section>
    <section>
      ${sectionHead('Referral Tools')}
      <div class="panel rt-panel" style="height:calc(100% - 50px)">
        ${[
          ['ref-tool0', 'Withdraw', 'Record a reason'],
          ['ref-tool1', 'Review scope', 'Confirm what is shared'],
          ['ref-tool2', 'Ask for documents', 'Request approved evidence'],
          ['ref-tool3', 'Schedule meeting', 'Agree a suitable time'],
          ['ref-tool4', 'View history', 'Review referral updates'],
        ].map(([i, t, d]) => `<div class="rt"><img class="tile" src="${ic(i)}" alt=""><div><div class="t">${t}</div><div class="d">${d}</div></div></div>`).join('')}
      </div>
    </section>
  </div>`;

pages.plans = () => `
  <div class="grid stats4">
    ${stat('plans-stat0', 'My Actions', '3')}
    ${stat('plans-stat1', 'Owner Actions', '2')}
    ${stat('plans-stat2', 'Open Actions', '5')}
    ${stat('plans-stat3', 'New Action', 'Assign a person')}
  </div>
  <section style="margin-top:24px">
    ${sectionHead('Shared Action Plan')}
    <div class="panel pl-table table-scroll">
      <table>
        <thead><tr><th style="width:9%">No.</th><th style="width:15%">Action</th><th style="width:16%">Assignee</th><th style="width:15.5%">Due date</th><th style="width:13%">Status</th><th style="width:16%">Visibility</th><th>View</th></tr></thead>
        <tbody>${[
          ['01.', 'Goals', 'Eleanor', '29 Oct', 'Open', 'Owner + team'],
          ['02.', 'Plan', 'Alex', '30 Oct', 'Draft', 'Owner + RM'],
          ['03.', 'Evidence', 'Eleanor', '02 Nov', 'Open', 'Business team'],
          ['04.', 'Agenda', 'Eleanor', '03 Nov', 'Done', 'Owner + team'],
          ['05.', 'Agenda', 'Eleanor', '04 Nov', 'Open', 'Owner + team'],
          ['06.', 'Consent', 'Alex', '05 Nov', 'Open', 'Owner + team'],
          ['07.', 'Referral', 'Maya', '06 Nov', 'Draft', 'Business team'],
          ['08.', 'Review', 'Jordan', '09 Nov', 'Open', 'Owner + team'],
        ].map((r, i) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}<td><button class="btn-outline${i === 0 ? ' first' : ''}">View</button></td></tr>`).join('')}</tbody>
        <tfoot><tr><td>Total</td><td>8 actions</td><td>3 people</td><td></td><td></td><td>Scope reviewed</td><td></td></tr></tfoot>
      </table>
    </div>
  </section>`;

pages.myteam = () => `
  <div class="grid stats3">
    ${[
      ['team-stat0', 'Wealth Advice', 'Personal priorities'],
      ['team-stat1', 'Family', 'Plan. Prepare. Act.'],
      ['team-stat2', 'Privacy', 'Share with care'],
    ].map(([i, t, d]) => `<div class="stat tm-stat"><img class="tile r" src="${ic(i)}" alt=""><div><div class="s-value">${t}</div><div class="s-label">${d}</div></div></div>`).join('')}
  </div>
  <section style="margin-top:24px">
    ${sectionHead('Your Advisory Team')}
    ${[
      ['team-row0', 'Transition advice'], ['team-row1', 'Wealth planning'], ['team-row2', 'Business continuity'],
      ['team-row3', 'Legal &amp; governance'], ['team-row4', 'Wealth Advice'], ['team-row5', 'Transition advice'],
    ].map(([i, t], k) => `
      <div class="tm-row"><img class="tile" src="${ic(i)}" alt="">
        <div><div class="t">${t}</div><div class="d">Succession planning</div></div>
        ${'<div><div class="t">Scope agreed</div><div class="d">Owner approved</div></div>'.repeat(3)}
        <button class="btn-vd${k === 2 ? ' hl' : ''}">View Details</button></div>`).join('')}
  </section>`;

pages.documents = () => `
  <section>
    ${sectionHead('Documents')}
    <div class="panel" style="padding:40px;color:var(--muted);font-size:16px">This screen is not included in the design file.</div>
  </section>`;

pages.profile = (tab = 'edit') => {
  const tabs = `<div class="tabs pf-tabs">
    <a href="#/profile/edit" class="${tab === 'edit' ? 'active' : ''}">Edit Profile</a>
    <a href="#/profile/preferences" class="${tab === 'preferences' ? 'active' : ''}">Preferences</a>
    <a href="#/profile/security" class="${tab === 'security' ? 'active' : ''}">Security</a>
  </div>`;
  const f = (label, value, type = 'text') =>
    `<div class="field"><label>${label}</label><input class="input" type="${type}" value="${value}"></div>`;
  let body = '';
  if (tab === 'edit') {
    body = `<div class="pf-edit">
      <div><img class="pf-photo" src="${ic('profile-photo')}" alt="Alex Morgan"></div>
      <div>
        <div class="pf-grid">
          ${f('Your Name', 'Alex Morgan')}${f('User Name', 'Alex Morgan')}
          ${f('Email', 'alex@example.com', 'email')}${f('Password', '**********', 'password')}
          <div class="field"><label>Joined team</label><div class="select-wrap"><select class="input"><option>20 October 2026</option></select>${chevronDown}</div></div>
          ${f('Office Address', 'Pittsburgh, PA, USA')}
          ${f('Business Address', 'Pittsburgh, PA, USA')}${f('City', 'Pittsburgh')}
          ${f('Postal Code', '15222')}${f('Country', 'USA')}
        </div>
        <div class="pf-actions"><button class="btn-primary">Save</button></div>
      </div>
    </div>`;
  } else if (tab === 'preferences') {
    const tg = (label, on) => `<label class="toggle"><input type="checkbox" ${on ? 'checked' : ''}><span class="track"></span>${label}</label>`;
    body = `<div class="pf-pref" style="margin-top:40px">${f('Currency', 'USD')}${f('Time Zone', '(GMT-04:00) Eastern Time')}</div>
      <div style="margin-top:28px"><div class="pf-h">Notifications</div>
        <div class="toggles">${tg('An owner shares a document', true)}${tg('A specialist responds', false)}${tg('An action is due or a meeting changes', true)}</div>
      </div>
      <div class="pf-actions" style="margin-top:57px"><button class="btn-primary">Save</button></div>`;
  } else {
    body = `<div style="margin-top:38px"><div class="pf-h">Two-factor Authentication</div>
        <div class="toggles" style="margin-top:20px"><label class="toggle"><input type="checkbox" checked><span class="track"></span>Enable or disable two factor authentication</label></div>
      </div>
      <div style="margin-top:28px;max-width:510px"><div class="pf-h">Change Password</div>
        <div style="margin-top:14px">${f('Current Password', '**********', 'password')}</div>
        <div style="margin-top:20px">${f('New Password', '**********', 'password')}</div>
      </div>
      <div class="pf-actions" style="justify-content:space-between;align-items:center">
        <a href="#" onclick="ProBankAuth.signOut();return false" style="color:var(--red);font-weight:500">Sign out</a>
        <button class="btn-primary">Save</button>
      </div>`;
  }
  return `<div class="panel pf-panel">${tabs}${body}</div>`;
};

/* ---------------- Router ---------------- */

const navEl = document.getElementById('nav');
navEl.innerHTML = NAV.map(
  (n) => `<a href="#/${n.id}" data-id="${n.id}"><span class="ico" style="--m:url(&quot;${n.icon || ic('nav-' + n.id)}&quot;)"></span>${n.label}</a>`
).join('');

const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const closeMenu = () => { sidebar.classList.remove('open'); scrim.classList.remove('show'); };
document.getElementById('hamburger').onclick = () => { sidebar.classList.add('open'); scrim.classList.add('show'); };
scrim.onclick = closeMenu;

function render() {
  const [, id = 'owner', sub] = location.hash.replace(/^#/, '').split('/');
  const page = pages[id] ? id : 'owner';
  const meta = NAV.find((n) => n.id === page);
  document.getElementById('pageTitle').textContent = meta.title;
  document.title = `PNC NEXUS · ${meta.title}`;
  navEl.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.id === page));
  document.getElementById('content').innerHTML = pages[page](sub);
  pages[page].mount?.();
  closeMenu();
  window.scrollTo(0, 0);
}

// Simple tab switching for in-page tab bars (e.g. Client Transitions)
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-tabs] a');
  if (a) {
    e.preventDefault();
    a.parentElement.querySelectorAll('a').forEach((x) => x.classList.toggle('active', x === a));
  } else if (e.target.closest('a[href="#"]')) {
    e.preventDefault();
  }
});

// Client / Advisor view switch in the top bar
function syncViewSwitch() {
  const role = window.ProBankAuth?.role() === 'advisor' ? 'advisor' : 'client';
  document.querySelectorAll('.view-switch [data-view]').forEach((b) => {
    const on = b.dataset.view === role;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', String(on));
  });
}
document.querySelector('.view-switch').addEventListener('click', (e) => {
  const b = e.target.closest('[data-view]');
  if (!b) return;
  try { localStorage.setItem('probank.role', JSON.stringify(b.dataset.view)); } catch {}
  syncViewSwitch();
  location.hash = b.dataset.view === 'advisor' ? '#/overview' : '#/owner';
});
window.addEventListener('hashchange', syncViewSwitch);
window.addEventListener('load', syncViewSwitch);

// Account menu on the header profile picture
const acctBtn = document.getElementById('acctBtn');
const acctMenu = document.getElementById('acctMenu');
function setAcctMenu(open) {
  if (open) {
    const email = window.ProBankAuth?.current();
    const acc = email ? window.ProBankAuth.account(email) : null;
    document.getElementById('acctName').textContent = acc?.name || 'Signed in';
    const role = window.ProBankAuth?.role() === 'advisor' ? 'Advisor' : 'Client';
    document.getElementById('acctEmail').textContent = email ? `${role} · ${email}` : '';
  }
  acctMenu.hidden = !open;
  acctBtn.setAttribute('aria-expanded', String(open));
}
acctBtn.addEventListener('click', (e) => { e.stopPropagation(); setAcctMenu(acctMenu.hidden); });
document.addEventListener('click', (e) => { if (!acctMenu.hidden && !e.target.closest('.acct')) setAcctMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setAcctMenu(false); });
acctMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setAcctMenu(false); });
document.getElementById('acctSignout').addEventListener('click', () => { setAcctMenu(false); window.ProBankAuth.signOut(); });
window.addEventListener('hashchange', () => setAcctMenu(false));

window.addEventListener('hashchange', render);
render();
