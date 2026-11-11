(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const slides = $$('.slide');
  const names = ['О системе', 'Данные', 'Карта ↔ схема', 'Область применения', 'Эффект'];
  const ids = slides.map(s => s.id);
  let current = Math.max(0, ids.indexOf(location.hash.slice(1)));
  let lock = false, demoOpen = false, lastFocus = null;

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    const stage = $('#stage');
    stage.style.transform = 'scale(' + s + ')';
    stage.style.left = ((innerWidth - 1920 * s) / 2) + 'px';
    stage.style.top = ((innerHeight - 1080 * s) / 2) + 'px';
  }
  function update() {
    slides.forEach((s, i) => { s.classList.toggle('active', i === current); s.setAttribute('aria-hidden', i === current ? 'false' : 'true'); });
    $('#counter').textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    $('#slide-name').textContent = names[current];
    $('#prev').disabled = current === 0;
    $('#next').disabled = current === slides.length - 1;
    $('#prev').setAttribute('aria-label', current ? 'Предыдущий слайд: ' + names[current - 1] : 'Предыдущий слайд недоступен');
    $('#next').setAttribute('aria-label', current < slides.length - 1 ? 'Следующий слайд: ' + names[current + 1] : 'Следующий слайд недоступен');
    $$('#dots button').forEach((b, i) => { b.classList.toggle('active', i === current); if (i === current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    history.replaceState(null, '', '#' + ids[current]);
  }
  function go(n) {
    if (lock || demoOpen) return;
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === current) return;
    lock = true; current = n; update(); setTimeout(() => { lock = false; }, 560);
  }
  $('#prev').addEventListener('click', () => go(current - 1));
  $('#next').addEventListener('click', () => go(current + 1));
  names.forEach((name, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.title = name; b.setAttribute('aria-label', 'Слайд ' + (i + 1) + ': ' + name);
    b.addEventListener('click', () => go(i)); $('#dots').appendChild(b);
  });
  $$('[data-nav]').forEach(h => { h.style.pointerEvents = 'none'; });
  document.addEventListener('click', e => {
    if (demoOpen) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const n = ids.indexOf(a.getAttribute('href').slice(1));
    if (n >= 0) { e.preventDefault(); go(n); }
  });
  document.addEventListener('keydown', e => {
    if (demoOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeDemo(); }
      if (e.key === 'Tab') {
        const f = $$('button:not([disabled]), input:not([disabled]), [tabindex="0"]', $('.demo:not([hidden])')).filter(x => x.getClientRects().length);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(current + 1); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(current - 1); }
    if (e.key === 'Home') { e.preventDefault(); go(0); }
    if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });
  let tx = 0, ty = 0;
  addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (demoOpen || e.target.closest('.demo, input, button')) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.4) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  addEventListener('resize', fit);

  function mapSVG(host) {
    const scale = +host.dataset.scale, cx = +host.dataset.cx, cy = +host.dataset.cy;
    host.innerHTML = '<img class="map-img" src="img/moscow-base.svg" alt="" style="left:' + (960 - cx * scale / 100) + 'px;top:' + (540 - cy * scale / 100) + 'px;width:' + (48 * scale) + 'px;height:' + (28.2 * scale) + 'px">';
  }
  $$('[data-map]').forEach(mapSVG);

  const HL = new WeakMap();
  $$('#data [data-src]').forEach(src => {
    const key = src.dataset.src;
    const targets = $$('[data-of~="' + key + '"]', $('#data'));
    function on() {
      targets.forEach(t => { const old = HL.get(t) || 0; HL.set(t, old + 1); t.style.setProperty('--hl', src.dataset.color || '#fff'); t.classList.add('is-hl'); });
      src.classList.add('is-hl');
      if (src.dataset.kpi === 'consumers') { const k = $('[data-kpi="consumers"]'); k.style.setProperty('--hl', src.dataset.color); k.classList.add('is-hl'); }
      else { const k = $('[data-kpi="objects"]'); k.style.setProperty('--hl', src.dataset.color); k.classList.add('is-hl'); const note = $('[data-kpi-note]'); if (note) note.textContent = src.dataset.note || ''; }
    }
    function off() {
      targets.forEach(t => { const n = Math.max(0, (HL.get(t) || 1) - 1); HL.set(t, n); if (!n) t.classList.remove('is-hl'); });
      src.classList.remove('is-hl');
      $$('#data [data-kpi]').forEach(k => k.classList.remove('is-hl'));
      const note = $('[data-kpi-note]'); if (note) note.textContent = '';
    }
    src.addEventListener('pointerenter', on); src.addEventListener('pointerleave', off);
    src.addEventListener('focus', on); src.addEventListener('blur', off);
    src.addEventListener('click', () => { if (src.classList.contains('is-hl')) off(); else on(); });
  });

  function powerCore() {
    const host = $('#sc-nodes'); if (!host) return;
    const CLR = { 500: '#FF3D55', 220: '#F2C94C', 110: '#56B4E9', 10: '#59C27A', gen: '#C77DD6' };
    const M = 40, DX = 50, DY = 65;
    const N = (x, y) => ({ x: M + x * DX, y: M + y * DY });
    const nodes = [
      { id: 'c1', name: 'ЦП 500 кВ · А', type: 'Центр питания', cls: 500, buses: true, p: N(10, 1) },
      { id: 'c2', name: 'ЦП 500 кВ · Б', type: 'Центр питания', cls: 500, buses: true, p: N(20, 1) },
      { id: 'g1', name: 'Генерация · А', type: 'Источник генерации', cls: 500, gen: true, p: N(4, 1) },
      { id: 'g2', name: 'Генерация · Б', type: 'Источник генерации', cls: 500, gen: true, p: N(26, 1) },
      { id: 'a1', name: 'ПС 220 кВ · А', type: 'Подстанция', cls: 220, buses: true, p: N(5, 6) },
      { id: 'a2', name: 'ПС 220 кВ · Б', type: 'Подстанция', cls: 220, buses: true, p: N(13, 6) },
      { id: 'a3', name: 'ПС 220 кВ · В', type: 'Подстанция', cls: 220, buses: true, p: N(22, 6) },
      { id: 'b1', name: 'ПС 110 кВ · А', type: 'Подстанция', cls: 110, p: N(2, 11) },
      { id: 'b2', name: 'ПС 110 кВ · Б', type: 'Подстанция', cls: 110, p: N(8, 11) },
      { id: 'b3', name: 'ПС 110 кВ · В', type: 'Подстанция', cls: 110, p: N(15, 11) },
      { id: 'b4', name: 'ПС 110 кВ · Г', type: 'Подстанция', cls: 110, p: N(23, 11) }
    ];
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    const edges = [
      ['g1', 'c1', 500], ['g2', 'c2', 500], ['c1', 'c2', 500],
      ['c1', 'a1', 220], ['c1', 'a2', 220], ['c2', 'a2', 220], ['c2', 'a3', 220], ['a1', 'a2', 220], ['a2', 'a3', 220],
      ['a1', 'b1', 110], ['a1', 'b2', 110], ['a2', 'b2', 110], ['a2', 'b3', 110], ['a3', 'b3', 110], ['a3', 'b4', 110], ['b2', 'b3', 110]
    ].map((e, i) => ({ id: 'e' + i, a: e[0], b: e[1], cls: e[2], off: false }));
    let sel = 'a2', mode = 'map', layers = { 500: true, 220: true, 110: true };
    const shown = n => layers[n.cls] && (mode === 'map' || n.cls !== 500 || !n.gen);
    const path = e => {
      const a = byId[e.a].p, b = byId[e.b].p;
      if (mode === 'map') return 'M' + a.x + ' ' + a.y + 'L' + b.x + ' ' + b.y;
      const mid = (a.y + b.y) / 2;
      return 'M' + a.x + ' ' + a.y + 'V' + mid + 'H' + b.x + 'V' + b.y;
    };
    function nodePos(n) { return mode === 'map' ? n.p : { x: n.p.x, y: n.p.y }; }
    function draw() {
      ['110', '220', '500'].forEach(c => { $('#sc-p' + c).setAttribute('d', edges.filter(e => String(e.cls) === c && shown(byId[e.a]) && shown(byId[e.b]) && !e.off).map(path).join('')); });
      $('#sc-pDead').setAttribute('d', edges.filter(e => e.off && shown(byId[e.a]) && shown(byId[e.b])).map(path).join(''));
      const se = edges.filter(e => !e.off && (e.a === sel || e.b === sel) && shown(byId[e.a]) && shown(byId[e.b]));
      $('#sc-pSel').setAttribute('d', se.map(path).join(''));
      host.innerHTML = '';
      nodes.filter(shown).forEach(n => {
        const p = nodePos(n), b = document.createElement('button');
        b.type = 'button'; b.className = 'sc-node' + (n.id === sel ? ' selected' : ''); b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
        const col = n.gen ? CLR.gen : CLR[n.cls];
        const connected = edges.some(e => !e.off && (e.a === n.id || e.b === n.id));
        b.style.setProperty('--c', connected ? col : '#6b7480');
        b.setAttribute('aria-label', n.name + (n.id === sel ? ', выбран' : ''));
        if (n.id === sel) b.setAttribute('aria-pressed', 'true'); else b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="sc-mark ' + (n.buses ? 'bus' : n.gen ? 'gen' : 'sub') + '"></span><span class="sc-node-label">' + n.name + '</span>';
        b.addEventListener('click', () => { sel = n.id; if (mode === 'object') mode = 'map'; draw(); });
        b.addEventListener('dblclick', () => { sel = n.id; mode = 'object'; draw(); });
        host.appendChild(b);
      });
      const n = byId[sel], con = edges.filter(e => e.a === sel || e.b === sel), live = con.filter(e => !e.off);
      $('#sc-name').textContent = n.name; $('#sc-type').textContent = n.type;
      $('#sc-cls').textContent = n.cls + ' кВ'; $('#sc-conn').textContent = con.length + ' · активных ' + live.length;
      $('#sc-state').textContent = live.length ? 'Под напряжением' : 'Без напряжения'; $('#sc-state').style.color = live.length ? '#9BDDB0' : '#FF8A99';
      $('#sc-off-btn').textContent = live.length === con.length ? 'Отключить присоединения' : 'Вернуть под напряжение';
      $('#sc-open-btn').textContent = mode === 'object' ? 'Вернуться к сети' : 'Открыть схему объекта';
      $('#sc-off-note').hidden = live.length > 0;
      $('#sc-off-note').textContent = 'Объект и связанные линии обесточены. Возвращение под напряжение выполняется кнопкой в паспорте.';
      const detail = mode === 'object';
      $('#sc-detail').style.opacity = detail ? 1 : 0; $('#sc-detail').style.visibility = detail ? 'visible' : 'hidden'; $('#sc-detail').style.pointerEvents = detail ? 'auto' : 'none';
      $('#sc-net').style.opacity = detail ? 0 : 1; $('#sc-net').style.visibility = detail ? 'hidden' : 'visible';
      $('#sc-mapbg').style.opacity = mode === 'map' ? 1 : 0;
      ['map', 'scheme', 'object'].forEach(v => { $('#sc-title-' + v).hidden = v !== mode; $('#sc-to-' + v).classList.toggle('on', v === mode); $('#sc-to-' + v).setAttribute('aria-pressed', v === mode ? 'true' : 'false'); });
      if (detail) drawDetail(n);
    }
    function drawDetail(n) {
      const cx = 690, hiY = 270, loY = 650, hi = n.cls, lo = hi === 500 ? 220 : hi === 220 ? 110 : 10;
      const hc = CLR[hi], lc = CLR[lo];
      const incoming = edges.filter(e => e.a === n.id || e.b === n.id).length;
      const xs = [cx - 390, cx - 130, cx + 130, cx + 390];
      let thin = '', bus = '', fill = '', labels = '';
      for (let i = 0; i < 4; i++) {
        const x = xs[i], active = i < Math.max(2, Math.min(4, incoming));
        thin += 'M' + x + ' 70V' + hiY + 'M' + x + ' ' + hiY + 'V' + (hiY + 110) + 'M' + x + ' ' + loY + 'V920';
        if (i < 2) {
          thin += 'M' + x + ' ' + (hiY + 110) + 'V430H' + (cx + (i ? 120 : -120)) + 'V' + loY;
          fill += 'M' + (cx + (i ? 120 : -120) - 34) + ' 470h68v90h-68z';
        }
        labels += '<span style="left:' + x + 'px;top:36px">Ввод ' + (i + 1) + ' · ' + hi + ' кВ</span>';
        labels += '<span style="left:' + x + 'px;top:925px">ЛЭП ' + lo + ' кВ · фидер ' + (i + 1) + '</span>';
      }
      bus = 'M' + (cx - 450) + ' ' + hiY + 'H' + (cx + 450) + 'M' + (cx - 450) + ' ' + loY + 'H' + (cx + 450);
      $('#sc-d-hiThin').setAttribute('d', thin); $('#sc-d-hiThin').style.stroke = hc;
      $('#sc-d-loThin').setAttribute('d', ''); $('#sc-d-hiBus').setAttribute('d', bus); $('#sc-d-hiBus').style.stroke = hc; $('#sc-d-loBus').setAttribute('d', '');
      $('#sc-d-hiFill').setAttribute('d', fill); $('#sc-d-hiFill').style.fill = hc; $('#sc-d-hiFill').style.opacity = 0.18;
      $('#sc-d-loFill').setAttribute('d', '');
      const extra = '<path d="M' + (cx - 450) + ' ' + loY + 'H' + (cx + 450) + '" style="fill:none;stroke:' + lc + ';stroke-width:4"></path>' + xs.map(x => '<path d="M' + x + ' ' + loY + 'V920" style="fill:none;stroke:' + lc + ';stroke-width:1.5"></path>').join('');
      $('#sc-detail svg').insertAdjacentHTML('beforeend', '<g id="sc-d-temp">' + extra + '</g>');
      const old = $$('#sc-d-temp'); old.slice(0, -1).forEach(x => x.remove());
      $('#sc-d-title').textContent = n.name + ' · условная однолинейная схема';
      $('#sc-d-title').style.borderColor = hc;
      $('#sc-d-labels').innerHTML = labels + '<span style="left:' + cx + 'px;top:440px;transform:translateX(-50%);color:' + lc + '">Трансформаторы ' + hi + '/' + lo + ' кВ</span>';
    }
    Object.keys(layers).forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = c + ' кВ'; b.style.setProperty('--c', CLR[c]); b.className = 'on'; b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', () => { layers[c] = !layers[c]; b.classList.toggle('on', layers[c]); b.setAttribute('aria-pressed', String(layers[c])); if (!shown(byId[sel])) { const n = nodes.find(shown); if (n) sel = n.id; } if (mode === 'object' && !layers[byId[sel].cls]) mode = 'map'; draw(); });
      $('#sc-layers').appendChild(b);
    });
    $('#sc-to-map').onclick = () => { mode = 'map'; draw(); };
    $('#sc-to-scheme').onclick = () => { mode = 'scheme'; draw(); };
    $('#sc-to-object').onclick = () => { mode = 'object'; draw(); };
    $('#sc-open-btn').onclick = () => { mode = mode === 'object' ? 'map' : 'object'; draw(); };
    $('#sc-off-btn').onclick = () => { const con = edges.filter(e => e.a === sel || e.b === sel), turnOff = con.some(e => !e.off); con.forEach(e => { e.off = turnOff; }); draw(); };
    draw();
  }
  powerCore();

  function openDemo(key) {
    lastFocus = document.activeElement; demoOpen = true;
    $('#demo-scrim').hidden = false; $('#demo-' + key).hidden = false;
    $('#chrome').inert = true;
    slides.forEach(s => { s.inert = true; });
    $('#demo-' + key + ' .demo-close').focus();
  }
  function closeDemo() {
    $$('.demo').forEach(d => { d.hidden = true; }); $('#demo-scrim').hidden = true; demoOpen = false;
    $('#chrome').inert = false; slides.forEach(s => { s.inert = false; });
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-demo]').forEach(b => b.addEventListener('click', () => openDemo(b.dataset.demo)));
  $$('.demo-close').forEach(b => b.addEventListener('click', closeDemo));
  $('#demo-scrim').addEventListener('click', closeDemo);

  function initSolutions() {
    const Y = '#F2C94C', B = '#56B4E9', GREEN = '#59C27A', GRAY = '#6b7480', MUTED = '#A7B2C2';
    const wire = (d, c, extra) => '<path d="' + d + '" style="fill:none;stroke:' + c + ';stroke-width:2;stroke-linejoin:round" ' + (extra || '') + '></path>';
    const box = (x, y, w, h, c, text, extra) => '<g ' + (extra || '') + '><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" style="fill:#182233;stroke:' + c + ';stroke-width:2"></rect><text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 6) + '" text-anchor="middle" style="fill:#fff;font-size:17px;font-weight:600">' + text + '</text></g>';
    const homes = (pts, off) => pts.map((p, i) => '<g style="color:' + (off ? GRAY : '#D5DCE6') + '"><path d="M' + p[0] + ' ' + p[1] + 'l14-12 14 12v24h-28z" style="fill:' + (off ? '#202632' : '#26394b') + ';stroke:currentColor;stroke-width:1.5"></path><text x="' + (p[0] + 14) + '" y="' + (p[1] + 45) + '" text-anchor="middle" style="fill:' + (off ? GRAY : MUTED) + ';font-size:12px">' + (off ? 'нет питания' : 'дома') + '</text></g>').join('');
    let phase = 0;
    const groups = { a: [[650, 380], [740, 400], [820, 380], [650, 490], [740, 510], [820, 490]], b: [[170, 390], [260, 410], [350, 390], [170, 500], [260, 520], [350, 500]] };
    function outageDraw() {
      const f = { x: 410 };
      const offA = phase >= 1, restored = phase >= 2;
      let o = '<svg viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="Демонстрация последствий аварии">';
      o += '<text x="30" y="34" style="fill:#A7B2C2;font-size:14px;letter-spacing:2px">ДЕМОНСТРАЦИОННАЯ СЕТЬ · 110/10 КВ</text>';
      o += box(80, 80, 220, 70, B, 'ПС 110 кВ · А') + box(680, 80, 220, 70, B, 'ПС 110 кВ · Б');
      o += wire('M190 150V220H410', B) + wire('M790 150V220H590', B) + wire('M410 220H590', offA && !restored ? GRAY : Y, offA && !restored ? 'stroke-dasharray="7 6"' : '');
      o += box(f.x, 190, 180, 60, offA && !restored ? '#FF3D55' : Y, 'РП 10 кВ');
      o += wire('M' + f.x + ' 328V420', GREEN, offA && !restored ? 'stroke-dasharray="7 6"' : '') + box(f.x, 300, 150, 56, B, 'ПС 110 кВ', offA && !restored ? 'opacity=".55"' : '');
      o += wire('M340 328H170V360', GREEN) + wire('M560 328H740V360', GREEN, offA && !restored ? 'stroke-dasharray="7 6"' : '');
      o += homes(groups.b, false) + homes(groups.a, offA && !restored);
      o += '<g><rect x="350" y="535" width="300" height="38" rx="19" style="fill:' + (restored ? 'rgba(89,194,122,.14)' : offA ? 'rgba(255,61,85,.14)' : 'rgba(255,255,255,.05)') + ';stroke:' + (restored ? GREEN : offA ? '#FF3D55' : GRAY) + '"></rect><text x="500" y="560" text-anchor="middle" style="fill:' + (restored ? GREEN : offA ? '#FF8A99' : MUTED) + ';font-size:16px;font-weight:600">' + (restored ? 'Питание восстановлено через ПС 110 кВ · Б' : offA ? 'Авария: группа потребителей обесточена' : 'Нормальный режим · все потребители под напряжением') + '</text></g></svg>';
      $('#outage-stage').innerHTML = o;
      $('#outage-step').textContent = ['Шаг 1 · Нормальный режим', 'Шаг 2 · Отключение РП 10 кВ', 'Шаг 3 · Переключение на резерв'][phase];
      $('#outage-text').textContent = ['Система видит топологические связи каждого потребителя и источники его питания.', 'После отключения решение подсвечивает затронутую группу и рассчитывает последствия по типам объектов.', 'Система предлагает альтернативный источник и показывает, какие потребители можно вернуть под напряжение.'][phase];
      $('#outage-n1').textContent = phase === 1 ? '1 240' : '0'; $('#outage-n2').textContent = phase === 1 ? '6' : '0'; $('#outage-n3').textContent = phase === 1 ? '3' : '0';
      $('#outage-btn').textContent = phase === 0 ? 'Смоделировать аварию' : phase === 1 ? 'Выполнить переключение' : 'Вернуть исходный режим';
    }
    $('#outage-btn').onclick = () => { phase = (phase + 1) % 3; outageDraw(); }; outageDraw();

    const temps = [-30, -20, -10, 0, 10, 20, 30, 35];
    const loads = [94, 87, 79, 70, 62, 65, 76, 89];
    function forecastDraw(t) {
      const peak = Math.round(70 + Math.max(0, -t) * 0.8 + Math.max(0, t - 18) * 1.2);
      const res = Math.max(0, 100 - peak), over = peak > 90;
      const pts = temps.map((x, i) => [80 + i * 116, 450 - loads[i] * 3.6]);
      let o = '<svg viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="Прогноз потребления по температуре">';
      o += '<text x="60" y="45" style="fill:#A7B2C2;font-size:14px;letter-spacing:2px">СУТОЧНЫЙ ПИК · % ОТ РАСПОЛАГАЕМОЙ МОЩНОСТИ</text>';
      [25, 50, 75, 100].forEach(v => { const y = 450 - v * 3.6; o += wire('M70 ' + y + 'H940', '#344258') + '<text x="52" y="' + (y + 5) + '" text-anchor="end" style="fill:#A7B2C2;font-size:13px">' + v + '</text>'; });
      const py = 450 - peak * 3.6;
      o += '<path d="M' + pts.map(p => p.join(' ')).join('L') + '" style="fill:none;stroke:#56B4E9;stroke-width:4;stroke-linejoin:round"></path>';
      o += pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" style="fill:#56B4E9"></circle>').join('');
      o += wire('M70 ' + py + 'H940', over ? '#FF3D55' : GREEN, 'stroke-dasharray="8 7"');
      o += '<g><rect x="680" y="' + (py - 54) + '" width="250" height="40" rx="8" style="fill:#1d2636;stroke:' + (over ? '#FF3D55' : GREEN) + '"></rect><text x="805" y="' + (py - 28) + '" text-anchor="middle" style="fill:#fff;font-size:17px">При ' + t + ' °C · пик ' + peak + '%</text></g>';
      temps.forEach((x, i) => { o += '<text x="' + (80 + i * 116) + '" y="490" text-anchor="middle" style="fill:#A7B2C2;font-size:13px">' + x + '°</text>'; });
      o += '</svg>'; $('#forecast-stage').innerHTML = o;
      $('#forecast-t').textContent = t + ' °C'; $('#forecast-peak').textContent = peak + '%'; $('#forecast-peak-l').textContent = 'ожидаемый пик нагрузки';
      $('#forecast-res').textContent = res + '%'; $('#forecast-res-l').textContent = 'расчётный резерв мощности';
      $('#forecast-verdict').textContent = over ? 'Внимание: резерв ниже 10%. Нужны меры по ограничению пика.' : 'Расчётного резерва достаточно для прогнозируемого пика.';
      $('#forecast-verdict').style.color = over ? '#FF8A99' : GREEN;
    }
    $('#forecast-range').addEventListener('input', e => forecastDraw(+e.target.value)); forecastDraw(-5);

    const devs = [
      { id: 'housing', name: 'Жилой квартал', load: 18, desc: '12 жилых домов · 4 800 квартир', works: ['ЛЭП 10 кВ · 3,2 км', 'РП 10 кВ · 1 шт.', 'ТП 10/0,4 кВ · 8 шт.'], cost: '278,4 млн ₽', obj: 'РП 10 кВ + 8 ТП' },
      { id: 'school', name: 'Школа и детский сад', load: 3, desc: 'Школа на 1 200 мест · детский сад на 280 мест', works: ['ЛЭП 10 кВ · 0,8 км', 'ТП 10/0,4 кВ · 2 шт.'], cost: '37,6 млн ₽', obj: '2 ТП 10/0,4 кВ' },
      { id: 'business', name: 'Деловой центр', load: 12, desc: 'Офисы и общественные функции · 95 000 м²', works: ['ЛЭП 10 кВ · 1,6 км', 'РП 10 кВ · 1 шт.', 'ТП 10/0,4 кВ · 4 шт.'], cost: '165,2 млн ₽', obj: 'РП 10 кВ + 4 ТП' }
    ];
    const active = new Set(['housing']); let selected = null;
    function planningDraw() {
      const sum = devs.filter(d => active.has(d.id)).reduce((a, d) => a + d.load, 0), base = 31, total = base + sum, pct = total / 80 * 100;
      let o = '<svg viewBox="0 0 1000 600" width="1000" height="600" role="img" aria-label="Планирование застройки и необходимые объекты">';
      o += '<text x="36" y="40" style="fill:#A7B2C2;font-size:14px;letter-spacing:2px">УСЛОВНЫЙ РАЙОН · ПЛАНИРУЕМАЯ ЗАСТРОЙКА</text>';
      o += '<path d="M0 150H1000M0 500H1000M160 0V600M820 0V600" style="stroke:#344258;stroke-width:18;opacity:.55"></path>';
      o += '<path d="M96 430H244" style="stroke:#56B4E9;stroke-width:5;stroke-linecap:round"></path>' + box(38, 390, 130, 60, B, 'ПС 110 кВ');
      const coords = { housing: [380, 180], school: [640, 330], business: [360, 390] };
      devs.forEach(d => {
        const p = coords[d.id], on = active.has(d.id);
        o += '<path d="M244 430V' + p[1] + 'H' + p[0] + '" style="fill:none;stroke:' + (on ? GREEN : GRAY) + ';stroke-width:2;stroke-dasharray:' + (on ? '0' : '7 6') + '"></path>';
        o += '<g data-dev="' + d.id + '" style="cursor:pointer;opacity:' + (on ? 1 : .45) + '"><rect x="' + p[0] + '" y="' + (p[1] - 48) + '" width="220" height="96" rx="8" style="fill:#1d2636;stroke:' + (on ? GREEN : GRAY) + ';stroke-width:2"></rect><text x="' + (p[0] + 110) + '" y="' + (p[1] - 8) + '" text-anchor="middle" style="fill:#fff;font-size:18px;font-weight:600">' + d.name + '</text><text x="' + (p[0] + 110) + '" y="' + (p[1] + 22) + '" text-anchor="middle" style="fill:' + (on ? GREEN : MUTED) + ';font-size:16px">+' + d.load + ' МВА</text></g>';
        if (on && d.id !== 'school') o += box(p[0] + 15, p[1] + 70, 190, 44, GREEN, d.id === 'housing' ? 'РП 10 кВ + 8 ТП' : 'РП 10 кВ + 4 ТП');
      });
      o += '<circle cx="140" cy="452" r="9" style="fill:none;stroke:#56B4E9;stroke-width:2"></circle><circle cx="152" cy="452" r="9" style="fill:none;stroke:' + GREEN + ';stroke-width:2"></circle>';
      o += '<circle cx="188" cy="452" r="9" style="fill:none;stroke:#56B4E9;stroke-width:2"></circle><circle cx="200" cy="452" r="9" style="fill:none;stroke:' + GREEN + ';stroke-width:2"></circle>';
      o += '<text x="45" y="565" style="fill:#A7B2C2;font-size:14px">Зелёным — новые объекты электроснабжения</text></svg>';
      $('#planning-stage').innerHTML = o;
      $$('[data-dev]', $('#planning-stage')).forEach(g => g.addEventListener('click', () => { selected = g.dataset.dev; planningDraw(); }));
      $('#planning-toggles').innerHTML = devs.map(d => '<label class="demo-check"><input type="checkbox" data-toggle="' + d.id + '" ' + (active.has(d.id) ? 'checked' : '') + '><span>' + d.name + '</span><b>+' + d.load + ' МВА</b></label>').join('');
      $$('[data-toggle]').forEach(i => i.addEventListener('change', () => { if (i.checked) active.add(i.dataset.toggle); else active.delete(i.dataset.toggle); if (selected && !active.has(selected)) selected = null; planningDraw(); }));
      $('#planning-load').textContent = total + ' / 80 МВА'; $('#planning-base').style.width = Math.min(100, base / 80 * 100) + '%'; $('#planning-add').style.width = Math.min(100 - base / 80 * 100, sum / 80 * 100) + '%';
      $('#planning-total').textContent = sum + ' МВА новой нагрузки';
      $('#planning-objects').innerHTML = active.size ? devs.filter(d => active.has(d.id)).map(d => '<button type="button" data-object="' + d.id + '">' + d.obj + '<span>→</span></button>').join('') : '<p>Выберите объект застройки.</p>';
      $$('[data-object]').forEach(b => b.addEventListener('click', () => { selected = b.dataset.object; planningDraw(); }));
      const card = $('#planning-card'); card.hidden = !selected;
      if (selected) {
        const d = devs.find(x => x.id === selected);
        $('#planning-card-title').textContent = d.name; $('#planning-card-status').textContent = pct > 90 ? 'Требуется расширение источника' : 'Резерва источника достаточно';
        $('#planning-card-status').style.color = pct > 90 ? '#FF8A99' : GREEN;
        $('#planning-card-facts').innerHTML = '<span>' + d.desc + '</span><b>+' + d.load + ' МВА</b>';
        $('#planning-card-works').innerHTML = d.works.map(w => '<li>' + w + '</li>').join(''); $('#planning-card-cost').textContent = d.cost;
      }
    }
    $('#planning-card-back').onclick = () => { selected = null; planningDraw(); }; planningDraw();
  }
  initSolutions();

  fit(); update();
})();
