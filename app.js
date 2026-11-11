/* Схема электроснабжения — рабочий макет презентации. Без сборки и зависимостей. */
(function () {
  'use strict';

  var SLIDES = [
    { id: 'intro', name: 'Введение', icon: 'M11 2L4 11h5l-1 7 7-9h-5z' },
    { id: 'about', name: 'О системе', icon: 'M10 9v5M10 6h.01M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z' },
    { id: 'data', name: 'Данные', icon: 'M3 5c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3zM3 5v10c0 1.7 3.1 3 7 3s7-1.3 7-3V5M3 10c0 1.7 3.1 3 7 3s7-1.3 7-3' },
    { id: 'tasks', name: 'Решения', icon: 'M7 14h6M8 17h4M10 2a5 5 0 0 0-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z' },
    { id: 'views', name: 'Представление', icon: 'M2 4h7v12H2zM11 4h7v12h-7z' },
    { id: 'scheme', name: 'Карта ↔ схема', icon: 'M2 5l5-2 6 2 5-2v12l-5 2-6-2-5 2zM7 3v12M13 5v12' },
    { id: 'effect', name: 'Эффект', icon: 'M3 17V3M3 17h14M6 13l3-4 3 2 4-6M13 5h3v3' }
  ];

  /* ---------- Карта Москвы (процедурная, условная) ---------- */
  function buildMap(cx, cy, R) {
    var s = 20260;
    var rnd = function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
    var TAU = Math.PI * 2;
    var rf = function (t) { return 1 - 0.05 * Math.cos(2 * t) + 0.025 * Math.cos(3 * t + 0.8) + 0.015 * Math.sin(5 * t + 0.3); };
    var P = function (t, f) {
      var r = R * f * (1 + Math.min(f, 1) * (rf(t) - 1));
      return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
    };
    var fmt = function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); };
    var line = function (pts) { return 'M' + pts.map(fmt).join('L'); };
    var arc = function (f, t0, t1) {
      var n = Math.max(2, Math.ceil(Math.abs(t1 - t0) / 0.05)), pts = [];
      for (var i = 0; i <= n; i++) pts.push(P(t0 + (t1 - t0) * i / n, f));
      return line(pts);
    };
    var radial = function (t, f0, f1, wob) {
      var n = Math.max(1, Math.ceil((f1 - f0) / 0.07)), pts = [], tt = t, last = t;
      for (var i = 0; i <= n; i++) {
        last = tt;
        pts.push(P(tt, f0 + (f1 - f0) * i / n));
        tt += (rnd() - 0.5) * wob;
      }
      return [line(pts), last];
    };
    var dot = function (q, r) {
      return 'M' + (q[0] - r).toFixed(1) + ' ' + q[1].toFixed(1) +
        'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0';
    };
    var major = [[], [], [], [], []], minor = [[], [], [], [], []], outer = [], nodes = [];
    var k = Math.max(1, Math.min(2.2, R / 400));
    var i, t0;

    [0.055, 0.12, 0.19, 0.36].forEach(function (f, j) { major[(j + 1) % 5].push(arc(f, 0, TAU) + 'Z'); });
    for (i = 0; i < 5; i++) {
      t0 = rnd() * TAU;
      major[i % 5].push(arc(0.56 + rnd() * 0.14, t0, t0 + 0.7 + rnd() * 0.8));
    }
    var N = 22;
    for (i = 0; i < N; i++) {
      var t = (i + (rnd() - 0.5) * 0.5) / N * TAU;
      var f0 = [0.12, 0.19, 0.19, 0.36][Math.floor(rnd() * 4)];
      var r = radial(t, f0, 1, 0.03);
      major[i % 5].push(r[0]);
      nodes.push(dot(P(r[1], 1), +(2.4 * k).toFixed(1)));
      outer.push(radial(r[1], 1, 1.5 + rnd() * 1.2, 0.05)[0]);
    }
    for (i = 0; i < 80; i++) {
      var f = 0.22 + rnd() * 0.76; t0 = rnd() * TAU;
      minor[Math.floor(rnd() * 5)].push(arc(f, t0, t0 + 0.2 + rnd() * 0.8));
    }
    for (i = 0; i < 120; i++) {
      var tr = rnd() * TAU, fr = 0.14 + rnd() * 0.7;
      minor[Math.floor(rnd() * 5)].push(radial(tr, fr, Math.min(1, fr + 0.08 + rnd() * 0.28), 0.04)[0]);
    }
    for (i = 0; i < 6; i++) {
      t0 = rnd() * TAU;
      outer.push(arc(1.25 + rnd() * 0.75, t0, t0 + 0.3 + rnd() * 0.6));
    }
    var blobs = [];
    [[0.35, 1.12, 0.2], [1.2, 1.05, 0.16], [2.2, 1.2, 0.3], [2.9, 1.1, 0.18], [3.6, 1.25, 0.26], [4.3, 1.08, 0.14], [5.0, 1.15, 0.2], [5.75, 1.3, 0.24], [2.45, 1.75, 0.35]].forEach(function (b) {
      var c = P(b[0], b[1]), pts = [];
      for (var j = 0; j < 18; j++) {
        var a = j / 18 * TAU, rr = R * b[2] * (0.65 + rnd() * 0.7);
        pts.push([c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]);
      }
      blobs.push(line(pts) + 'Z');
    });
    var RV = [[-1.3, -0.3], [-1.02, -0.24], [-0.82, -0.1], [-0.72, -0.3], [-0.56, -0.2], [-0.6, 0], [-0.42, 0.06], [-0.36, -0.12], [-0.22, 0.02], [-0.28, 0.2], [-0.12, 0.23], [-0.05, 0.08], [0.06, 0.1], [0.13, 0.25], [0.05, 0.4], [0.2, 0.46], [0.35, 0.36], [0.43, 0.5], [0.31, 0.62], [0.46, 0.72], [0.66, 0.7], [0.8, 0.86], [1.05, 0.96], [1.4, 1.2]]
      .map(function (q) { return [cx + q[0] * R, cy + q[1] * R]; });
    var dRiver = 'M' + fmt(RV[0]);
    for (i = 0; i < RV.length - 1; i++) {
      var p0 = RV[Math.max(0, i - 1)], p1 = RV[i], p2 = RV[i + 1], p3 = RV[Math.min(RV.length - 1, i + 2)];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      dRiver += 'C' + fmt(c1) + ' ' + fmt(c2) + ' ' + fmt(p2);
    }
    return {
      city: arc(1, 0, TAU) + 'Z', blobs: blobs.join(''), river: dRiver, outer: outer.join(''), nodes: nodes.join(''),
      major: major.map(function (g) { return g.join(''); }), minor: minor.map(function (g) { return g.join(''); }),
      w: { major: (1.6 * k).toFixed(2), minor: (0.9 * k).toFixed(2), ring: (2.2 * k).toFixed(2), river: (6 * k).toFixed(1) }
    };
  }

  function mapHTML(mode, cx, cy, R) {
    var g = buildMap(cx, cy, R), w = g.w;
    var colors = ['#EADFB4', '#7CCFD0', '#E39AAE', '#9BDDB0', '#F0B37E'];
    var p = function (d, style) { return '<path d="' + d + '" style="' + style + '"></path>'; };
    var out = '<svg viewBox="0 0 1920 1080" width="1920" height="1080" aria-hidden="true" style="position:absolute;left:0;top:0;display:block;background:#182233">';
    out += p(g.blobs, 'fill:#121926;opacity:.8') + p(g.city, 'fill:#10151f');
    out += p(g.river, 'fill:none;stroke:#1b3346;stroke-width:' + w.river + ';stroke-linecap:round;stroke-linejoin:round');
    if (mode === 'dim') {
      out += p(g.outer, 'fill:none;stroke:#212b3c;stroke-width:' + w.minor);
      out += p(g.minor.join(''), 'fill:none;stroke:#222c3d;stroke-width:' + w.minor);
      out += p(g.major.join(''), 'fill:none;stroke:#2d394d;stroke-width:' + w.major);
      out += p(g.city, 'fill:none;stroke:#334058;stroke-width:' + w.ring);
    } else {
      out += p(g.river, 'fill:none;stroke:#2f6f7c;stroke-width:1.2;opacity:.8');
      out += p(g.outer, 'fill:none;stroke:#EADFB4;stroke-width:' + w.minor + ';opacity:.2');
      colors.forEach(function (c, i) { out += p(g.minor[i], 'fill:none;stroke:' + c + ';stroke-width:' + w.minor + ';opacity:.45'); });
      colors.forEach(function (c, i) { out += p(g.major[i], 'fill:none;stroke:' + c + ';stroke-width:' + w.major + ';opacity:.9;filter:drop-shadow(0 0 4px ' + c + '8c)'); });
      out += p(g.city, 'fill:none;stroke:#F2EAD0;stroke-width:' + w.ring + ';filter:drop-shadow(0 0 5px rgba(242,234,208,.6))');
      out += p(g.nodes, 'fill:#fff;opacity:.95');
    }
    return out + '</svg>';
  }

  /* ---------- Верхняя навигация ---------- */
  function navHTML(cur) {
    var h = '<nav class="deck-nav" aria-label="Слайды"><div class="deck-brand">ЦИФРОВОЙ ДВОЙНИК · ЭЛЕКТРОСНАБЖЕНИЕ</div><div class="deck-group">';
    SLIDES.forEach(function (sl, i) {
      var on = i === cur;
      h += '<a href="#' + sl.id + '" class="deck-tab' + (on ? ' is-on' : '') + '" title="' + sl.name + '" aria-label="' + sl.name + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true"><path d="' + sl.icon + '"></path></svg><span>' + sl.name + '</span></a>';
    });
    var arrow = function (href, label, d, strong) {
      return '<a href="#' + href + '" aria-label="' + label + '" class="deck-arrow' + (strong ? ' is-strong' : '') + '">' +
        '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="' + d + '"></path></svg></a>';
    };
    h += '</div><div class="deck-side"><div class="deck-count">0' + (cur + 1) + ' / 0' + SLIDES.length + '</div><div class="deck-group">' +
      arrow(SLIDES[(cur + SLIDES.length - 1) % SLIDES.length].id, 'Предыдущий слайд', 'M11 4L6 9l5 5', false) +
      arrow(SLIDES[(cur + 1) % SLIDES.length].id, 'Следующий слайд', 'M7 4l5 5-5 5', true) + '</div></div></nav>';
    return h;
  }

  /* ---------- Слайд «Карта ↔ схема ↔ объект» ---------- */

  /* Модель сети и расчёт представления (без DOM). Данные условные. */
  function powerCore() {
    const CLR = { 500: '#E5202E', 220: '#E6D72A', 110: '#4FA3E0', 10: '#59C27A', gen: '#C77DD6' };
    const DEMO_V = { 500: '512,3', 220: '224,6', 110: '115,0', 10: '10,4' };
    const GRAY = '#6b7480';

    function busArt(n) {
      const pad = 14, top = n.gens ? 30 : 6, bot = 8, k = n.buses.length;
      const bus = { 110: '', 220: '', 500: '' }, dots = { 110: '', 220: '', 500: '', gen: '' };
      let ticks = '';
      const ys = n.buses.map((c, i) => top + (i + 0.5) * (n.h - top - bot) / k);
      n.buses.forEach((c, i) => {
        const y = ys[i].toFixed(1);
        const x0 = c === 500 ? n.w * 0.36 : pad, x1 = c === 500 ? n.w * 0.56 : n.w - pad;
        bus[c] += 'M' + x0.toFixed(1) + ' ' + y + 'H' + x1.toFixed(1);
        const cnt = Math.max(2, Math.floor((x1 - x0) / 30));
        for (let j = 0; j < cnt; j++) {
          const x = (x0 + (j + 0.5) * (x1 - x0) / cnt).toFixed(1);
          dots[c] += 'M' + x + ' ' + y + 'h0.01';
          ticks += 'M' + x + ' ' + y + 'v' + (j % 2 ? 7 : -7);
        }
      });
      for (let g = 0; g < n.gens; g++) {
        const x = (pad + 14 + g * (n.w - 2 * pad - 28) / Math.max(1, n.gens - 1)).toFixed(1);
        dots.gen += 'M' + x + ' 14h0.01';
        ticks += 'M' + x + ' 14V' + ys[0].toFixed(1);
      }
      return { bus: bus, dots: dots, ticks: ticks };
    }

    const nodes = [], byId = {};
    [ // id, тип, класс, на карте, на схеме, ширина, высота, шины, генераторы
      ['a', 'ps', 500, [250, 560], [290, 600], 440, 110, [110, 220, 500], 0],
      ['b', 'tec', 110, [330, 380], [180, 330], 150, 70, [110], 2],
      ['c', 'ps', 110, [150, 250], [120, 130], 120, 50, [110], 0],
      ['d', 'ps', 110, [420, 200], [400, 130], 110, 50, [110], 0],
      ['e', 'tec', 110, [640, 400], [700, 300], 220, 80, [110], 3],
      ['f', 'ps', 220, [560, 600], [620, 480], 130, 50, [220], 0],
      ['g', 'ps', 110, [800, 560], [890, 480], 130, 50, [110], 0],
      ['h', 'ps', 220, [1000, 180], [1130, 120], 160, 50, [220], 0],
      ['i', 'tec', 220, [1080, 360], [1140, 310], 260, 90, [220, 110], 3],
      ['j', 'ps', 110, [1130, 560], [1140, 520], 150, 50, [110], 0],
      ['k', 'ps', 220, [760, 760], [850, 700], 150, 50, [220], 0],
      ['l', 'ps', 220, [1090, 760], [1160, 740], 220, 80, [220, 110], 0]
    ].forEach((d) => {
      const n = { id: d[0], type: d[1], cls: d[2], m: d[3], s: d[4], w: d[5], h: d[6], buses: d[7], gens: d[8] };
      n.title = n.type === 'tec' ? 'ТЭЦ' : 'ПС ' + n.cls + ' кВ';
      n.art = busArt(n);
      nodes.push(n); byId[n.id] = n;
    });
    byId.x = { id: 'x', m: [-20, 640], s: [0, 760] }; // внешняя сеть 500 кВ

    const lines = [ // класс, от, до, тип трассы (V: верт-гор-верт, H: гор-верт-гор), средняя координата, смещения на концах
      [110, 'a', 'c', 'V', 220, -200, -30], [110, 'a', 'b', 'V', 450, -140, -30], [110, 'a', 'b', 'V', 450, -80, 30],
      [110, 'a', 'd', 'V', 230, 110, -20], [110, 'a', 'e', 'V', 400, 180, -60], [110, 'd', 'e', 'V', 210, 30, -20],
      [220, 'a', 'f', 'H', 540, 20, 0], [220, 'a', 'k', 'H', 600, 40, 0], [110, 'a', 'g', 'H', 740, -20, 0],
      [110, 'e', 'g', 'V', 400, 60, 0], [110, 'e', 'i', 'H', 900, 10, 20], [220, 'f', 'i', 'V', 420, 30, -100],
      [220, 'h', 'i', 'V', 200, -30, -40], [220, 'h', 'i', 'V', 200, 50, 40], [110, 'i', 'j', 'V', 430, 20, 20],
      [110, 'g', 'j', 'H', 1000, 10, 0], [110, 'j', 'l', 'V', 620, 50, 30], [220, 'k', 'l', 'H', 990, 10, 0],
      [220, 'i', 'l', 'H', 1320, -10, 20], [110, 'b', 'c', 'V', 225, -40, 20], [500, 'a', 'x', 'V', 760, -160, 0]
    ].map((d) => {
      const a = byId[d[1]], b = byId[d[2]], mid = d[4], oa = d[5], ob = d[6];
      const s = d[3] === 'V'
        ? [[a.s[0] + oa, a.s[1]], [a.s[0] + oa, mid], [b.s[0] + ob, mid], [b.s[0] + ob, b.s[1]]]
        : [[a.s[0], a.s[1] + oa], [mid, a.s[1] + oa], [mid, b.s[1] + ob], [b.s[0], b.s[1] + ob]];
      const A = a.m, C = b.m, dx = C[0] - A[0], dy = C[1] - A[1], len = Math.hypot(dx, dy) || 1;
      const px = -dy / len, py = dx / len, off = oa * 0.15;
      const m = [A, [A[0] + dx * 0.35 + px * (18 + off), A[1] + dy * 0.35 + py * (18 + off)],
        [A[0] + dx * 0.7 + px * (off - 10), A[1] + dy * 0.7 + py * (off - 10)], C];
      return { cls: d[0], a: a.id, b: b.id, m: m, s: s };
    });

    /* Однолинейная схема объекта: геометрия одна для всех, цвета и подписи — от выбранного объекта */
    const FEED = [250, 360, 580, 800, 1020, 1130];
    const detail = (() => {
      const a = { hiThin: '', hiFill: '', loThin: '', loFill: '', hiBus: 'M230 250H1150M230 292H1150', loBus: 'M170 640H1210M170 682H1210' };
      const ln = (k, x1, y1, x2, y2) => { a[k + 'Thin'] += 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2; };
      const sq = (k, x, y) => { a[k + 'Fill'] += 'M' + (x - 6) + ' ' + (y - 6) + 'h12v12h-12z'; };
      const dt = (k, x, y) => { a[k + 'Fill'] += 'M' + (x - 4) + ' ' + y + 'a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'; };
      const ring = (k, x, y, r) => { a[k + 'Thin'] += 'M' + (x - r) + ' ' + y + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0'; };
      const arrow = (k, x, y, dir) => { a[k + 'Thin'] += 'M' + (x - 5) + ' ' + (y - dir * 9) + 'L' + x + ' ' + y + 'L' + (x + 5) + ' ' + (y - dir * 9); };
      [330, 1050].forEach((x) => { ln('hi', x, 160, x, 250); arrow('hi', x, 160, -1); sq('hi', x, 205); dt('hi', x, 250); });
      ln('hi', 690, 250, 690, 292); sq('hi', 690, 271); dt('hi', 690, 250); dt('hi', 690, 292);
      [560, 820].forEach((x) => { ln('hi', x, 250, x, 222); ring('hi', x, 214, 8); dt('hi', x, 250); });
      [470, 910].forEach((x) => {
        dt('hi', x, 292); ln('hi', x, 292, x, 372); sq('hi', x, 332); ring('hi', x, 388, 16);
        ring('lo', x, 410, 16); ln('lo', x, 426, x, 640); sq('lo', x, 590); dt('lo', x, 640);
      });
      ln('lo', 690, 640, 690, 682); sq('lo', 690, 661); dt('lo', 690, 640); dt('lo', 690, 682);
      FEED.forEach((x, i) => { const by = i % 2 ? 682 : 640; dt('lo', x, by); ln('lo', x, by, x, 800); sq('lo', x, 735); arrow('lo', x, 800, 1); });
      return a;
    })();

    function detailLabels(n) {
      const hiC = n.cls, loC = n.cls === 500 ? 220 : (n.cls === 220 ? 110 : 10);
      const hi = CLR[hiC], lo = CLR[loC], G = '#59d98e', C = '#56c7d6', MUTED = '#A7B2C2';
      const out = [];
      const add = (x, y, t, c, al, fs, fw) => out.push({ x: x, y: y, t: t, c: c, al: al || 'left', tf: al === 'center' ? 'translateX(-50%)' : (al === 'right' ? 'translateX(-100%)' : 'none'), fs: fs || 13, fw: fw || 500 });
      add(690, 128, 'РУ ' + hiC + ' кВ', '#ffffff', 'center', 17, 700);
      add(690, 536, 'РУ ' + loC + ' кВ', '#ffffff', 'center', 17, 700);
      add(214, 232, '1 с.ш.', MUTED, 'right'); add(214, 248, DEMO_V[hiC] + ' кВ', hi, 'right', 13, 700);
      add(214, 276, '2 с.ш.', MUTED, 'right'); add(214, 292, DEMO_V[hiC] + ' кВ', hi, 'right', 13, 700);
      add(154, 622, '1 с.ш.', MUTED, 'right'); add(154, 638, DEMO_V[loC] + ' кВ', lo, 'right', 13, 700);
      add(154, 666, '2 с.ш.', MUTED, 'right'); add(154, 682, DEMO_V[loC] + ' кВ', lo, 'right', 13, 700);
      [[330, ['34,19', '3,92', '91']], [1050, ['25,92', '41,01', '107']]].forEach((p) => {
        add(p[0] + 14, 160, p[1][0], G); add(p[0] + 14, 176, p[1][1], C); add(p[0] + 14, 192, p[1][2], hi);
      });
      [[470, ['33,13', '3,39', '147']], [910, ['25,62', '41,01', '167']]].forEach((p) => {
        add(p[0] + 28, 390, 'АТ', MUTED, 'left', 14, 700);
        add(p[0] + 14, 470, p[1][0], G); add(p[0] + 14, 486, p[1][1], C); add(p[0] + 14, 502, p[1][2], lo);
      });
      [['28,13', '26,90'], ['28,76', '26,44'], ['28,27', '1,01'], ['32,51', '0,33'], ['4,19', '13,12'], ['11,40', '3,20']].forEach((v, i) => {
        add(FEED[i] + 12, 756, v[0], G); add(FEED[i] + 12, 772, v[1], C);
      });
      return { labels: out, hi: hi, lo: lo };
    }

    const cache = {};
    function compute(st) {
      const t = st.t, z = st.z, off = st.off, sel = st.sel;
      const lerp = (a, b) => a + (b - a) * t;
      const alive = {};
      if (off) {
        const q = [];
        nodes.forEach((n) => { if (n.id !== off && (n.type === 'tec' || n.id === 'a')) { alive[n.id] = true; q.push(n.id); } });
        while (q.length) {
          const id = q.pop();
          lines.forEach((l) => {
            if (l.b === 'x') return;
            const o = l.a === id ? l.b : (l.b === id ? l.a : null);
            if (o && o !== off && !alive[o]) { alive[o] = true; q.push(o); }
          });
        }
      }
      const dead = (id) => !!off && id !== 'x' && !alive[id];
      const d = { 500: '', 220: '', 110: '' };
      let dDead = '', dSel = '';
      lines.forEach((l) => {
        if (!st.show[l.cls]) return;
        const p = 'M' + l.m.map((q, i) => lerp(q[0], l.s[i][0]).toFixed(1) + ' ' + lerp(q[1], l.s[i][1]).toFixed(1)).join('L');
        if (dead(l.a) || dead(l.b)) dDead += p; else d[l.cls] += p;
        if (l.a === sel || l.b === sel) dSel += p;
      });
      const vn = nodes.map((n) => {
        const dd = dead(n.id), isSel = n.id === sel;
        return {
          id: n.id, title: n.title, art: n.art, vb: '0 0 ' + n.w + ' ' + n.h,
          x: lerp(n.m[0], n.s[0]).toFixed(1), y: lerp(n.m[1], n.s[1]).toFixed(1),
          w: lerp(44, n.w).toFixed(1), h: lerp(44, n.h).toFixed(1),
          mkOp: (1 - t).toFixed(3), boxOp: t.toFixed(3),
          col: dd ? GRAY : CLR[n.cls], mkRadius: n.type === 'tec' ? '50%' : '6px', genOp: n.type === 'tec' ? 1 : 0,
          boxBorder: isSel ? '#ffffff' : '#8b95a3', artOp: dd ? 0.3 : 1,
          glow: isSel ? '0 0 0 3px rgba(255,255,255,0.22), 0 0 16px rgba(255,255,255,0.55)' : 'none',
          lx: lerp(40, 0).toFixed(1), ly: lerp(12, -22).toFixed(1),
          lc: isSel ? '#ffffff' : '#C5CEDB', lw: isSel ? 700 : 500
        };
      });
      const sn = byId[sel];
      const deadCount = off ? nodes.filter((n) => n.id !== off && dead(n.id)).length : 0;
      const dl = cache[sel] || (cache[sel] = detailLabels(sn));
      const selOff = off === sel, selDead = dead(sel);
      return {
        dLine: d, dDead: dDead, dSel: dSel, nodes: vn,
        mapOp: (1 - t).toFixed(3), schOp: t.toFixed(3),
        origin: sn.s[0] + 'px ' + sn.s[1] + 'px',
        netTf: 'scale(' + (1 + 5 * z).toFixed(3) + ')', netOp: Math.max(0, 1 - z * 1.2).toFixed(3),
        detTf: 'scale(' + (0.12 + 0.88 * z).toFixed(3) + ')', detOp: Math.max(0, Math.min(1, (z - 0.1) / 0.6)).toFixed(3),
        detail: detail, detLabels: dl.labels, hi: dl.hi, lo: dl.lo,
        selTitle: sn.title,
        selType: sn.type === 'tec' ? 'Электростанция' : 'Подстанция',
        selCls: sn.cls + ' кВ',
        selConn: String(lines.filter((l) => l.a === sel || l.b === sel).length),
        selState: selOff ? 'Отключён' : (selDead ? 'Без питания' : 'Под напряжением'),
        selStateColor: (selOff || selDead) ? '#FF8A99' : '#5FD6A2',
        selOff: selOff, hasOff: !!off,
        offNote: off ? ('Отключён объект: ' + byId[off].title + '. ' + (deadCount ? 'Объектов без питания: ' + deadCount + '.' : 'Остальные объекты сохраняют питание по другим связям.')) : ''
      };
    }
    return { CLR: CLR, nodes: nodes, compute: compute };
  }

  function initScheme(root) {
    const $ = (sel) => root.querySelector(sel);
    const core = powerCore();
    const state = { t: 0, z: 0, view: 'map', sel: 'i', off: null, show: { 500: true, 220: true, 110: true } };
    const CLS = [500, 220, 110, 'gen'];
    const els = {};

    const box = $('#sc-nodes');
    core.nodes.forEach((n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-node';
      b.setAttribute('aria-label', n.title);
      let svg = '<svg viewBox="0 0 ' + n.w + ' ' + n.h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + n.art.ticks + '" class="sc-ticks"></path>';
      CLS.forEach((c) => {
        if (n.art.bus[c]) svg += '<path d="' + n.art.bus[c] + '" class="sc-bus" style="stroke:' + core.CLR[c] + '"></path>';
        if (n.art.dots[c]) svg += '<path d="' + n.art.dots[c] + '" class="sc-dots' + (c === 'gen' ? ' sc-gen' : '') + '" style="stroke:' + core.CLR[c] + '"></path>';
      });
      b.innerHTML = '<span class="sc-box" aria-hidden="true">' + svg + '</svg></span>' +
        '<span class="sc-mk" aria-hidden="true"><i></i></span><span class="sc-label">' + n.title + '</span>';
      b.addEventListener('click', () => { state.sel = n.id; render(); });
      b.addEventListener('dblclick', () => { state.sel = n.id; go('object'); });
      box.appendChild(b);
      els[n.id] = { el: b, box: b.children[0], mk: b.children[1], gen: b.children[1].firstChild, label: b.children[2] };
    });

    const layerBox = $('#sc-layers'), layerEls = {};
    [[500, 'Сеть 500 кВ'], [220, 'Сеть 220 кВ'], [110, 'Сеть 110 кВ']].forEach((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-layer';
      b.innerHTML = '<span aria-hidden="true" class="sc-layer-line" style="background:' + core.CLR[d[0]] + '"></span><span class="sc-layer-name">' + d[1] +
        '</span><span aria-hidden="true" class="sc-layer-dot" style="border-color:' + core.CLR[d[0]] + '"></span>';
      b.addEventListener('click', () => { state.show[d[0]] = !state.show[d[0]]; render(); });
      layerBox.appendChild(b);
      layerEls[d[0]] = b;
    });

    let lastSel = null;
    function render() {
      const v = core.compute(state);
      $('#sc-p500').setAttribute('d', v.dLine[500]); $('#sc-p220').setAttribute('d', v.dLine[220]); $('#sc-p110').setAttribute('d', v.dLine[110]);
      $('#sc-pDead').setAttribute('d', v.dDead); $('#sc-pSel').setAttribute('d', v.dSel);
      $('#sc-mapbg').style.opacity = v.mapOp; $('#sc-schbg').style.opacity = v.schOp;

      v.nodes.forEach((n) => {
        const e = els[n.id];
        e.el.style.left = n.x + 'px'; e.el.style.top = n.y + 'px';
        e.el.style.width = n.w + 'px'; e.el.style.height = n.h + 'px';
        e.box.style.opacity = n.boxOp; e.box.style.borderColor = n.boxBorder; e.box.style.boxShadow = n.glow;
        e.box.firstChild.style.opacity = n.artOp;
        e.mk.style.opacity = n.mkOp; e.mk.style.borderColor = n.col; e.mk.style.borderRadius = n.mkRadius; e.mk.style.boxShadow = n.glow;
        e.gen.style.opacity = n.genOp;
        e.label.style.left = n.lx + 'px'; e.label.style.top = n.ly + 'px'; e.label.style.color = n.lc; e.label.style.fontWeight = n.lw;
      });

      const net = $('#sc-net'), det = $('#sc-detail');
      net.style.transformOrigin = v.origin; net.style.transform = v.netTf; net.style.opacity = v.netOp;
      net.style.pointerEvents = state.z > 0.01 ? 'none' : '';
      det.style.transformOrigin = v.origin; det.style.transform = v.detTf; det.style.opacity = v.detOp;
      det.style.visibility = state.z > 0.01 ? 'visible' : 'hidden';
      if (lastSel !== state.sel) {
        lastSel = state.sel;
        ['hiThin', 'hiFill', 'hiBus', 'loThin', 'loFill', 'loBus'].forEach((k) => {
          const p = $('#sc-d-' + k), c = k.slice(0, 2) === 'hi' ? v.hi : v.lo;
          p.setAttribute('d', v.detail[k]);
          if (k.slice(2) === 'Fill') p.style.fill = c; else p.style.stroke = c;
        });
        $('#sc-d-title').textContent = v.selTitle;
        $('#sc-d-labels').innerHTML = v.detLabels.map((l) =>
          '<span style="left:' + l.x + 'px;top:' + l.y + 'px;color:' + l.c + ';transform:' + l.tf + ';font-size:' + l.fs + 'px;font-weight:' + l.fw + '">' + l.t + '</span>').join('');
      }

      ['map', 'scheme', 'object'].forEach((name) => {
        const on = state.view === name;
        $('#sc-title-' + name).hidden = !on;
        $('#sc-to-' + name).classList.toggle('is-on', on);
        $('#sc-to-' + name).setAttribute('aria-pressed', String(on));
      });
      [500, 220, 110].forEach((c) => {
        const on = state.show[c];
        layerEls[c].classList.toggle('is-on', on); layerEls[c].setAttribute('aria-pressed', String(on));
        layerEls[c].querySelector('.sc-layer-dot').style.background = on ? core.CLR[c] : 'transparent';
      });
      $('#sc-name').textContent = v.selTitle;
      $('#sc-type').textContent = v.selType;
      $('#sc-cls').textContent = v.selCls;
      $('#sc-conn').textContent = v.selConn;
      $('#sc-state').textContent = v.selState; $('#sc-state').style.color = v.selStateColor;
      $('#sc-open-btn').textContent = state.view === 'object' ? 'Вернуться к схеме сети' : 'Открыть схему объекта';
      const btn = $('#sc-off-btn');
      btn.textContent = v.selOff ? 'Вернуть в работу' : 'Смоделировать отключение';
      btn.classList.toggle('is-off', v.selOff);
      $('#sc-off-note').hidden = !v.hasOff; $('#sc-off-note').textContent = v.offNote;
    }

    let raf = 0;
    function go(view) {
      const tT = view === 'map' ? 0 : 1, zT = view === 'object' ? 1 : 0;
      cancelAnimationFrame(raf);
      state.view = view;
      const steps = [];
      if (zT < state.z) steps.push(['z', state.z, zT]);
      if (tT !== state.t) steps.push(['t', state.t, tT]);
      if (zT > state.z) steps.push(['z', state.z, zT]);
      if ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || !steps.length) {
        state.t = tT; state.z = zT; render(); return;
      }
      const dur = 1000;
      let i = 0, t0 = performance.now();
      const step = (now) => {
        const s = steps[i], k = Math.min(1, (now - t0) / dur);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        state[s[0]] = s[1] + (s[2] - s[1]) * e;
        render();
        if (k >= 1) { i++; t0 = now; }
        if (i < steps.length) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    ['map', 'scheme', 'object'].forEach((name) => { $('#sc-to-' + name).addEventListener('click', () => go(name)); });
    $('#sc-open-btn').addEventListener('click', () => go(state.view === 'object' ? 'scheme' : 'object'));
    $('#sc-off-btn').addEventListener('click', () => { state.off = state.off === state.sel ? null : state.sel; render(); });
    render();
  }

  /* ---------- Слайд «Решения»: мини-экраны «Как это работает» ---------- */
  function initSolutions(root) {
    const $ = (sel) => root.querySelector(sel);
    const Y = '#E6D72A', B = '#4FA3E0', GRAY = '#6b7480', MUTED = '#A7B2C2';
    const scrim = $('#demo-scrim');
    let opener = null;

    function close() {
      root.querySelectorAll('.demo').forEach((d) => { d.hidden = true; });
      scrim.hidden = true;
      if (opener) { opener.focus(); opener = null; }
    }
    function open(name, from) {
      close();
      opener = from;
      scrim.hidden = false;
      const d = $('#demo-' + name);
      d.hidden = false;
      d.querySelector('.demo-close').focus();
    }
    root.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => open(b.dataset.demo, b)));
    root.querySelectorAll('.demo-close').forEach((b) => b.addEventListener('click', close));
    scrim.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('hashchange', close);

    const box = (x, y, w, h, bus, label, dead) =>
      '<rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" style="fill:#05070b;stroke:' + (dead ? GRAY : '#8b95a3') + ';stroke-width:1.5;stroke-dasharray:5 4"></rect>' +
      '<path d="M' + (x - w / 2 + 14) + ' ' + y + 'H' + (x + w / 2 - 14) + '" style="stroke:' + (dead ? GRAY : bus) + ';stroke-width:5;stroke-linecap:round"></path>' +
      '<text x="' + (x - w / 2) + '" y="' + (y - h / 2 - 10) + '" style="fill:' + (dead ? MUTED : '#ffffff') + ';font-size:17px;font-weight:600">' + label + '</text>';
    const wire = (d, color, dead, dashed) =>
      '<path d="' + d + '" style="fill:none;stroke:' + (dead ? GRAY : color) + ';stroke-width:2.5;' + ((dead || dashed) ? 'stroke-dasharray:7 7;' : 'filter:drop-shadow(0 0 5px ' + color + ');') + '"></path>';

    /* 01. Авария и переключение */
    (function () {
      const feeds = [{ x: 170, n: [42, 3, 0] }, { x: 470, n: [58, 5, 2] }, { x: 790, n: [37, 4, 1] }];
      let step = 0;
      const texts = [
        ['Шаг 1 из 3 · Нормальный режим', 'Сеть работает штатно: все подстанции и потребители под напряжением.', 'Отключить ПС 220 кВ'],
        ['Шаг 2 из 3 · Авария', 'Питающая подстанция отключена. Решение сразу показывает, кто остался без электроснабжения.', 'Переключить на резерв'],
        ['Шаг 3 из 3 · Переключение', 'Часть потребителей переведена на соседний источник по резервной связи. Оставшаяся подстанция — первый приоритет восстановления.', 'Начать заново']
      ];
      function render() {
        const s1dead = step > 0, dead = [step > 0, step === 1, false], tie = step === 2;
        let o = '<svg viewBox="0 0 960 640" width="960" height="640" role="img" aria-label="Схема участка сети: две питающие подстанции, три подстанции 110 кВ и их потребители">';
        o += wire('M250 110V200H170V300', B, dead[0]) + wire('M290 110V200H470V300', B, step > 0) + wire('M840 110V300', B, false);
        o += wire('M540 300H720', B, false, !tie);
        o += '<text x="630" y="286" style="fill:' + (tie ? '#ffffff' : MUTED) + ';font-size:14px;text-anchor:middle">' + (tie ? 'резерв включён' : 'резервная связь') + '</text>';
        o += box(270, 90, 200, 56, Y, 'ПС 220 кВ', s1dead) + box(790, 90, 200, 56, Y, 'ПС 220 кВ', false);
        feeds.forEach((f, i) => {
          const dd = dead[i];
          o += wire('M' + f.x + ' 328V420', '#59C27A', dd) + box(f.x, 300, 150, 56, B, 'ПС 110 кВ', dd);
          o += '<rect x="' + (f.x - 110) + '" y="420" width="220" height="150" rx="12" style="fill:' + (dd ? 'rgba(255,45,70,0.12)' : '#1d2636') + ';stroke:' + (dd ? '#FF2D46' : '#2d394d') + ';stroke-width:1.5"></rect>';
          ['Жилые дома', 'Соцобъекты', 'Промышленность'].forEach((name, k) => {
            const y = 462 + k * 40;
            o += '<text x="' + (f.x - 90) + '" y="' + y + '" style="fill:#C5CEDB;font-size:17px">' + name + '</text>' +
              '<text x="' + (f.x + 90) + '" y="' + y + '" style="fill:' + (dd ? '#FF8A99' : '#ffffff') + ';font-size:19px;font-weight:700;text-anchor:end">' + f.n[k] + '</text>';
          });
          o += '<text x="' + f.x + '" y="600" style="fill:' + (dd ? '#FF8A99' : '#5FD6A2') + ';font-size:15px;font-weight:600;text-anchor:middle">' + (dd ? 'без питания' : 'под напряжением') + '</text>';
        });
        $('#outage-stage').innerHTML = o + '</svg>';
        const sum = [0, 1, 2].map((k) => feeds.reduce((a, f, i) => a + (dead[i] ? f.n[k] : 0), 0));
        $('#outage-n1').textContent = sum[0]; $('#outage-n2').textContent = sum[1]; $('#outage-n3').textContent = sum[2];
        $('#outage-step').textContent = texts[step][0]; $('#outage-text').textContent = texts[step][1]; $('#outage-btn').textContent = texts[step][2];
        $('#demo-outage').classList.toggle('is-alarm', sum[0] > 0);
      }
      $('#outage-btn').addEventListener('click', () => { step = (step + 1) % 3; render(); });
      render();
    })();

    /* 02. Прогноз потребления */
    (function () {
      const X0 = 80, X1 = 920, Y0 = 520, Y1 = 60, MAX = 130;
      const px = (h) => X0 + (X1 - X0) * h / 24, py = (v) => Y0 - (Y0 - Y1) * v / MAX;
      const profile = (h) => 0.52 + 0.14 * Math.exp(-Math.pow((h - 9) / 2.6, 2)) + 0.26 * Math.exp(-Math.pow((h - 19) / 3, 2)) - 0.1 * Math.exp(-Math.pow((h - 4) / 3, 2));
      const range = $('#forecast-range');
      function render() {
        const T = +range.value, m = 1 + 0.012 * Math.max(0, 5 - T) + 0.016 * Math.max(0, T - 22);
        let d = '', peak = 0, peakH = 0;
        for (let i = 0; i <= 96; i++) {
          const h = i / 4, v = profile(h) * m * 100;
          if (v > peak) { peak = v; peakH = h; }
          d += (i ? 'L' : 'M') + px(h).toFixed(1) + ' ' + py(v).toFixed(1);
        }
        const over = peak > 100;
        let o = '<svg viewBox="0 0 960 640" width="960" height="640" role="img" aria-label="Суточный график нагрузки и линия располагаемой мощности">';
        o += '<defs><clipPath id="fc-over"><rect x="0" y="0" width="960" height="' + py(100) + '"></rect></clipPath></defs>';
        [0, 25, 50, 75, 100, 125].forEach((v) => {
          o += '<path d="M' + X0 + ' ' + py(v) + 'H' + X1 + '" style="stroke:#222c3d;stroke-width:1"></path><text x="' + (X0 - 12) + '" y="' + (py(v) + 5) + '" style="fill:' + MUTED + ';font-size:15px;text-anchor:end">' + v + ' %</text>';
        });
        [0, 4, 8, 12, 16, 20, 24].forEach((h) => { o += '<text x="' + px(h) + '" y="' + (Y0 + 30) + '" style="fill:' + MUTED + ';font-size:15px;text-anchor:middle">' + (h < 10 ? '0' : '') + h + ':00</text>'; });
        o += '<path d="' + d + 'L' + X1 + ' ' + Y0 + 'L' + X0 + ' ' + Y0 + 'Z" style="fill:rgba(79,163,224,0.14)"></path>';
        o += '<path d="' + d + '" style="fill:none;stroke:' + B + ';stroke-width:3.5;stroke-linejoin:round;filter:drop-shadow(0 0 6px rgba(79,163,224,0.7))"></path>';
        o += '<path d="' + d + '" clip-path="url(#fc-over)" style="fill:none;stroke:#FF2D46;stroke-width:4.5;stroke-linejoin:round;filter:drop-shadow(0 0 6px rgba(255,45,70,0.8))"></path>';
        o += '<path d="M' + X0 + ' ' + py(100) + 'H' + X1 + '" style="stroke:' + Y + ';stroke-width:2;stroke-dasharray:8 6"></path><text x="' + (X0 + 10) + '" y="' + (py(100) - 10) + '" style="fill:' + Y + ';font-size:15px;font-weight:600">Располагаемая мощность</text>';
        o += '<circle cx="' + px(peakH) + '" cy="' + py(peak) + '" r="7" style="fill:#10151f;stroke:' + (over ? '#FF2D46' : '#ffffff') + ';stroke-width:3"></circle>';
        o += '<text x="' + px(peakH) + '" y="' + (py(peak) - 18) + '" style="fill:#ffffff;font-size:17px;font-weight:700;text-anchor:middle">пик ' + Math.round(peak) + ' %</text>';
        $('#forecast-stage').innerHTML = o + '</svg>';
        const hh = Math.floor(peakH), mm = Math.round((peakH - hh) * 60);
        $('#forecast-t').textContent = (T > 0 ? '+' : (T < 0 ? '−' : '')) + Math.abs(T) + ' °C';
        range.setAttribute('aria-valuetext', T + ' °C');
        $('#forecast-peak').textContent = Math.round(peak) + ' %';
        $('#forecast-peak-l').textContent = 'пик нагрузки, в ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
        $('#forecast-res').textContent = Math.abs(Math.round(100 - peak)) + ' %';
        $('#forecast-res-l').textContent = over ? 'не хватает мощности в пике' : 'запас мощности в пике';
        const v = $('#forecast-verdict');
        v.textContent = over ? 'Пик превышает располагаемую мощность — нужны мероприятия заранее.' : (peak > 90 ? 'Запас мал: стоит заранее подготовить резервы.' : 'Мощности достаточно.');
        v.className = 'demo-verdict ' + (over ? 'is-bad' : (peak > 90 ? 'is-warn' : 'is-ok'));
        $('#demo-forecast').classList.toggle('is-alarm', over);
      }
      range.addEventListener('input', render);
      render();
    })();

    /* 03. Планирование застройки: район, новые абоненты, расчёт модернизации и стоимости (данные условные) */
    (function () {
      const SRC_CAP = 42, SRC_BASE = 31, SRC_NEXT = 66;      // ПС 110 кВ: допустимая нагрузка 2×40 МВА, текущая, после замены на 2×63 МВА
      const LINE_MW = 5, TP_MW = 1.6;                        // одна ЛЭП 10 кВ и одна ТП 2×1000 кВА
      /* условные расценки, млн ₽ */
      const PRICE = { klKm: 12, rp: 90, tp: 14, feed: 25, trafo: 480, center: 2500 };
      const AMBER = '#F5A04A', GREEN = '#59C27A';
      const zones = {
        n: { name: 'север', cap: 12, base: 6, km: 2.4, d: 'M170 410V250H520V150H600', tag: [300, 238] },
        c: { name: 'центр', cap: 10, base: 5, km: 1.6, d: 'M170 430H600', tag: [400, 418] },
        s: { name: 'юг', cap: 10, base: 4, km: 3.1, d: 'M170 450V630H640', tag: [400, 618] }
      };
      const items = [
        { name: 'Жилой микрорайон', mw: 9, zone: 'n', r: [600, 70, 270, 150], on: true, tap: 'M600 150' },
        { name: 'Школа и детский сад', mw: 1.5, zone: 'n', r: [400, 96, 104, 84], on: false, tap: 'M520 180H504' },
        { name: 'Больница', mw: 4, zone: 'c', r: [600, 330, 160, 130], on: false, tap: 'M600 430', first: true },
        { name: 'Транспортный узел', mw: 6, zone: 'c', r: [384, 474, 136, 76], on: false, tap: 'M450 430V474' },
        { name: 'Технопарк', mw: 12, zone: 's', r: [640, 560, 250, 130], on: false, tap: 'M640 630' }
      ];
      const KEYS = ['src', 'n', 'c', 's', 'tp'];
      let card = null;
      const fmt = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
      const money = (v) => !v ? '—' : (v >= 1000 ? String(Math.round(v / 10) / 100).replace('.', ',') + ' млрд ₽' : Math.round(v) + ' млн ₽');
      const plural = (n, a, b, c) => (n % 10 === 1 && n % 100 !== 11) ? a : ((n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? b : c);

      /* подложка района: улицы, река, парк, существующая застройка */
      let bg = '<rect width="1040" height="776" style="fill:#0b0f17"></rect>';
      bg += '<path d="M-20 740C140 700 240 760 400 735S700 700 1060 750V800H-20Z" style="fill:#12283a"></path>';
      bg += '<path d="M905 285c50-30 120-10 125 45s-40 95-95 90-80-95-30-135z" style="fill:#12241c"></path>';
      bg += '<path d="M0 250H1040M0 430H1040M0 630H1040M170 0V776M520 0V776M880 0V776M0 40L1040 110" style="fill:none;stroke:#1a2231;stroke-width:22"></path>';
      bg += '<path d="M0 560L1040 500" style="fill:none;stroke:#222c3d;stroke-width:3;stroke-dasharray:14 8"></path>';
      const free = (x, y) => !items.some((it) => x > it.r[0] - 34 && x < it.r[0] + it.r[2] + 6 && y > it.r[1] - 24 && y < it.r[1] + it.r[3] + 6) &&
        !(x > 880 && y > 260 && y < 440) && y < 690 && !(x < 250 && y > 360 && y < 500);
      let seed = 7;
      const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
      [[30, 150], [190, 500], [540, 860], [900, 1020]].forEach((cx) => {
        [[70, 230], [270, 410], [450, 610], [650, 700]].forEach((cy) => {
          for (let x = cx[0]; x + 28 <= cx[1]; x += 42) for (let y = cy[0]; y + 16 <= cy[1]; y += 30) {
            const keep = rnd() > 0.22;
            if (keep && free(x, y)) bg += '<rect x="' + x + '" y="' + y + '" width="28" height="16" rx="2" style="fill:#161e2c"></rect>';
          }
        });
      });

      const stage = $('#planning-stage');
      const svgBox = document.createElement('div');
      stage.appendChild(svgBox);
      /* кликабельные зоны объектов электроснабжения поверх плана */
      const hit = (key, label, x, y, w, h) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'demo-hit';
        b.setAttribute('aria-label', 'Карточка объекта: ' + label);
        b.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
        b.addEventListener('click', () => { card = key; render(); $('#planning-card-back').focus(); });
        stage.appendChild(b);
      };
      hit('src', 'ПС 110 кВ', 80, 380, 180, 100);
      Object.keys(zones).forEach((k) => hit(k, 'ЛЭП 10 кВ, ' + zones[k].name, zones[k].tag[0] - 90, zones[k].tag[1] - 40, 180, 44));

      const tg = $('#planning-toggles');
      items.forEach((it) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'demo-toggle';
        b.innerHTML = '<span class="demo-check" aria-hidden="true"></span><span class="demo-toggle-name">' + it.name + '</span><b>' + fmt(it.mw) + ' МВт</b>';
        b.addEventListener('click', () => { it.on = !it.on; render(); });
        tg.appendChild(b);
        it.el = b;
      });
      const rows = {};
      KEYS.forEach((k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'demo-obj';
        b.innerHTML = '<span class="demo-obj-dot" aria-hidden="true"></span><span class="demo-obj-name"></span><span class="demo-obj-status"></span><b></b>' +
          '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5 2l5 5-5 5"></path></svg>';
        b.addEventListener('click', () => { card = k; render(); $('#planning-card-back').focus(); });
        $('#planning-objects').appendChild(b);
        rows[k] = b;
      });
      $('#planning-card-back').addEventListener('click', () => { const k = card; card = null; render(); if (rows[k]) rows[k].focus(); });

      /* расчёт: по каждому объекту электроснабжения — параметры, мероприятия, стоимость */
      function model() {
        const add = { n: 0, c: 0, s: 0 };
        items.forEach((it) => { if (it.on) add[it.zone] += it.mw; });
        const addAll = add.n + add.c + add.s, total = SRC_BASE + addAll, m = {};
        Object.keys(zones).forEach((k) => {
          const z = zones[k], load = z.base + add[k], def = Math.max(0, load - z.cap), works = [];
          const who = items.filter((it) => it.on && it.zone === k);
          if (def) {
            const n = Math.max(2, Math.ceil(def / LINE_MW));
            works.push([n + ' ' + plural(n, 'новая ЛЭП', 'новые ЛЭП', 'новых ЛЭП') + ' 10 кВ по ' + fmt(z.km) + ' км', n * z.km * PRICE.klKm]);
            if (def > 4) works.push(['Новый РП 10 кВ', PRICE.rp]);
          }
          if (who.some((it) => it.first)) works.push(['Второй независимый ввод для больницы (I категория надёжности)', PRICE.feed]);
          m[k] = {
            title: 'ЛЭП 10 кВ · ' + z.name, short: 'ЛЭП 10 кВ · ' + z.name, def: def,
            status: def ? 'не хватает ' + fmt(def) + ' МВт' : (add[k] ? 'резерва достаточно' : 'без изменений'),
            facts: [['Пропускная способность', z.cap + ' МВт'], ['Текущая нагрузка', fmt(z.base) + ' МВт'],
              ['Новые абоненты', who.length ? who.map((it) => it.name + ' +' + fmt(it.mw)).join(', ') : 'нет'],
              ['Нагрузка после подключения', fmt(load) + ' МВт'], ['Длина трассы от ПС', fmt(z.km) + ' км']],
            works: works, load: load, over: def > 0
          };
        });
        const srcDef = Math.max(0, total - SRC_CAP);
        m.src = {
          title: 'ПС 110 кВ', short: 'ПС 110 кВ', def: srcDef,
          status: srcDef ? 'не хватает ' + fmt(srcDef) + ' МВт' : (addAll ? 'резерва достаточно' : 'без изменений'),
          facts: [['Трансформаторы', '2×40 МВА'], ['Допустимая нагрузка', SRC_CAP + ' МВт'], ['Текущая нагрузка', SRC_BASE + ' МВт'],
            ['Новые абоненты', addAll ? '+' + fmt(addAll) + ' МВт' : 'нет'], ['Нагрузка после подключения', fmt(total) + ' МВт']],
          works: !srcDef ? [] : (total <= SRC_NEXT ? [['Замена трансформаторов 2×40 на 2×63 МВА', PRICE.trafo]] : [['Строительство нового питающего центра', PRICE.center]]),
          over: srcDef > 0
        };
        const tp = Math.ceil(addAll / TP_MW);
        m.tp = {
          title: 'ТП 10/0,4 кВ', short: 'Новые ТП 10/0,4 кВ', def: 0,
          status: tp ? tp + ' ' + plural(tp, 'подстанция', 'подстанции', 'подстанций') : 'не требуются',
          facts: [['Нагрузка новых абонентов', fmt(addAll) + ' МВт'], ['Мощность одной ТП', '2×1000 кВА, ' + fmt(TP_MW) + ' МВт'], ['Требуется ТП', String(tp)]],
          works: tp ? [[tp + ' ' + plural(tp, 'новая ТП', 'новые ТП', 'новых ТП') + ' 10/0,4 кВ', tp * PRICE.tp]] : [],
          over: false
        };
        KEYS.forEach((k) => { m[k].cost = m[k].works.reduce((a, w) => a + w[1], 0); });
        return { m: m, add: add, addAll: addAll, total: total, cost: KEYS.reduce((a, k) => a + m[k].cost, 0) };
      }

      function render() {
        const R = model(), m = R.m, srcOver = m.src.over;
        let o = '<svg viewBox="0 0 1040 776" width="1040" height="776" role="img" aria-label="План района: подстанция, линии электропередачи и перспективные объекты">' + bg;

        Object.keys(zones).forEach((k) => {
          const z = zones[k], over = m[k].over, sel = card === k;
          o += '<path d="' + z.d + '" style="fill:none;stroke:' + (sel ? '#ffffff' : GREEN) + ';stroke-width:' + (sel ? 4.5 : 3) + ';stroke-linejoin:round;filter:drop-shadow(0 0 5px ' + (sel ? 'rgba(255,255,255,0.9)' : 'rgba(89,194,122,0.7)') + ')"></path>';
          if (over) o += '<path d="' + z.d + '" transform="translate(9 9)" style="fill:none;stroke:' + AMBER + ';stroke-width:3;stroke-dasharray:10 7;stroke-linejoin:round;filter:drop-shadow(0 0 6px rgba(245,160,74,0.8))"></path>';
          const tw = 182;
          o += '<rect x="' + (z.tag[0] - tw / 2) + '" y="' + (z.tag[1] - 30) + '" width="' + tw + '" height="24" rx="12" style="fill:' + (sel ? '#ffffff' : '#0b0f17') + ';stroke:' + (sel ? '#ffffff' : (over ? AMBER : '#5B677A')) + ';stroke-width:1.2"></rect>' +
            '<text x="' + z.tag[0] + '" y="' + (z.tag[1] - 13) + '" style="fill:' + (sel ? '#0b0f17' : (over ? AMBER : '#C5CEDB')) + ';font-size:13px;font-weight:600;text-anchor:middle">ЛЭП 10 кВ · ' + fmt(m[k].load) + ' из ' + z.cap + ' МВт</text>';
        });

        items.forEach((it) => {
          const x = it.r[0], y = it.r[1], w = it.r[2], h = it.r[3], cx = x + w / 2;
          const c = it.on ? '#5FD6A2' : '#5B677A';
          if (it.on && it.tap.length > 9) o += '<path d="' + it.tap + '" style="fill:none;stroke:' + GREEN + ';stroke-width:3"></path>';
          o += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" style="fill:' + (it.on ? 'rgba(95,214,162,0.13)' : 'rgba(11,15,23,0.7)') + ';stroke:' + c + ';stroke-width:2;' + (it.on ? '' : 'stroke-dasharray:7 6') + '"></rect>';
          if (it.on) for (let i = 0; i < Math.floor((w - 20) / 42); i++) for (let j = 0; j < Math.floor((h - 62) / 26); j++)
            o += '<rect x="' + (x + 14 + i * 42) + '" y="' + (y + 54 + j * 26) + '" width="28" height="14" rx="2" style="fill:rgba(95,214,162,0.35)"></rect>';
          const words = it.name.split(' '), two = w < 140 && words.length > 1;
          const l1 = two ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : it.name, l2 = two ? words.slice(Math.ceil(words.length / 2)).join(' ') : '';
          o += '<text x="' + cx + '" y="' + (y + 24) + '" style="fill:' + (it.on ? '#ffffff' : '#A7B2C2') + ';font-size:15px;font-weight:600;text-anchor:middle">' + l1 + '</text>';
          if (l2) o += '<text x="' + cx + '" y="' + (y + 42) + '" style="fill:' + (it.on ? '#ffffff' : '#A7B2C2') + ';font-size:15px;font-weight:600;text-anchor:middle">' + l2 + '</text>';
          o += '<text x="' + cx + '" y="' + (y + (l2 ? 62 : 44)) + '" style="fill:' + (it.on ? '#5FD6A2' : '#A7B2C2') + ';font-size:14px;font-weight:700;text-anchor:middle">' + (it.on ? '+' + fmt(it.mw) + ' МВт' : 'не выбран') + '</text>';
        });

        const srcSel = card === 'src', sc = srcSel ? '#ffffff' : (srcOver ? AMBER : '#8b95a3');
        o += '<rect x="80" y="380" width="180" height="100" style="fill:#05070b;stroke:' + sc + ';stroke-width:' + ((srcOver || srcSel) ? 2.5 : 1.5) + ';stroke-dasharray:5 4' + (srcSel ? ';filter:drop-shadow(0 0 10px rgba(255,255,255,0.7))' : (srcOver ? ';filter:drop-shadow(0 0 10px rgba(245,160,74,0.7))' : '')) + '"></rect>' +
          '<path d="M96 430H244" style="stroke:#4FA3E0;stroke-width:5;stroke-linecap:round"></path>' +
          '<circle cx="140" cy="452" r="9" style="fill:none;stroke:#4FA3E0;stroke-width:2"></circle><circle cx="152" cy="452" r="9" style="fill:none;stroke:' + GREEN + ';stroke-width:2"></circle>' +
          '<circle cx="188" cy="452" r="9" style="fill:none;stroke:#4FA3E0;stroke-width:2"></circle><circle cx="200" cy="452" r="9" style="fill:none;stroke:' + GREEN + ';stroke-width:2"></circle>' +
          '<text x="170" y="408" style="fill:#ffffff;font-size:16px;font-weight:700;text-anchor:middle">ПС 110 кВ</text>' +
          '<rect x="74" y="350" width="192" height="24" rx="12" style="fill:#0b0f17"></rect><text x="170" y="367" style="fill:' + (srcOver ? AMBER : '#C5CEDB') + ';font-size:14px;font-weight:600;text-anchor:middle">' + (srcOver ? 'требуется реконструкция' : 'источник питания района') + '</text>';
        o += '<text x="28" y="34" style="fill:#A7B2C2;font-size:14px;font-weight:700;letter-spacing:0.06em">ДЕМОНСТРАЦИОННЫЙ РАЙОН</text>';
        svgBox.innerHTML = o + '</svg>';

        items.forEach((it) => { it.el.classList.toggle('is-on', it.on); it.el.setAttribute('aria-pressed', String(it.on)); });
        $('#planning-load').textContent = fmt(R.total) + ' из ' + SRC_CAP + ' МВт';
        const scale = 100 / (SRC_CAP * 1.6);
        $('#planning-base').style.width = (SRC_BASE * scale) + '%';
        $('#planning-add').style.width = (Math.min(R.addAll, SRC_CAP * 1.6 - SRC_BASE) * scale) + '%';
        $('#planning-add').style.background = srcOver ? AMBER : GREEN;

        KEYS.forEach((k) => {
          const b = rows[k], e = m[k];
          b.classList.toggle('is-warn', e.def > 0);
          b.children[1].textContent = e.short;
          b.children[2].textContent = e.status;
          b.children[3].textContent = money(e.cost);
        });
        $('#planning-total').textContent = money(R.cost);

        const cardEl = $('#planning-card');
        cardEl.hidden = !card;
        if (card) {
          const e = m[card];
          $('#planning-card-title').textContent = e.title;
          $('#planning-card-status').textContent = e.status;
          $('#planning-card-status').className = 'demo-card-status' + (e.def > 0 ? ' is-warn' : '');
          $('#planning-card-facts').innerHTML = e.facts.map((f) => '<div><span>' + f[0] + '</span><b>' + f[1] + '</b></div>').join('');
          $('#planning-card-works').innerHTML = e.works.length
            ? e.works.map((w) => '<li><span>' + w[0] + '</span><b>' + money(w[1]) + '</b></li>').join('')
            : '<li class="is-none"><span>Мероприятия не требуются</span><b>—</b></li>';
          $('#planning-card-cost').textContent = money(e.cost);
        }
      }
      window.addEventListener('hashchange', () => { card = null; render(); });
      render();
    })();
  }

  /* ---------- Запуск ---------- */
  function start() {
    document.querySelectorAll('[data-map]').forEach(function (el) {
      el.innerHTML = mapHTML(el.dataset.map, +el.dataset.cx, +el.dataset.cy, +el.dataset.scale);
    });
    document.querySelectorAll('[data-nav]').forEach(function (el) { el.innerHTML = navHTML(+el.dataset.nav - 1); });
    initScheme(document.getElementById('scheme'));
    initSolutions(document.getElementById('tasks'));

    var stage = document.getElementById('stage');
    var fit = function () {
      var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      stage.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
    };
    var current = 0;
    var show = function () {
      var id = (location.hash || '#intro').slice(1), idx = 0;
      SLIDES.forEach(function (s, i) { if (s.id === id) idx = i; });
      current = idx;
      SLIDES.forEach(function (s, i) { document.getElementById(s.id).classList.toggle('is-active', i === idx); });
      document.title = SLIDES[idx].name + ' — Схема электроснабжения';
    };
    window.addEventListener('resize', fit);
    window.addEventListener('hashchange', show);
    window.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (document.querySelector('.demo:not([hidden])')) return; // открыт мини-экран: стрелки нужны ему
      var d = (e.key === 'ArrowRight' || e.key === 'PageDown') ? 1 : ((e.key === 'ArrowLeft' || e.key === 'PageUp') ? -1 : 0);
      if (!d) return;
      e.preventDefault();
      location.hash = SLIDES[Math.max(0, Math.min(SLIDES.length - 1, current + d))].id;
    });
    fit(); show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
