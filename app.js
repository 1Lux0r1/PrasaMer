/* Схема электроснабжения — рабочий макет презентации. Без сборки и зависимостей. */
(function () {
  'use strict';

  var SLIDES = [
    { id: 'intro', name: 'Введение' },
    { id: 'tasks', name: 'Задачи' },
    { id: 'views', name: 'Два вида' },
    { id: 'scheme', name: 'Карта ↔ схема' },
    { id: 'data', name: 'Данные' },
    { id: 'effect', name: 'Эффект' }
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
    var dim = 'rgba(255,255,255,0.16)';
    var h = '<nav class="deck-nav" aria-label="Слайды">';
    SLIDES.forEach(function (sl, i) {
      var on = i === cur;
      h += '<a href="#' + sl.id + '" class="deck-tab' + (on ? ' is-on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="deck-tab-num">0' + (i + 1) + '</span><span>' + sl.name + '</span>' +
        '<span aria-hidden="true" class="deck-tab-l" style="background:' + (i <= cur ? '#B3263A' : dim) + '"></span>' +
        '<span aria-hidden="true" class="deck-tab-r" style="background:' + (i < cur ? '#B3263A' : dim) + '"></span>' +
        '<span aria-hidden="true" class="deck-tab-dot" style="background:' + (on ? '#FF2D46' : (i < cur ? '#B3263A' : '#5B677A')) + '"></span></a>';
    });
    var arrow = function (href, label, d, strong) {
      return '<a href="#' + href + '" aria-label="' + label + '" class="deck-arrow' + (strong ? ' is-strong' : '') + '">' +
        '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="' + d + '"></path></svg></a>';
    };
    h += '<div class="deck-arrows">' +
      arrow(SLIDES[(cur + 5) % 6].id, 'Предыдущий слайд', 'M11 4L6 9l5 5', false) +
      arrow(SLIDES[(cur + 1) % 6].id, 'Следующий слайд', 'M7 4l5 5-5 5', true) + '</div></nav>';
    return h;
  }

  /* ---------- Слайд «Карта ↔ схема» ---------- */
  function initScheme(root) {
    var $ = function (sel) { return root.querySelector(sel); };
    var state = { t: 0, view: 'map', sel: 'tp3', off: null, show: { a: true, b: true, c: true } };
    var nodes = [], byId = {}, edges = [];
    var add = function (id, type, name, parent, m, s, kind) {
      var n = { id: id, type: type, name: name, parent: parent, m: [m[0], m[1] + 100], s: s, kind: kind };
      nodes.push(n); byId[id] = n; return n;
    };
    var rad = function (d) { return d * Math.PI / 180; };
    add('ps1', 'ps', 'ПС 110 кВ № 1', null, [300, 150], [550, 120]);
    add('ps2', 'ps', 'ПС 110 кВ № 2', null, [1090, 140], [1120, 120]);
    add('rp1', 'rp', 'РП-1', 'ps1', [330, 400], [360, 330]);
    add('rp2', 'rp', 'РП-2', 'ps1', [700, 290], [740, 330]);
    add('rp3', 'rp', 'РП-3', 'ps2', [1090, 380], [1120, 330]);
    var kinds = ['Жилой дом', 'Школа', 'Жилой дом', 'Поликлиника', 'Жилой дом', 'Детский сад', 'Жилой дом', 'Жилой дом'];
    var j = 0;
    [['rp1', 190, [150, 90, 30]], ['rp2', 190, [110, 35]], ['rp3', 200, [150, 90, 30]]].forEach(function (p) {
      var rp = byId[p[0]];
      p[2].forEach(function (deg) {
        var a = rad(deg);
        var base = [rp.m[0] + p[1] * Math.cos(a), rp.m[1] - 100 + p[1] * Math.sin(a)];
        var tp = add('tp' + (j + 1), 'tp', 'ТП-10' + (j + 1), rp.id, base, [208 + 152 * j, 560]);
        [0.7, -0.7].forEach(function (da, k) {
          var i = 2 * j + k;
          add('c' + (i + 1), 'c', 'Потребитель № ' + (i + 1), tp.id,
            [base[0] + 88 * Math.cos(a + da), base[1] + 88 * Math.sin(a + da)], [170 + 76 * i, 800], kinds[i % 8]);
        });
        j++;
      });
    });
    nodes.forEach(function (n) {
      if (!n.parent) return;
      var p = byId[n.parent], A = p.m, C = n.m, dx = C[0] - A[0], dy = C[1] - A[1], ym = (p.s[1] + n.s[1]) / 2;
      edges.push({
        child: n.id, level: n.type === 'rp' ? 'a' : (n.type === 'tp' ? 'b' : 'c'),
        m: [A, [A[0] + dx * 0.35 - dy * 0.08, A[1] + dy * 0.35 + dx * 0.08], [A[0] + dx * 0.7 + dy * 0.06, A[1] + dy * 0.7 - dx * 0.06], C],
        s: [p.s, [p.s[0], ym], [n.s[0], ym], n.s]
      });
    });
    var mid = function (a, b, k, off) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + off]; };
    var r2 = byId.rp2, r3 = byId.rp3;
    var reserve = {
      m: [r2.m, mid(r2.m, r3.m, 0.33, -26), mid(r2.m, r3.m, 0.66, -26), r3.m],
      s: [r2.s, mid(r2.s, r3.s, 0.33, 0), mid(r2.s, r3.s, 0.66, 0), r3.s]
    };

    var typeName = { ps: 'Питающий центр', rp: 'Распределительный пункт', tp: 'Трансформаторная подстанция', c: 'Потребитель' };
    var volt = { ps: '110 кВ', rp: '10 кВ', tp: '10/0,4 кВ', c: '0,4 кВ' };
    var look = { ps: '#F5A04A', rp: '#7CCFD0', tp: '#9BDDB0', c: '#C5CEDB' };
    var under = function (id, top) { var n = byId[id]; while (n) { if (n.id === top) return true; n = byId[n.parent]; } return false; };
    var countDown = function (top) { return nodes.filter(function (n) { return n.type === 'c' && under(n.id, top); }).length; };
    var title = function (n) { return n.type === 'c' ? n.kind : n.name; };

    /* узлы создаются один раз */
    var box = $('#sc-nodes');
    nodes.forEach(function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-node sc-' + n.type;
      b.setAttribute('aria-label', n.name + (n.kind ? ', ' + n.kind : ''));
      b.innerHTML = '<span class="sc-shape" aria-hidden="true"></span><span class="sc-label"></span>';
      b.addEventListener('click', function () { state.sel = n.id; render(); });
      box.appendChild(b);
      n.el = b; n.shape = b.firstChild; n.label = b.lastChild;
    });

    /* переключатели уровней */
    var layerDefs = [['a', 'Питающие линии · 10 кВ', '#F0B37E'], ['b', 'Распределительная сеть · 10 кВ', '#7CCFD0'], ['c', 'Сеть 0,4 кВ и потребители', '#9BDDB0']];
    var layerBox = $('#sc-layers');
    layerDefs.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-layer';
      b.innerHTML = '<span aria-hidden="true" class="sc-layer-line" style="background:' + d[2] + '"></span><span class="sc-layer-name">' + d[1] +
        '</span><span aria-hidden="true" class="sc-layer-dot" style="border-color:' + d[2] + '"></span>';
      b.addEventListener('click', function () { state.show[d[0]] = !state.show[d[0]]; render(); });
      layerBox.appendChild(b);
      d.push(b);
    });

    function render() {
      var t = state.t, sel = state.sel, off = state.off, show = state.show;
      var L = function (a, b) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
      var dead = function (id) { return !!off && under(id, off); };
      var chain = {}, c = byId[sel];
      while (c) { chain[c.id] = true; c = byId[c.parent]; }
      var path = function (e) {
        return 'M' + e.m.map(function (p, i) { var q = L(p, e.s[i]); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L');
      };
      var d = { a: '', b: '', c: '' }, dOff = '', dSel = '';
      edges.forEach(function (e) {
        if (!show[e.level]) return;
        var p = path(e);
        if (dead(e.child)) dOff += p; else d[e.level] += p;
        if (chain[e.child]) dSel += p;
      });
      $('#sc-pA').setAttribute('d', d.a); $('#sc-pB').setAttribute('d', d.b); $('#sc-pC').setAttribute('d', d.c);
      $('#sc-pOff').setAttribute('d', dOff); $('#sc-pSel').setAttribute('d', dSel);
      $('#sc-pRes').setAttribute('d', show.a ? path(reserve) : '');
      $('#sc-mapbg').style.opacity = (1 - t).toFixed(3);
      $('#sc-schbg').style.opacity = t.toFixed(3);

      nodes.forEach(function (n) {
        var q = L(n.m, n.s), isDead = dead(n.id), isSel = n.id === sel, col = isDead ? '#FF2D46' : look[n.type];
        n.el.style.left = q[0].toFixed(1) + 'px';
        n.el.style.top = q[1].toFixed(1) + 'px';
        n.el.style.display = (n.type === 'c' && !show.c) ? 'none' : '';
        n.el.classList.toggle('is-sel', isSel);
        n.shape.style.borderColor = col;
        n.shape.style.background = n.type === 'c' ? col : '#10151f';
        n.label.textContent = n.type === 'c' ? (isSel ? n.kind : '') : n.name;
      });

      var isMap = state.view === 'map';
      $('#sc-title-map').hidden = !isMap; $('#sc-title-scheme').hidden = isMap;
      $('#sc-to-map').classList.toggle('is-on', isMap); $('#sc-to-map').setAttribute('aria-pressed', String(isMap));
      $('#sc-to-scheme').classList.toggle('is-on', !isMap); $('#sc-to-scheme').setAttribute('aria-pressed', String(!isMap));
      layerDefs.forEach(function (ld) {
        var on = show[ld[0]];
        ld[3].classList.toggle('is-on', on); ld[3].setAttribute('aria-pressed', String(on));
        ld[3].querySelector('.sc-layer-dot').style.background = on ? ld[2] : 'transparent';
      });

      var sn = byId[sel], selDead = dead(sel), selIsOff = off === sel;
      $('#sc-name').textContent = title(sn);
      $('#sc-type').textContent = typeName[sn.type];
      $('#sc-volt').textContent = volt[sn.type];
      $('#sc-from').textContent = sn.parent ? byId[sn.parent].name : 'внешняя сеть';
      $('#sc-down').textContent = sn.type === 'c' ? '—' : String(countDown(sel));
      $('#sc-state').textContent = selDead ? 'Без питания' : 'Под напряжением';
      $('#sc-state').style.color = selDead ? '#FF8A99' : '#5FD6A2';
      var btn = $('#sc-off-btn');
      btn.textContent = selIsOff ? 'Вернуть питание' : 'Смоделировать отключение';
      btn.classList.toggle('is-off', selIsOff);
      var note = $('#sc-off-note');
      note.hidden = !off;
      if (off) note.textContent = 'Отключён: ' + title(byId[off]) + '. Потребителей без питания: ' + countDown(off) + '.';
    }

    var raf = 0;
    function go(view) {
      var target = view === 'scheme' ? 1 : 0, from = state.t, t0 = performance.now(), dur = 1100;
      cancelAnimationFrame(raf);
      state.view = view;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { state.t = target; render(); return; }
      var step = function (now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        state.t = from + (target - from) * e;
        render();
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    $('#sc-to-map').addEventListener('click', function () { go('map'); });
    $('#sc-to-scheme').addEventListener('click', function () { go('scheme'); });
    $('#sc-off-btn').addEventListener('click', function () { state.off = state.off === state.sel ? null : state.sel; render(); });
    render();
  }

  /* ---------- Запуск ---------- */
  function start() {
    document.querySelectorAll('[data-map]').forEach(function (el) {
      el.innerHTML = mapHTML(el.dataset.map, +el.dataset.cx, +el.dataset.cy, +el.dataset.scale);
    });
    document.querySelectorAll('[data-nav]').forEach(function (el) { el.innerHTML = navHTML(+el.dataset.nav - 1); });
    initScheme(document.getElementById('scheme'));

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
      var d = (e.key === 'ArrowRight' || e.key === 'PageDown') ? 1 : ((e.key === 'ArrowLeft' || e.key === 'PageUp') ? -1 : 0);
      if (!d) return;
      e.preventDefault();
      location.hash = SLIDES[Math.max(0, Math.min(SLIDES.length - 1, current + d))].id;
    });
    fit(); show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
